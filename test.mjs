import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { zstdCompressSync } from 'node:zlib';
import { DEFAULT_CONFIG, buildActivity, normalizeSessionId, readUsage, readUsageNative, sanitizeConfig } from './index.js';

const dir = await mkdtemp(join(tmpdir(), 'dsh-discord-rich-'));

function session(title, createdAt, lastPromptAt, tokens) {
  return {
    record: {
      identity: { createdAt, cwd: 'C:\\work\\proj' },
      rows: {
        title: { val: title },
        sessionListMetadata: { val: { lastPromptAt } },
        tokenUsage: {
          val: {
            totals: {
              uncachedInputTokens: tokens,
              cacheReadTokens: 0,
              cacheWriteTokens: 0,
              outputTokens: 0,
            },
          },
        },
      },
    },
  };
}

try {
  assert.equal(normalizeSessionId('session-aaaaaaaa.json'), 'aaaaaaaa');
  assert.equal(normalizeSessionId('aaaaaaaa'), 'aaaaaaaa');
  assert.equal(normalizeSessionId(''), '');

  await writeFile(join(dir, `session-${'a'.repeat(8)}.json`), JSON.stringify(session('Old chat', 1, 100, 10)));
  await writeFile(join(dir, `session-${'b'.repeat(8)}.json`), JSON.stringify(session('Active chat', 2, 200, 30)));

  const active = await readUsage(dir, 'a'.repeat(8));
  assert.equal(active.sessionTitle, 'Old chat');
  assert.equal(active.sessionTokens, 10);
  assert.equal(active.project, 'proj');

  const latest = await readUsage(dir);
  assert.equal(latest.sessionTitle, 'Active chat');
  assert.equal(latest.sessionTokens, 30);

  const missing = await readUsage(dir, 'c'.repeat(8));
  assert.equal(missing.sessionTitle, '');
  assert.equal(missing.sessionTokens, 0);

  const nativeRoot = join(dir, 'native', 'sessions');
  const nativeId = 'd'.repeat(8);
  const nativeDir = join(nativeRoot, '--C-work-proj--', `session-${nativeId}`);
  await mkdir(nativeDir, { recursive: true });
  const now = Date.now();
  const nativeEvents = [
    { type: 'session', version: 4, id: `session-${nativeId}`, createdAt: now - 5000, cwd: 'C:\\work\\proj' },
    { type: 'user/message', time: now, data: {} },
    { type: 'session/title', data: { title: 'Native chat' } },
    { type: 'assistant/message', data: { turn: 1, step: 1, usage: { inputTokens: 100, outputTokens: 20, cacheReadTokens: 30 } } },
    { type: 'assistant/message', data: { turn: 1, step: 2, usage: { inputTokens: 5, outputTokens: 2, cacheReadTokens: 10 } } },
    { type: 'assistant/message', data: { turn: 1, step: 2, usage: { inputTokens: 7, outputTokens: 3, cacheReadTokens: 12 } } },
  ];
  const nativeFile = join(nativeDir, 'session.v4.jsonl.zstd');
  await writeFile(nativeFile, Buffer.concat(nativeEvents.map((event) => zstdCompressSync(Buffer.from(`${JSON.stringify(event)}\n`)))));
  const native = await readUsageNative(nativeRoot, nativeId);
  assert.equal(native.available, true);
  assert.equal(native.sessionTitle, 'Native chat');
  assert.equal(native.sessionTokens, 172);
  assert.equal(native.todayTokens, 172);
  assert.equal(native.todaySessions, 1);
  assert.equal(native.project, 'proj');

  const activity = buildActivity({
    language: 'ru',
    showProject: true,
    showStatus: true,
    showTokens: true,
    showTimer: true,
    largeImage: 'dsh',
    largeText: '',
  }, active, false, null);
  assert.equal(activity.details, 'Old chat');
  assert.equal(activity.assets.large_text, '10 токенов за чат');
  assert.equal(activity.state, 'Ожидает  ·  Токенов за день: 0');

  const english = buildActivity({
    language: 'en',
    showProject: true,
    showStatus: true,
    showTokens: true,
    showTimer: true,
    largeImage: 'dsh',
    largeText: '',
  }, active, true, 123);
  assert.equal(english.assets.large_text, '10 tokens in this chat');
  assert.equal(english.state, 'Working  ·  Total tok/d: 0');
  assert.deepEqual(english.timestamps, { start: 123 });

  const chinese = buildActivity({
    language: 'zh',
    showProject: true,
    showStatus: true,
    showTokens: true,
    showTimer: true,
    largeImage: 'dsh',
    largeText: '',
  }, active, false, null);
  assert.equal(chinese.assets.large_text, '本聊天 10 token');
  assert.equal(chinese.state, '空闲  ·  今日 Token：0');

  assert.equal(DEFAULT_CONFIG.clientId, '1567993796355031070');
  assert.equal(DEFAULT_CONFIG.language, 'en');
  const russianBase = { ...DEFAULT_CONFIG, language: 'ru' };
  assert.equal(sanitizeConfig({ showTimer: false }, russianBase).language, 'ru');
  assert.equal(sanitizeConfig({ language: 'zh' }, russianBase).language, 'zh');
  assert.equal(sanitizeConfig({ language: 'fr' }, russianBase).language, 'ru');
  assert.equal(sanitizeConfig({}, DEFAULT_CONFIG).language, 'en');

  console.log('ok');
} finally {
  await rm(dir, { recursive: true, force: true });
}
