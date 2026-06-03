# Telegram Session Extractor 🔐

A Chrome Extension to extract Telegram Mini App session data — `initData`, `query_id`, `cookies`, and `iframes` from Telegram Web.

---

## ✨ Features

- ✅ One-click extraction of `initData` and `query_id` from any Telegram Mini App
- ✅ Extract user info: `userId`, `firstName`, `username`, `phone`, `isPremium`
- ✅ Extract session tokens & cookies from all origins (with parent-domain fallback)
- ✅ Scan all iframes — captures data from embedded Mini Apps
- ✅ Auto-save session to Chrome storage
- ✅ Dark / Light mode toggle (remembers your preference)
- ✅ Copy individual fields, initData, tokens, or full session JSON
- ✅ Clean status feedback — success & error states
- ✅ Works with all Telegram Mini Apps and Telegram Web

---

## 🛠️ Installation

> Chrome Web Store not required — install manually in Developer Mode.

1. **Download or clone this repository:**
   ```sh
   git clone https://github.com/thog9/Telegram-Session-extractor.git
   ```

2. **Open Chrome Extensions page:**
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode** (top-right toggle)

4. **Click "Load unpacked"** → select the `Telegram-Session-extractor` folder

5. The **Telegram Session Extractor** icon will appear in your Chrome toolbar ✅

---

## 🚀 How to Use

### For Telegram Mini Apps (`t.me`)

1. Navigate to any Telegram Mini App (e.g., `https://t.me/YourBot/app`)
2. Wait for the Mini App to fully load
3. Click the **TG Session Toolkit** icon in the Chrome toolbar
4. Click **"Extract All"**
5. Your session data will be displayed across 4 tabs:

| Tab | Content |
|---|---|
| **User** | `userId`, `firstName`, `username`, `phone`, `isPremium`, `queryId` |
| **InitData** | Full `initData` string (auto-detected from all storage locations) |
| **Token** | Session cookies & auth tokens from all origins |
| **Frames** | Per-frame scan results (initData, userId, queryId) |

### For Telegram Web (`web.telegram.org`)

1. Log in at [web.telegram.org](https://web.telegram.org)
2. Open a Mini App inside Telegram Web
3. Click the extension icon → **"Extract All"**
4. Session data from the embedded iframe will be captured automatically

### Copy & Use

- Click the 📋 icon next to any field to copy individually
- Click **"Copy"** on the InitData tab to copy the full `initData`
- Click the copy icon on any token to copy its value
- Click the copy icon on any frame to copy its data as JSON
- Click **"JSON"** to copy all session data as a complete JSON object

---

## 📁 File Structure

```
Telegram-Session-extractor/
├── manifest.json        # Extension configuration (Manifest V3)
├── popup.html           # Extension UI (THOG Airdrop design)
├── popup.js             # Popup logic: extract, render, copy, theme
├── style.css            # Styling with dark/light theme support
├── content.js           # Content script (auto-scan all frames)
├── background.js        # Service worker (frame cache management)
├── icon16.png           # 16×16 icon
├── icon48.png           # 48×48 icon
└── icon128.png          # 128×128 icon
```

---

## 🔍 How It Works

The extension uses multiple extraction strategies to find initData:

1. **sessionStorage** — `__telegram__initParams`, `tapps/launchParams`, `telegram-apps/launch-params`
2. **window globals** — `window.__telegram__initParams`, `window.Telegram.WebApp.initData`
3. **URL hash & search** — `tgWebAppData` or `initData` in URL
4. **Comprehensive scan** — iterates all `sessionStorage` and `localStorage` keys
5. **Frame scanning** — injects into all iframes to capture embedded Mini App data

---

## ⚠️ Notes

- This extension **only reads local session data** — it does **not** send data anywhere.
- `initData` is session-based and expires after a period of time.
- Make sure the Mini App is fully loaded before extracting.
- Use extracted data responsibly and only for accounts you own.

---

## 📨 Contact

Connect with us for support or updates:

- **Telegram**: [thog099](https://t.me/thog099)
- **Channel**: [CHANNEL](https://t.me/thogairdrops)
- **Group**: [GROUP CHAT](https://t.me/thogchats)
- **X**: [Thog](https://x.com/thog099)

---

## ☕ Support Us

Love these tools? Fuel our work with a coffee!

🔗 BUYMECAFE: [BUY ME CAFE](https://buymecafe.vercel.app/)

🔗 WEBSITE: [BUY SCRIPTS](https://thogtoolhub.com/)
