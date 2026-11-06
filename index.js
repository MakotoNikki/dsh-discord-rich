/**
 * dsh-discord-rich — Discord Rich Presence for DeepSeek Harness.
 *
 * Host half: folds the profile's session projection cache into "tokens today",
 * reads the open chat's title and tokens, watches running agents, and publishes
 * all of it to the local Discord client over its IPC pipe. The settings page
 * reads and writes the same values through a loopback-only route.
 */
import { mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { homedir, tmpdir } from 'node:os';
import net from 'node:net';

const VERSION = '0.3.0';
const API_PREFIX = '/discord-rich/api';
const SUMMARY_TTL_MS = 20_000;
const TICK_MS = 15_000;
const DAY_MS = 86_400_000;
const PIPE_ATTEMPTS = 10;

const DEFAULT_CONFIG = {
  enabled: true,
  clientId: '1567993796355031070',
  language: 'en',
  showProject: true,
  showStatus: true,
  showTokens: true,
  showTimer: true,
  largeImage: '',
  largeText: '',
};

function logOf(ctx) {
  const logger = ctx.logger;
  return {
    info: (message) => logger?.info?.(message),
    warn: (message) => logger?.warn?.(message),
  };
}

function dayKeyOf(ts) {
  const date = new Date(ts);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTokens(value) {
  const n = Number.isFinite(value) ? Math.max(0, value) : 0;
  if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1).replace(/\.0$/, '')}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '')}k`;
  return String(Math.round(n));
}

function trimText(value, max) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function shellDirectoryName(cwd) {
  const name = basename(cwd).replace(/[\\/]+$/, '');
  if (name === '' || /^(desktop|documents|downloads|home)$/i.test(name)) return '';
  return name;
}

function normalizeSessionId(value) {
  return typeof value === 'string'
    ? value.trim().replace(/^session-/, '').replace(/\.json$/, '')
    : '';
}

function isLoopback(address) {
  return address === '127.0.0.1'
    || address === '::1'
    || address === '::ffff:127.0.0.1'
    || (typeof address === 'string' && address.startsWith('127.'));
}

function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(text);
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('body is too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('body is not valid JSON'));
      }
    });
    req.on('error', () => reject(new Error('failed to read the request body')));
  });
}

function sanitizeConfig(input, base) {
  const next = { ...base };
  if (input === null || typeof input !== 'object') return next;
  if (typeof input.clientId === 'string') {
    next.clientId = input.clientId.replace(/[^0-9]/g, '').slice(0, 25);
  }
  if (['en', 'ru', 'zh'].includes(input.language)) next.language = input.language;
  if (!['en', 'ru', 'zh'].includes(next.language)) next.language = DEFAULT_CONFIG.language;
  for (const key of ['enabled', 'showProject', 'showStatus', 'showTokens', 'showTimer']) {
    if (typeof input[key] === 'boolean') next[key] = input[key];
  }
  if (typeof input.largeImage === 'string') next.largeImage = trimText(input.largeImage.trim(), 64);
  if (typeof input.largeText === 'string') next.largeText = trimText(input.largeText.trim(), 128);
  return next;
}

async function loadConfig(path) {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8'));
    return sanitizeConfig(parsed, DEFAULT_CONFIG);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

async function saveConfig(path, config) {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  await rename(temp, path);
}

async function readUsage(dir, activeId = '') {
  let names;
  try {
    names = (await readdir(dir)).filter((name) => name.endsWith('.json'));
  } catch {
    return {
      available: false,
      todayTokens: 0,
      todaySessions: 0,
      sessionTokens: 0,
      sessionTitle: '',
      project: '',
      projectPath: '',
      updatedAt: Date.now(),
    };
  }

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dailyNames = [];
  let newest = null;
  for (const name of names) {
    let mtimeMs = 0;
    try {
      mtimeMs = (await stat(join(dir, name))).mtimeMs;
    } catch {
      continue;
    }
    // ponytail: today's files only; a Session active today touches its cache today.
    if (mtimeMs >= dayStart.getTime()) dailyNames.push(name);
    if (newest === null || mtimeMs > newest.mtimeMs) newest = { name, mtimeMs };
  }

  const activeName = activeId === '' ? '' : `session-${activeId}.json`;
  const wanted = new Set(dailyNames);
  if (activeName !== '') wanted.add(activeName);
  else if (newest !== null) wanted.add(newest.name);

  const todayKey = dayKeyOf(Date.now());
  let todayTokens = 0;
  let todaySessions = 0;
  let latest = null;
  let active = null;

  for (const name of wanted) {
    let parsed;
    try {
      parsed = JSON.parse(await readFile(join(dir, name), 'utf8'));
    } catch {
      continue;
    }
    const record = parsed?.record;
    const identity = record?.identity;
    const rows = record?.rows;
    if (identity === undefined || rows === undefined) continue;

    const totals = rows?.tokenUsage?.val?.totals;
    const tokens = totals === undefined
      ? 0
      : (totals.uncachedInputTokens ?? 0)
        + (totals.cacheReadTokens ?? 0)
        + (totals.cacheWriteTokens ?? 0)
        + (totals.outputTokens ?? 0);

    const createdAt = typeof identity?.createdAt === 'number' ? identity.createdAt : 0;
    const lastPromptAt = rows?.sessionListMetadata?.val?.lastPromptAt;
    const lastActiveAt = Math.max(createdAt, typeof lastPromptAt === 'number' ? lastPromptAt : 0);
    const cwd = typeof identity?.cwd === 'string' ? identity.cwd : '';
    const title = typeof rows?.title?.val === 'string' ? rows.title.val.trim() : '';

    if (lastActiveAt > 0 && (latest === null || lastActiveAt > latest.lastActiveAt)) {
      latest = { lastActiveAt, cwd, title, tokens };
    }
    if (name === activeName) {
      active = { cwd, title, tokens };
    }
    if (tokens > 0 && dayKeyOf(lastActiveAt > 0 ? lastActiveAt : createdAt) === todayKey) {
      todayTokens += tokens;
      todaySessions += 1;
    }
  }

  const selected = active ?? (activeId === '' ? latest : null);
  return {
    available: true,
    todayTokens,
    todaySessions,
    sessionTokens: selected?.tokens ?? 0,
    sessionTitle: selected?.title ?? '',
    project: selected === null ? '' : shellDirectoryName(selected.cwd),
    projectPath: selected?.cwd ?? '',
    updatedAt: Date.now(),
  };
}

function isWorking(ctx) {
  const agents = ctx.get('agents');
  if (agents === undefined || typeof agents.list !== 'function') return false;
  try {
    return agents.list().some((agent) => agent !== null && typeof agent === 'object' && agent.status === 'running');
  } catch {
    return false;
  }
}

function tokenWord(value) {
  const n = Math.abs(value);
  if (n % 100 >= 11 && n % 100 <= 14) return 'токенов';
  if (n % 10 === 1) return 'токен';
  if (n % 10 >= 2 && n % 10 <= 4) return 'токена';
  return 'токенов';
}

function chatHoverText(usage, text) {
  return text.chatTokens(formatTokens(usage.sessionTokens), usage.sessionTokens);
}

const RPC_TEXT = {
  en: {
    working: 'Working',
    idle: 'Idle',
    tokensToday: (n) => `Total tok/d: ${n}`,
    chatTokens: (n, count) => `${n} ${count === 1 ? 'token' : 'tokens'} in this chat`,
  },
  ru: {
    working: 'Работает',
    idle: 'Ожидает',
    tokensToday: (n) => `Токенов за день: ${n}`,
    chatTokens: (n, count) => `${n} ${tokenWord(count)} за чат`,
  },
  zh: {
    working: '工作中',
    idle: '空闲',
    tokensToday: (n) => `今日 Token：${n}`,
    chatTokens: (n) => `本聊天 ${n} token`,
  },
};

function rpcText(config) {
  return RPC_TEXT[config?.language] ?? RPC_TEXT.en;
}

function buildActivity(config, usage, working, workingSince) {
  const text = rpcText(config);
  const parts = [];
  if (config.showStatus) parts.push(working ? text.working : text.idle);
  if (config.showTokens) parts.push(text.tokensToday(formatTokens(usage.todayTokens)));
  const chat = usage.sessionTitle !== '' ? usage.sessionTitle : (usage.project === '' ? 'DeepSeek Harness' : usage.project);
  const activity = {
    details: trimText(config.showProject ? chat : 'DeepSeek Harness', 128),
    state: trimText(parts.join('  ·  '), 128),
    instance: false,
  };
  if (config.showTimer && working && workingSince !== null) {
    activity.timestamps = { start: workingSince };
  }
  if (config.largeImage !== '') {
    activity.assets = {
      large_image: config.largeImage,
      large_text: trimText(config.largeText === '' ? chatHoverText(usage, text) : config.largeText, 128),
    };
  }
  return activity;
}

function tryPipe(path) {
  return new Promise((resolve) => {
    const socket = net.connect(path);
    const onError = () => {
      socket.removeListener('connect', onConnect);
      socket.destroy();
      resolve(null);
    };
    const onConnect = () => {
      socket.removeListener('error', onError);
      resolve(socket);
    };
    socket.once('error', onError);
    socket.once('connect', onConnect);
  });
}

async function connectDiscord() {
  const paths = [];
  if (process.env.DSH_DISCORD_IPC) paths.push(process.env.DSH_DISCORD_IPC);
  if (process.platform === 'win32') {
    for (const prefix of ['\\\\?\\pipe\\discord-ipc-', '\\\\.\\pipe\\discord-ipc-']) {
      for (let index = 0; index < PIPE_ATTEMPTS; index += 1) paths.push(`${prefix}${index}`);
    }
  } else {
    const bases = [process.env.XDG_RUNTIME_DIR, tmpdir(), '/tmp', join(homedir(), '.discord')];
    if (process.env.XDG_RUNTIME_DIR) {
      bases.push(join(process.env.XDG_RUNTIME_DIR, 'app/com.discordapp.Discord'));
      bases.push(join(process.env.XDG_RUNTIME_DIR, 'snap.discord'));
    }
    for (const base of bases) {
      if (typeof base !== 'string' || base === '') continue;
      for (let index = 0; index < PIPE_ATTEMPTS; index += 1) paths.push(join(base, `discord-ipc-${index}`));
    }
  }
  for (const path of new Set(paths)) {
    const socket = await tryPipe(path);
    if (socket !== null) return socket;
  }
  return null;
}

class RpcClient {
  constructor(log) {
    this.log = log;
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.ready = false;
    this.connecting = false;
    this.clientId = '';
    this.lastActivity = undefined;
    this.lastError = '';
    this.closedByUs = false;
    this.stopped = true;
    this.retryTimer = null;
    this.retryDelay = 5_000;
  }

  get connected() {
    return this.socket !== null;
  }

  status() {
    return {
      connected: this.socket !== null,
      ready: this.ready,
      clientId: this.clientId,
      error: this.lastError,
    };
  }

  setClientId(id) {
    if (id === this.clientId) {
      if (id !== '' && this.stopped) {
        this.stopped = false;
        this.retryDelay = 5_000;
      }
      this.ensure();
      return;
    }
    this.clientId = id;
    this.lastActivity = undefined;
    this.lastError = '';
    this.stopped = id === '';
    this.teardown();
    this.retryDelay = 5_000;
    if (id !== '') this.connect();
  }

  ensure() {
    if (this.stopped || this.clientId === '') return;
    if (this.socket !== null || this.connecting) return;
    this.connect();
  }

  setActivity(activity) {
    this.lastActivity = activity;
    this.ensure();
    if (this.ready) this.sendActivity(activity);
  }

  clear() {
    this.lastActivity = undefined;
    if (this.ready) this.sendActivity(null);
  }

  destroy() {
    this.stopped = true;
    this.teardown();
  }

  teardown() {
    this.closedByUs = true;
    if (this.socket !== null) {
      try {
        this.socket.removeAllListeners();
        this.socket.destroy();
      } catch {
        // A destroyed pipe is already gone.
      }
    }
    this.socket = null;
    this.ready = false;
    this.buffer = Buffer.alloc(0);
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  async connect() {
    if (this.stopped || this.clientId === '' || this.connecting || this.socket !== null) return;
    const id = this.clientId;
    this.connecting = true;
    this.closedByUs = false;
    let socket = null;
    try {
      socket = await connectDiscord();
    } catch {
      socket = null;
    }
    this.connecting = false;
    if (socket === null) {
      this.lastError = 'Discord не запущен';
      this.scheduleRetry();
      return;
    }
    if (this.stopped || this.clientId !== id) {
      socket.destroy();
      return;
    }
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.ready = false;
    this.lastError = '';
    this.attach(socket);
    this.send(0, { v: 1, client_id: id });
    this.log.info?.('discord-rich: connected to Discord IPC');
  }

  attach(socket) {
    socket.on('data', (chunk) => this.receive(chunk));
    socket.on('error', (error) => {
      this.lastError = String(error?.message ?? error);
    });
    socket.on('close', () => {
      const expected = this.closedByUs;
      this.socket = null;
      this.ready = false;
      this.buffer = Buffer.alloc(0);
      if (!expected && !this.stopped) this.scheduleRetry();
    });
  }

  scheduleRetry() {
    if (this.stopped || this.retryTimer !== null) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.ensure();
    }, this.retryDelay);
    this.retryTimer.unref?.();
    this.retryDelay = Math.min(this.retryDelay * 2, 30_000);
  }

  receive(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 8) {
      const opcode = this.buffer.readInt32LE(0);
      const length = this.buffer.readInt32LE(4);
      if (length < 0 || length > 1_000_000) {
        this.lastError = 'Discord sent an invalid frame';
        this.teardown();
        this.scheduleRetry();
        return;
      }
      if (this.buffer.length < 8 + length) return;
      const payload = this.buffer.subarray(8, 8 + length).toString('utf8');
      this.buffer = this.buffer.subarray(8 + length);
      this.handleFrame(opcode, payload);
    }
  }

  handleFrame(opcode, payload) {
    let message;
    try {
      message = JSON.parse(payload);
    } catch {
      return;
    }
    if (opcode === 3) {
      this.send(4, message);
      return;
    }
    if (opcode === 2) {
      this.lastError = message?.message ?? 'Discord closed the connection';
      this.teardown();
      this.scheduleRetry();
      return;
    }
    if (message?.evt === 'ERROR') {
      const code = message?.data?.code;
      const text = String(message?.data?.message ?? '').trim();
      this.lastError = code === 4000 || /client\s*id/i.test(text)
        ? 'Неверный Application ID'
        : (text !== '' ? text : `Discord error ${code ?? ''}`).trim();
      this.ready = false;
      this.teardown();
      this.scheduleRetry();
      return;
    }
    if (message?.evt === 'READY') {
      this.ready = true;
      this.lastError = '';
      this.retryDelay = 5_000;
      if (this.lastActivity !== undefined) this.sendActivity(this.lastActivity);
    }
  }

  sendActivity(activity) {
    if (!this.ready || this.socket === null) return;
    this.send(1, {
      cmd: 'SET_ACTIVITY',
      args: { pid: process.pid, activity },
      nonce: randomUUID(),
    });
  }

  send(opcode, body) {
    if (this.socket === null || !this.socket.writable) return;
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const header = Buffer.alloc(8);
    header.writeInt32LE(opcode, 0);
    header.writeInt32LE(data.length, 4);
    try {
      this.socket.write(Buffer.concat([header, data]));
    } catch {
      // The close handler schedules the reconnect.
    }
  }
}

export function apply(ctx) {
  const logger = logOf(ctx);
  const profile = ctx.get('profileContext');
  const home = profile?.home
    ?? process.env.DSH_HOME
    ?? join(process.env.APPDATA ?? process.cwd(), 'dsh-desktop', 'harness');
  const cacheDir = join(home, 'storages', 'session_projcache', 'sessions');
  const configPath = join(home, 'storages', 'dsh-discord-rich', 'config.json');

  let config = { ...DEFAULT_CONFIG };
  let workingSince = null;
  let lastSignature = '';
  let usageCache = null;
  let usagePending = null;
  let activeSessionId = '';
  const rpc = new RpcClient(logger);

  const usage = () => {
    if (usageCache !== null && usageCache.id === activeSessionId && Date.now() - usageCache.at < SUMMARY_TTL_MS) {
      return Promise.resolve(usageCache.value);
    }
    if (usagePending !== null && usagePending.id === activeSessionId) return usagePending.promise;
    const id = activeSessionId;
    const entry = { id, promise: null };
    entry.promise = readUsage(cacheDir, id)
      .then((value) => {
        if (id === activeSessionId) usageCache = { at: Date.now(), id, value };
        return value;
      })
      .finally(() => {
        if (usagePending === entry) usagePending = null;
      });
    usagePending = entry;
    return entry.promise;
  };

  const refresh = async (force = false) => {
    let snapshot;
    try {
      snapshot = await usage();
    } catch {
      snapshot = {
        available: false,
        todayTokens: 0,
        todaySessions: 0,
        sessionTokens: 0,
        sessionTitle: '',
        project: '',
        projectPath: '',
        updatedAt: Date.now(),
      };
    }
    if (!config.enabled || config.clientId === '') {
      if (lastSignature !== '') {
        rpc.clear();
        rpc.destroy();
        lastSignature = '';
      }
      return;
    }
    const working = isWorking(ctx);
    if (working) {
      if (workingSince === null) workingSince = Date.now();
    } else {
      workingSince = null;
    }
    const activity = buildActivity(config, snapshot, working, workingSince);
    const signature = JSON.stringify(activity);
    rpc.setClientId(config.clientId);
    if (!force && signature === lastSignature) return;
    lastSignature = signature;
    rpc.setActivity(activity);
  };

  ctx.effect(() => {
    const timer = setInterval(() => {
      refresh().catch(() => {});
    }, TICK_MS);
    timer.unref?.();
    return () => clearInterval(timer);
  }, 'discord-rich: presence tick');

  ctx.effect(() => () => {
    rpc.clear();
    rpc.destroy();
  }, 'discord-rich: disconnect Discord');

  const state = async () => {
    const snapshot = await usage().catch(() => null);
    return {
      ok: true,
      version: VERSION,
      config,
      presence: rpc.status(),
      usage: snapshot ?? {
        available: false,
        todayTokens: 0,
        todaySessions: 0,
        sessionTokens: 0,
        sessionTitle: '',
        project: '',
        projectPath: '',
        updatedAt: Date.now(),
      },
      activeSessionId,
      working: isWorking(ctx),
      tickMs: TICK_MS,
      now: Date.now(),
    };
  };

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: async (req, res) => {
      if (!isLoopback(req.socket.remoteAddress)) {
        res.statusCode = 403;
        res.end();
        return;
      }
      const pathname = new URL(String(req.url ?? '/'), 'http://127.0.0.1').pathname;
      const route = pathname.slice(API_PREFIX.length) || '/';
      try {
        if (req.method === 'GET' && route === '/state') {
          sendJson(res, 200, await state());
          return;
        }
        if (req.method === 'POST' && route === '/active') {
          const body = await readBody(req);
          const id = normalizeSessionId(body?.sessionId);
          if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) throw new Error('invalid session id');
          if (id !== activeSessionId) {
            activeSessionId = id;
            usageCache = null;
            lastSignature = '';
            await refresh(true);
          }
          sendJson(res, 200, { ok: true, activeSessionId });
          return;
        }
        if (req.method === 'POST' && route === '/config') {
          const body = await readBody(req);
          const next = sanitizeConfig(body, config);
          await saveConfig(configPath, next);
          const changed = JSON.stringify(next) !== JSON.stringify(config);
          config = next;
          if (changed) {
            lastSignature = '';
            await refresh(true);
          }
          sendJson(res, 200, await state());
          return;
        }
        if (req.method === 'POST' && route === '/reconnect') {
          rpc.destroy();
          rpc.stopped = false;
          rpc.retryDelay = 5_000;
          lastSignature = '';
          await refresh(true);
          sendJson(res, 200, await state());
          return;
        }
        sendJson(res, 404, { ok: false, error: 'not found' });
      } catch (error) {
        sendJson(res, 400, { ok: false, error: String(error?.message ?? error) });
      }
    },
  }), 'discord-rich: settings route');

  loadConfig(configPath)
    .then((loaded) => {
      config = loaded;
      return refresh(true);
    })
    .catch((error) => {
      logger.warn?.(`discord-rich: config load failed: ${String(error?.message ?? error)}`);
    });
}

export const inject = ['webServer'];
export { buildActivity, normalizeSessionId, readUsage, sanitizeConfig, DEFAULT_CONFIG };
