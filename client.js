window.__ModuleLoader__.load({
  id: 'dsh-discord-rich',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const API = '/discord-rich/api';
    const NS = 'settings.discord-rich';

    const ru = {
      nav: 'Discord Rich Presence',
      kicker: 'Discord Rich Presence',
      title: 'Discord Rich Presence',
      subtitle: 'Название открытого чата, статус работы и токены за день — прямо в профиле Discord.',
      on: 'Подключено к Discord',
      wait: 'Подключение к Discord',
      err: 'Не удалось подключиться',
      off: 'Присутствие выключено',
      hintOn: 'Строки профиля обновляются автоматически.',
      hintWait: 'Ждём локальный Discord IPC.',
      hintOff: 'Вставьте Application ID, чтобы включить присутствие.',
      reconnect: 'Переподключить',
      previewLabel: 'Превью профиля',
      previewLive: 'LIVE',
      previewDemo: 'ДЕМО',
      previewPlaying: 'ИГРАЕТ В DEEPSEEK HARNESS',
      appIdTitle: 'Application ID',
      appIdHint: 'По умолчанию уже подставлен общий Application ID — плагин работает сразу. Замените его на свой из Discord Developer Portal, если хотите собственное имя приложения и ассеты. Это не токен и не секрет.',
      appIdLink: 'Открыть Discord Developer Portal',
      appIdPlaceholder: 'Например, 1234567890123456789',
      appIdInvalid: 'Application ID — это 15–25 цифр из Discord Developer Portal.',
      save: 'Сохранить',
      saving: 'Сохраняем',
      saved: 'Сохранено',
      displayTitle: 'Что показывать',
      displayHint: 'Верхняя строка — имя открытого чата, нижняя — статус и токены.',
      project: 'Название чата',
      projectHint: 'Заголовок открытой вкладки. Если его нет — имя папки проекта.',
      status: 'Статус работы',
      statusHint: '«Работает», пока агент выполняет ход.',
      tokens: 'Токены за день',
      tokensHint: 'Total tok/d из статистики использования.',
      timer: 'Таймер работы',
      timerHint: 'Сколько идёт текущая работа.',
      assetsTitle: 'Иконка и подсказка',
      assetsHint: 'Необязательно. Загрузите картинку в Rich Presence → Art Assets и укажите ключ — при наведении покажем токены чата.',
      assetsKey: 'Ключ ассета',
      assetsText: 'Своя подсказка',
      assetsAuto: 'Авто: токены чата',
      usageTitle: 'Статистика',
      usageTokens: 'За день',
      usageSessions: 'Сессий',
      usageChat: 'В этом чате',
      chatMeta: 'В этом чате · {n} токенов',
      footer: 'Данные читаются локально из кеша usage-stats. Наружу уходит только Activity в ваш Discord.',
      reconnected: 'Переподключено',
      error: 'Ошибка',
      previewQuiet: 'Присутствие без деталей',
      language: 'Язык',
      working: 'Работает',
      idle: 'Ожидает',
      tokensToday: 'Токенов за день: {n}',
      errorNotRunning: 'Discord не запущен',
      errorInvalidId: 'Неверный Application ID',
    };

    const en = {
      nav: 'Discord Rich Presence',
      kicker: 'Discord Rich Presence',
      title: 'Discord Rich Presence',
      subtitle: 'Your current chat title, work status and daily tokens — right in your Discord profile.',
      on: 'Connected to Discord',
      wait: 'Connecting to Discord',
      err: 'Could not connect',
      off: 'Presence is off',
      hintOn: 'Profile lines refresh automatically.',
      hintWait: 'Waiting for local Discord IPC.',
      hintOff: 'Paste an Application ID to enable presence.',
      reconnect: 'Reconnect',
      previewLabel: 'Profile preview',
      previewLive: 'LIVE',
      previewDemo: 'DEMO',
      previewPlaying: 'PLAYING DEEPSEEK HARNESS',
      appIdTitle: 'Application ID',
      appIdHint: 'A shared Application ID is pre-filled, so the plugin works out of the box. Replace it with your own from the Discord Developer Portal if you want your own app name and assets. It is neither a token nor a secret.',
      appIdLink: 'Open Discord Developer Portal',
      appIdPlaceholder: 'e.g. 1234567890123456789',
      appIdInvalid: 'An Application ID is 15–25 digits from the Discord Developer Portal.',
      save: 'Save',
      saving: 'Saving',
      saved: 'Saved',
      displayTitle: 'What to show',
      displayHint: 'Top line is the open chat title, bottom line is status and tokens.',
      project: 'Chat title',
      projectHint: 'Title of the open tab. Falls back to the project folder name.',
      status: 'Work status',
      statusHint: '“Working” while an agent is running a turn.',
      tokens: 'Tokens today',
      tokensHint: 'Total tok/d from usage statistics.',
      timer: 'Work timer',
      timerHint: 'How long the current work has been running.',
      assetsTitle: 'Icon and tooltip',
      assetsHint: 'Optional. Upload art in Rich Presence → Art Assets and enter its key — hovering will show the chat token count.',
      assetsKey: 'Asset key',
      assetsText: 'Custom tooltip',
      assetsAuto: 'Auto: chat tokens',
      usageTitle: 'Stats',
      usageTokens: 'Today',
      usageSessions: 'Sessions',
      usageChat: 'This chat',
      chatMeta: 'This chat · {n} tokens',
      footer: 'Everything is read locally from the usage-stats cache. Only the Activity is sent to your Discord.',
      reconnected: 'Reconnected',
      error: 'Error',
      previewQuiet: 'Presence without details',
      language: 'Language',
      working: 'Working',
      idle: 'Idle',
      tokensToday: 'Total tok/d: {n}',
      errorNotRunning: 'Discord is not running',
      errorInvalidId: 'Invalid Application ID',
    };

    const zh = {
      nav: 'Discord Rich Presence',
      kicker: 'Discord Rich Presence',
      title: 'Discord Rich Presence',
      subtitle: '在 Discord 个人资料中显示当前聊天、工作状态和今日 Token 用量。',
      on: '已连接 Discord',
      wait: '正在连接 Discord',
      err: '连接失败',
      off: '活动状态已关闭',
      hintOn: '个人资料状态会自动刷新。',
      hintWait: '正在等待本地 Discord IPC。',
      hintOff: '填入 Application ID 以启用活动状态。',
      reconnect: '重新连接',
      previewLabel: '个人资料预览',
      previewLive: '实时',
      previewDemo: '演示',
      previewPlaying: '正在玩 DEEPSEEK HARNESS',
      appIdTitle: 'Application ID',
      appIdHint: '已预填共享 Application ID，开箱即用。若想使用自己的应用名称和素材，可在 Discord Developer Portal 中替换为自己的 ID。它不是 Token，也不是密钥。',
      appIdLink: '打开 Discord Developer Portal',
      appIdPlaceholder: '例如 1234567890123456789',
      appIdInvalid: 'Application ID 是 Discord Developer Portal 中的 15–25 位数字。',
      save: '保存',
      saving: '保存中',
      saved: '已保存',
      displayTitle: '显示内容',
      displayHint: '第一行是当前聊天标题，第二行是工作状态和 Token。',
      project: '聊天标题',
      projectHint: '当前标签页的标题；没有时使用项目文件夹名。',
      status: '工作状态',
      statusHint: 'Agent 执行回合时显示“工作中”。',
      tokens: '今日 Token',
      tokensHint: '来自 usage 统计的 Total tok/d。',
      timer: '工作计时器',
      timerHint: '当前工作已持续的时间。',
      assetsTitle: '图标与悬停提示',
      assetsHint: '可选。在 Rich Presence → Art Assets 上传图片并填写 key，悬停时会显示聊天 Token 数。',
      assetsKey: 'Asset key',
      assetsText: '自定义提示',
      assetsAuto: '自动：聊天 Token',
      usageTitle: '统计',
      usageTokens: '今日',
      usageSessions: '会话',
      usageChat: '本聊天',
      chatMeta: '本聊天 · {n} token',
      footer: '所有数据都在本地从 usage-stats 缓存读取；只有 Activity 会发送到你的 Discord。',
      reconnected: '已重新连接',
      error: '错误',
      previewQuiet: '无详细信息的活动',
      language: '语言',
      working: '工作中',
      idle: '空闲',
      tokensToday: '今日 Token：{n}',
      errorNotRunning: 'Discord 未运行',
      errorInvalidId: 'Application ID 无效',
    };

    const DICTS = { en, ru, zh };

    function formatTokens(value) {
      const n = Number.isFinite(value) ? Math.max(0, value) : 0;
      if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1).replace(/\.0$/, '')}B`;
      if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '')}M`;
      if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '')}k`;
      return String(Math.round(n));
    }

    function interpolate(text, params) {
      let out = text;
      if (params) {
        for (const [key, value] of Object.entries(params)) out = out.split(`{${key}}`).join(String(value));
      }
      return out;
    }

    const CSS = [
      '.dr-page{padding:26px 32px 48px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}',
      '.dr-inner{max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:14px}',
      '.dr-head{display:flex;gap:14px;align-items:flex-start;padding:2px 2px 4px}',
      '.dr-headText{flex:1;min-width:0}',
      '.dr-lang{display:flex;gap:3px;padding:3px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);flex:0 0 auto}',
      '.dr-langBtn{appearance:none;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:11px;font-weight:700;letter-spacing:.04em;padding:5px 8px;cursor:pointer;transition:background .15s ease,color .15s ease}',
      '.dr-langBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}',
      '.dr-langBtn[aria-pressed="true"]{background:#5865F2;color:#fff}',
      '.dr-langBtn:focus-visible{outline:2px solid #5865F2;outline-offset:2px}',
      '.dr-langBtn:disabled{cursor:not-allowed;opacity:.6}',
      '.dr-mark{flex:0 0 auto;width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#5865F2,#8b5cf6);box-shadow:0 10px 24px rgba(88,101,242,.32);display:flex;align-items:center;justify-content:center;color:#fff}',
      '.dr-kicker{display:block;font-size:10px;letter-spacing:.14em;font-weight:700;color:var(--dsw-alias-label-tertiary);margin-bottom:3px;text-transform:uppercase}',
      '.dr-title{margin:0;font-size:22px;line-height:28px;font-weight:650;letter-spacing:-.01em}',
      '.dr-sub{margin:4px 0 0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}',
      '.dr-status{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1)}',
      '.dr-dot{width:8px;height:8px;border-radius:50%;flex:0 0 auto;background:var(--dsw-alias-label-tertiary)}',
      '.dr-dot-on{background:#23a55a;box-shadow:0 0 0 4px rgba(35,165,90,.14)}',
      '.dr-dot-wait{background:#f0b232;box-shadow:0 0 0 4px rgba(240,178,50,.14)}',
      '.dr-dot-err{background:#f23f43;box-shadow:0 0 0 4px rgba(242,63,67,.14)}',
      '.dr-statusText{display:flex;flex-direction:column;min-width:0;flex:1}',
      '.dr-statusTitle{font-size:13px;line-height:18px;font-weight:600}',
      '.dr-statusHint{font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dr-preview{position:relative;overflow:hidden;border-radius:18px;padding:16px;background:linear-gradient(135deg,#232428 0%,#191a1d 100%);border:1px solid rgba(255,255,255,.08);box-shadow:0 18px 50px rgba(0,0,0,.28)}',
      '.dr-previewGlow{position:absolute;top:-140px;right:-60px;width:320px;height:320px;background:radial-gradient(circle,rgba(88,101,242,.35),transparent 65%);pointer-events:none}',
      '.dr-previewTop{position:relative;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}',
      '.dr-previewLabel{font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:rgba(255,255,255,.55)}',
      '.dr-pill{font-size:9.5px;letter-spacing:.08em;font-weight:700;padding:2px 8px;border-radius:999px;background:rgba(88,101,242,.22);color:#a9b3ff;border:1px solid rgba(88,101,242,.35)}',
      '.dr-card{position:relative;display:flex;gap:14px;align-items:center;padding:14px;border-radius:14px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.06)}',
      '.dr-appIcon{width:60px;height:60px;border-radius:12px;background:linear-gradient(160deg,#5865F2,#7c3aed);display:flex;align-items:center;justify-content:center;color:#fff;flex:0 0 auto;box-shadow:0 8px 20px rgba(88,101,242,.3)}',
      '.dr-cardBody{display:flex;flex-direction:column;min-width:0;gap:2px}',
      '.dr-playing{font-size:9.5px;letter-spacing:.12em;font-weight:700;color:rgba(255,255,255,.5)}',
      '.dr-line1{font-size:15px;line-height:20px;font-weight:600;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dr-line2{font-size:12.5px;line-height:18px;color:rgba(255,255,255,.72);font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dr-meta{font-size:11px;line-height:16px;color:rgba(255,255,255,.42);font-variant-numeric:tabular-nums}',
      '.dr-block{padding:18px 20px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1)}',
      '.dr-h2{margin:0;font-size:14px;line-height:20px;font-weight:650}',
      '.dr-hint{margin:2px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}',
      '.dr-inputRow{display:flex;gap:8px;margin-top:12px}',
      '.dr-input{flex:1;min-width:0;padding:9px 12px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-variant-numeric:tabular-nums}',
      '.dr-input:focus{outline:none;border-color:#5865F2;box-shadow:0 0 0 3px rgba(88,101,242,.18)}',
      '.dr-btn{appearance:none;border-radius:10px;padding:9px 14px;font:inherit;font-size:12.5px;font-weight:600;line-height:18px;cursor:pointer;transition:background .15s ease,opacity .15s ease}',
      '.dr-btn-primary{background:#5865F2;color:#fff;border:1px solid transparent}',
      '.dr-btn-primary:hover{background:#4752c4}',
      '.dr-btn-ghost{background:transparent;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}',
      '.dr-btn-ghost:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dr-btn:disabled{opacity:.5;cursor:not-allowed}',
      '.dr-btn:focus-visible{outline:2px solid #5865F2;outline-offset:2px}',
      '.dr-link{display:inline-block;margin-top:10px;font-size:12px;line-height:18px;color:#7983f5;text-decoration:none}',
      '.dr-link:hover{text-decoration:underline}',
      '.dr-notice{margin:10px 0 0;font-size:12px;line-height:18px}',
      '.dr-notice-ok{color:#23a55a}',
      '.dr-notice-error{color:#f23f43}',
      '.dr-rows{display:flex;flex-direction:column;margin-top:10px}',
      '.dr-rowItem{display:flex;align-items:center;gap:14px;padding:10px 0;border-top:1px solid var(--dsw-alias-border-l2)}',
      '.dr-rowItem:first-child{border-top:0;padding-top:2px}',
      '.dr-rowText{display:flex;flex-direction:column;gap:1px;flex:1;min-width:0}',
      '.dr-rowLabel{font-size:13px;line-height:18px;font-weight:550}',
      '.dr-rowHint{font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary)}',
      '.dr-switch{position:relative;width:38px;height:22px;border-radius:999px;border:0;padding:0;cursor:pointer;background:var(--dsw-alias-interactive-bg-hover);transition:background .16s ease;flex:0 0 auto}',
      '.dr-switch[aria-checked="true"]{background:#5865F2}',
      '.dr-switch span{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .16s ease;box-shadow:0 1px 3px rgba(0,0,0,.3)}',
      '.dr-switch[aria-checked="true"] span{transform:translateX(16px)}',
      '.dr-switch:focus-visible{outline:2px solid #5865F2;outline-offset:2px}',
      '.dr-assets{margin-top:12px;border-top:1px solid var(--dsw-alias-border-l2);padding-top:12px}',
      '.dr-assets summary{cursor:pointer;font-size:12.5px;font-weight:550;color:var(--dsw-alias-label-secondary)}',
      '.dr-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}',
      '.dr-field{display:flex;flex-direction:column;gap:4px;min-width:0}',
      '.dr-field span{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}',
      '.dr-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}',
      '.dr-stat{padding:10px 12px;border-radius:10px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);display:flex;flex-direction:column;gap:2px;min-width:0}',
      '.dr-statValue{font-size:17px;line-height:22px;font-weight:650;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dr-statLabel{font-size:10.5px;line-height:15px;color:var(--dsw-alias-label-tertiary)}',
      '.dr-footer{font-size:11px;line-height:17px;color:var(--dsw-alias-label-tertiary);padding:0 2px}',
      '.dr-loading{padding:40px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px}',
      '@media(max-width:640px){.dr-page{padding:18px 16px 36px}.dr-grid2,.dr-stats{grid-template-columns:1fr}.dr-inputRow{flex-direction:column}.dr-head{flex-wrap:wrap}.dr-lang{margin-left:60px}}',
    ].join('\n');

    function Mark({ size = 24 }) {
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none', 'aria-hidden': true,
      },
      h('rect', { x: 3, y: 4.5, width: 18, height: 14, rx: 3.5, stroke: 'currentColor', strokeWidth: 1.6 }),
      h('path', { d: 'M7.2 9.4 9.6 12l-2.4 2.6M11.4 14.8h5', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      h('circle', { cx: 18.4, cy: 18.4, r: 3.1, fill: '#23a55a', stroke: '#232428', strokeWidth: 1.4 }));
    }

    function Switch({ checked, onChange, label }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        className: 'dr-switch',
        'aria-checked': checked ? 'true' : 'false',
        'aria-label': label,
        onClick: onChange,
      }, h('span'));
    }

    function useSnapshot() {
      const [snapshot, setSnapshot] = React.useState(null);
      const [loadError, setLoadError] = React.useState('');

      const load = React.useCallback(async () => {
        try {
          const response = await fetch(`${API}/state`, {
            headers: { accept: 'application/json' },
            credentials: 'same-origin',
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          setSnapshot(data);
          setLoadError('');
        } catch (error) {
          setLoadError(String(error?.message ?? error));
        }
      }, []);

      React.useEffect(() => {
        load().catch(() => {});
        const timer = setInterval(() => {
          if (document.visibilityState === 'visible') load().catch(() => {});
        }, 15_000);
        return () => clearInterval(timer);
      }, [load]);

      return { snapshot, setSnapshot, loadError, reload: load };
    }

    function Section(props) {
      const { snapshot, setSnapshot, loadError, reload } = useSnapshot();
      const pageRef = React.useRef(null);
      const [draftId, setDraftId] = React.useState('');
      const dirty = React.useRef(false);
      const [busy, setBusy] = React.useState(false);
      const [notice, setNotice] = React.useState(null);

      React.useEffect(() => {
        pageRef.current?.scrollIntoView?.({ block: 'start' });
      }, []);

      const savedId = snapshot?.config?.clientId ?? '';
      React.useEffect(() => {
        if (!dirty.current) setDraftId(savedId);
      }, [savedId]);

      const post = async (route, body) => {
        const response = await fetch(`${API}${route}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(body ?? {}),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.ok === false) {
          throw new Error(data?.error ?? `HTTP ${response.status}`);
        }
        return data;
      };

      const saveId = async () => {
        const id = draftId.trim();
        if (!/^\d{15,25}$/.test(id)) {
          setNotice({ kind: 'error', text: t('appIdInvalid') });
          return;
        }
        setBusy(true);
        try {
          const data = await post('/config', { clientId: id });
          dirty.current = false;
          setSnapshot(data);
          setNotice({ kind: 'ok', text: t('saved') });
        } catch (error) {
          setNotice({ kind: 'error', text: `${t('error')}: ${String(error?.message ?? error)}` });
        } finally {
          setBusy(false);
        }
      };

      const toggle = async (key) => {
        if (snapshot === null || busy) return;
        const next = !snapshot.config[key];
        setSnapshot({ ...snapshot, config: { ...snapshot.config, [key]: next } });
        try {
          const data = await post('/config', { [key]: next });
          setSnapshot(data);
        } catch (error) {
          setNotice({ kind: 'error', text: `${t('error')}: ${String(error?.message ?? error)}` });
          reload().catch(() => {});
        }
      };

      const saveAssets = async (patch) => {
        try {
          const data = await post('/config', patch);
          setSnapshot(data);
        } catch (error) {
          setNotice({ kind: 'error', text: `${t('error')}: ${String(error?.message ?? error)}` });
        }
      };

      const reconnect = async () => {
        setBusy(true);
        try {
          const data = await post('/reconnect', {});
          setSnapshot(data);
          setNotice({ kind: 'ok', text: t('reconnected') });
        } catch (error) {
          setNotice({ kind: 'error', text: `${t('error')}: ${String(error?.message ?? error)}` });
        } finally {
          setBusy(false);
        }
      };

      const config = snapshot?.config ?? {
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
      const lang = config.language === 'ru' || config.language === 'zh' ? config.language : 'en';
      const t = (key, params) => interpolate((DICTS[lang] ?? DICTS.en)[key] ?? DICTS.en[key] ?? key, params);
      const saveLanguage = async (language) => {
        if (language === lang || busy) return;
        setBusy(true);
        try {
          const data = await post('/config', { language });
          setSnapshot(data);
        } catch (error) {
          setNotice({ kind: 'error', text: `${t('error')}: ${String(error?.message ?? error)}` });
        } finally {
          setBusy(false);
        }
      };
      const usage = snapshot?.usage ?? {
        todayTokens: 0,
        todaySessions: 0,
        sessionTokens: 0,
        sessionTitle: '',
        project: '',
        available: false,
      };
      const presence = snapshot?.presence ?? { connected: false, ready: false, error: '' };
      const presenceError = presence.error === 'Discord не запущен'
        ? t('errorNotRunning')
        : presence.error === 'Неверный Application ID'
          ? t('errorInvalidId')
          : presence.error;
      const working = snapshot?.working === true;
      const hasId = config.clientId !== '';
      const enabled = hasId && config.enabled;
      const dot = !enabled ? 'off' : presence.ready ? 'on' : presence.error ? 'err' : 'wait';
      const project = usage.project === '' ? 'DeepSeek Harness' : usage.project;
      const chat = usage.sessionTitle || project;
      const chatMetaText = t('chatMeta', { n: formatTokens(usage.sessionTokens) });
      const stateParts = [];
      if (config.showStatus) stateParts.push(working ? t('working') : t('idle'));
      if (config.showTokens) stateParts.push(t('tokensToday', { n: formatTokens(usage.todayTokens) }));

      const statusTitle = !enabled
        ? t('off')
        : presence.ready
          ? t('on')
          : presence.error
            ? t('err')
            : t('wait');
      const statusHint = loadError !== ''
        ? `${t('error')}: ${loadError}`
        : !enabled
          ? t('hintOff')
          : presenceError
            ? presenceError
            : presence.ready
              ? t('hintOn')
              : t('hintWait');

      const row = (key, label, hint) => h('div', { className: 'dr-rowItem', key },
        h('div', { className: 'dr-rowText' },
          h('span', { className: 'dr-rowLabel' }, label),
          h('span', { className: 'dr-rowHint' }, hint)),
        h(Switch, {
          checked: config[key] === true,
          onChange: () => toggle(key),
          label,
        }));

      return h('div', { className: 'dr-page', ref: pageRef },
        h('style', null, CSS),
        h('div', { className: 'dr-inner' },
          h('header', { className: 'dr-head' },
            h('div', { className: 'dr-mark' }, h(Mark)),
            h('div', { className: 'dr-headText' },
              h('span', { className: 'dr-kicker' }, t('kicker')),
              h('h1', { className: 'dr-title' }, t('title')),
              h('p', { className: 'dr-sub' }, t('subtitle'))),
            h('div', {
              className: 'dr-lang',
              role: 'group',
              'aria-label': t('language'),
            }, [['ru', 'RU'], ['en', 'EN'], ['zh', 'CN']].map(([code, label]) => h('button', {
              key: code,
              type: 'button',
              className: 'dr-langBtn',
              'aria-pressed': lang === code ? 'true' : 'false',
              disabled: busy,
              onClick: () => saveLanguage(code),
            }, label)))),

          h('div', { className: 'dr-status' },
            h('span', { className: `dr-dot dr-dot-${dot}` }),
            h('div', { className: 'dr-statusText' },
              h('span', { className: 'dr-statusTitle' }, statusTitle),
              h('span', { className: 'dr-statusHint', title: statusHint }, statusHint)),
            h('button', {
              type: 'button',
              className: 'dr-btn dr-btn-ghost',
              disabled: busy || !hasId,
              onClick: reconnect,
            }, t('reconnect'))),

          h('section', { className: 'dr-preview' },
            h('div', { className: 'dr-previewGlow' }),
            h('div', { className: 'dr-previewTop' },
              h('span', { className: 'dr-previewLabel' }, t('previewLabel')),
              h('span', { className: 'dr-pill' }, hasId ? t('previewLive') : t('previewDemo'))),
            h('div', { className: 'dr-card' },
              h('div', { className: 'dr-appIcon', title: chatMetaText }, h(Mark, { size: 34 })),
              h('div', { className: 'dr-cardBody' },
                h('span', { className: 'dr-playing' }, t('previewPlaying')),
                h('span', { className: 'dr-line1', title: chat }, config.showProject ? chat : 'DeepSeek Harness'),
                stateParts.length > 0
                  ? h('span', { className: 'dr-line2' }, stateParts.join('  ·  '))
                  : h('span', { className: 'dr-line2' }, t('previewQuiet')),
                h('span', { className: 'dr-meta' }, chatMetaText)))),

          h('section', { className: 'dr-block' },
            h('h2', { className: 'dr-h2' }, t('appIdTitle')),
            h('p', { className: 'dr-hint' }, t('appIdHint')),
            h('div', { className: 'dr-inputRow' },
              h('input', {
                className: 'dr-input',
                value: draftId,
                placeholder: t('appIdPlaceholder'),
                inputMode: 'numeric',
                spellCheck: false,
                'aria-label': t('appIdTitle'),
                onChange: (event) => {
                  dirty.current = true;
                  setDraftId(event.target.value.replace(/[^0-9]/g, '').slice(0, 25));
                },
                onKeyDown: (event) => {
                  if (event.key === 'Enter') saveId();
                },
              }),
              h('button', {
                type: 'button',
                className: 'dr-btn dr-btn-primary',
                disabled: busy,
                onClick: saveId,
              }, busy ? t('saving') : t('save'))),
            h('a', {
              className: 'dr-link',
              href: 'https://discord.com/developers/applications',
              target: '_blank',
              rel: 'noreferrer',
            }, t('appIdLink')),
            notice !== null && h('p', {
              className: `dr-notice dr-notice-${notice.kind}`,
              role: 'status',
              'aria-live': 'polite',
            }, notice.text)),

          h('section', { className: 'dr-block' },
            h('h2', { className: 'dr-h2' }, t('displayTitle')),
            h('p', { className: 'dr-hint' }, t('displayHint')),
            h('div', { className: 'dr-rows' },
              row('showProject', t('project'), t('projectHint')),
              row('showStatus', t('status'), t('statusHint')),
              row('showTokens', t('tokens'), t('tokensHint')),
              row('showTimer', t('timer'), t('timerHint'))),
            h('details', { className: 'dr-assets' },
              h('summary', null, t('assetsTitle')),
              h('p', { className: 'dr-hint' }, t('assetsHint')),
              h('div', { className: 'dr-grid2' },
                h('label', { className: 'dr-field' },
                  h('span', null, t('assetsKey')),
                  h('input', {
                    className: 'dr-input',
                    defaultValue: config.largeImage,
                    placeholder: 'dsh',
                    onBlur: (event) => {
                      const value = event.target.value.trim();
                      if (value !== config.largeImage) saveAssets({ largeImage: value });
                    },
                  })),
                h('label', { className: 'dr-field' },
                  h('span', null, t('assetsText')),
                  h('input', {
                    className: 'dr-input',
                    defaultValue: config.largeText,
                    placeholder: t('assetsAuto'),
                    onBlur: (event) => {
                      const value = event.target.value.trim();
                      if (value !== config.largeText) saveAssets({ largeText: value });
                    },
                  }))))),

          h('section', { className: 'dr-block' },
            h('h2', { className: 'dr-h2' }, t('usageTitle')),
            h('div', { className: 'dr-stats' },
              h('div', { className: 'dr-stat' },
                h('span', { className: 'dr-statValue' }, formatTokens(usage.todayTokens)),
                h('span', { className: 'dr-statLabel' }, t('usageTokens'))),
              h('div', { className: 'dr-stat' },
                h('span', { className: 'dr-statValue', title: chat }, formatTokens(usage.sessionTokens)),
                h('span', { className: 'dr-statLabel' }, t('usageChat'))),
              h('div', { className: 'dr-stat' },
                h('span', { className: 'dr-statValue' }, String(usage.todaySessions)),
                h('span', { className: 'dr-statLabel' }, t('usageSessions'))))),

          h('p', { className: 'dr-footer' }, t('footer'))));
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const bound = ctx.locale?.bind?.(NS);
        const t = (key, params) => {
          if (bound) {
            const value = bound(key);
            if (value && value !== key) return interpolate(value, params);
          }
          return interpolate(ru[key] ?? key, params);
        };
        ctx.effect(() => ctx.locale?.register(NS, { ru, en, zh }), 'discord-rich: dictionaries');

        function ActiveSessionReporter(props) {
          const sessionId = props?.sessionId;
          React.useEffect(() => {
            if (typeof sessionId !== 'string' || sessionId === '') return;
            fetch('/discord-rich/api/active', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ sessionId }),
            }).catch(() => {});
          }, [sessionId]);
          return null;
        }

        ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
          name: 'conversation.session.header.actions',
          id: 'discord-rich-active',
          order: 0,
        }, ActiveSessionReporter));

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'discord-rich',
          order: 32,
          locale: NS,
          label: () => t('nav'),
          inject: () => ({ t }),
        }, Section));
      },
    };
  },
});
