// TG Session Toolkit — Service Worker (background.js)

// Lưu frame data được gửi từ content scripts
const frameCache = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Content script tự động gửi khi tìm thấy data
  if (request.action === 'frameDataFound') {
    const tabId = sender.tab?.id;
    if (tabId) {
      if (!frameCache[tabId]) frameCache[tabId] = [];
      // Tránh duplicate theo frameUrl
      const exists = frameCache[tabId].some(f => f.frameUrl === request.data.frameUrl);
      if (!exists) frameCache[tabId].push(request.data);
    }
    sendResponse({ ok: true });
  }

  // Popup hỏi lấy cache
  if (request.action === 'getFrameCache') {
    sendResponse({ frames: frameCache[request.tabId] || [] });
  }

  // Popup yêu cầu xóa cache trước khi extract mới
  if (request.action === 'clearFrameCache') {
    delete frameCache[request.tabId];
    sendResponse({ ok: true });
  }

  return true;
});

// Xóa cache khi tab đóng
chrome.tabs.onRemoved.addListener((tabId) => {
  delete frameCache[tabId];
});

// Xóa cache khi navigate sang trang mới
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    delete frameCache[tabId];
  }
});