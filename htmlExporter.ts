export function generateStandalonePrimoxHtml(): string {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Primox — پیام‌رسان پریموکس</title>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg-canvas: #F1F3F5;
      --bg-card: #FFFFFF;
      --text-main: #0F172A;
      --text-muted: #64748B;
      --tg-blue: #2AABEE;
      --tg-blue-dark: #229ED9;
      --border-soft: rgba(15, 23, 42, 0.08);
      --chat-bg: linear-gradient(135deg, #D7EAD4 0%, #E5F1DB 50%, #CFE6D8 100%);
      --bubble-out: #EFFDDE;
      --bubble-in: #FFFFFF;
    }
    body.dark {
      --bg-canvas: #0E1621;
      --bg-card: #17212B;
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --border-soft: rgba(255, 255, 255, 0.08);
      --chat-bg: linear-gradient(135deg, #0E1621 0%, #131F2E 50%, #0B121B 100%);
      --bubble-out: #2B5278;
      --bubble-in: #182533;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Vazirmatn', system-ui, sans-serif; }
    body { background: var(--bg-canvas); color: var(--text-main); min-height: 100vh; }
    .hidden { display: none !important; }

    /* Auth Screen */
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: radial-gradient(circle at top right, rgba(42,171,238,0.16), transparent 45%), var(--bg-canvas);
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-card);
      border-radius: 28px;
      padding: 32px 24px;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
      text-align: center;
    }
    .tg-logo-circle {
      width: 84px; height: 84px; margin: 0 auto 20px; border-radius: 50%;
      background: linear-gradient(135deg, #37AEE2, #1E96C8);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 12px 30px rgba(42, 171, 238, 0.35);
    }
    .auth-title { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
    .auth-sub { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 24px; }
    .field {
      width: 100%; padding: 14px 16px; border-radius: 16px;
      border: 1.5px solid var(--border-soft); background: var(--bg-canvas);
      color: var(--text-main); font-size: 15px; outline: none; margin-bottom: 12px;
      text-align: right;
    }
    .field:focus { border-color: var(--tg-blue); }
    .btn-primary {
      width: 100%; padding: 14px; border-radius: 16px; border: none;
      background: var(--tg-blue); color: #fff; font-size: 15px; font-weight: 700;
      cursor: pointer; transition: transform .15s, background .2s;
    }
    .btn-primary:hover { background: var(--tg-blue-dark); }
    .btn-primary:active { transform: scale(0.98); }
    .otp-row { display: flex; gap: 8px; justify-content: center; direction: ltr; margin-bottom: 16px; }
    .otp-box {
      width: 48px; height: 54px; border-radius: 14px; border: 1.5px solid var(--border-soft);
      background: var(--bg-canvas); color: var(--text-main); text-align: center;
      font-size: 20px; font-weight: 700; outline: none;
    }
    .otp-box:focus { border-color: var(--tg-blue); }

    /* Main App Layout */
    .app-shell { display: flex; height: 100vh; width: 100%; overflow: hidden; }
    .sidebar {
      width: 390px; max-width: 100%; background: var(--bg-canvas);
      border-left: 1px solid var(--border-soft); display: flex; flex-direction: column;
      position: relative; height: 100vh;
    }
    .topbar {
      padding: 16px 20px 10px; display: flex; align-items: center; justify-content: space-between;
    }
    .brand { font-size: 22px; font-weight: 800; color: var(--tg-blue); }
    .search-pill {
      margin: 0 16px 12px; background: var(--bg-card); border-radius: 999px;
      padding: 10px 16px; display: flex; align-items: center; gap: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    }
    .search-pill input {
      border: none; background: transparent; outline: none; width: 100%;
      color: var(--text-main); font-size: 14px;
    }
    .folders {
      display: flex; gap: 8px; padding: 0 16px 12px; overflow-x: auto;
    }
    .folder-tab {
      border: none; padding: 7px 14px; border-radius: 999px; font-size: 13px;
      font-weight: 600; cursor: pointer; background: transparent; color: var(--text-muted);
      white-space: nowrap;
    }
    .folder-tab.active { background: rgba(42,171,238,0.14); color: var(--tg-blue); }
    .scroll-content { flex: 1; overflow-y: auto; padding: 0 12px 96px; }
    .chat-row {
      display: flex; align-items: center; gap: 12px; padding: 10px 12px;
      border-radius: 20px; cursor: pointer; transition: background .15s;
    }
    .chat-row:hover, .chat-row.active { background: var(--bg-card); }
    .avatar {
      width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 18px;
      background: linear-gradient(135deg, #2AABEE, #229ED9);
    }
    .card-group {
      background: var(--bg-card); border-radius: 24px; padding: 8px;
      margin-bottom: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.03);
    }
    .settings-row {
      display: flex; align-items: center; gap: 14px; padding: 12px;
      border-radius: 16px; cursor: pointer;
    }
    .settings-row:hover { background: rgba(148,163,184,0.1); }
    .icon-badge {
      width: 38px; height: 38px; border-radius: 50%; color: #fff;
      display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0;
    }

    /* Floating Glass Bottom Bar */
    .floating-nav {
      position: absolute; bottom: 14px; left: 14px; right: 14px;
      background: rgba(255, 255, 255, 0.86); backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.65); border-radius: 999px;
      padding: 6px; display: grid; grid-template-columns: repeat(4, 1fr);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
    }
    body.dark .floating-nav {
      background: rgba(23, 33, 43, 0.88); border-color: rgba(255, 255, 255, 0.08);
    }
    .nav-btn {
      border: none; background: transparent; border-radius: 999px; padding: 8px 4px;
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      font-size: 11px; font-weight: 600; color: var(--text-muted); cursor: pointer;
    }
    .nav-btn.active { background: rgba(42,171,238,0.14); color: var(--tg-blue); }

    /* Chat Conversation Area */
    .chat-pane {
      flex: 1; display: flex; flex-direction: column; background: var(--chat-bg);
      position: relative;
    }
    .chat-header {
      background: var(--bg-card); padding: 12px 20px; display: flex;
      align-items: center; justify-content: space-between;
      border-bottom: 1px solid var(--border-soft);
    }
    .messages {
      flex: 1; padding: 20px; overflow-y: auto; display: flex;
      flex-direction: column; gap: 10px;
    }
    .msg {
      max-width: 72%; padding: 10px 14px; border-radius: 18px;
      font-size: 14px; line-height: 1.6; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .msg.in { background: var(--bubble-in); align-self: flex-start; border-bottom-right-radius: 6px; }
    .msg.out { background: var(--bubble-out); align-self: flex-end; border-bottom-left-radius: 6px; }
    .composer {
      padding: 12px 16px; background: var(--bg-card); display: flex;
      align-items: center; gap: 10px; border-top: 1px solid var(--border-soft);
    }
    .composer input {
      flex: 1; border: none; background: var(--bg-canvas); color: var(--text-main);
      padding: 12px 16px; border-radius: 999px; outline: none; font-size: 14px;
    }
    .send-circle {
      width: 44px; height: 44px; border-radius: 50%; border: none;
      background: var(--tg-blue); color: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    @media (max-width: 820px) {
      .sidebar { width: 100%; }
      .chat-pane { display: none; position: fixed; inset: 0; z-index: 50; }
      .chat-pane.mobile-open { display: flex; }
    }
  </style>
</head>
<body>

  <!-- AUTHENTICATION FLOW -->
  <section id="authSection" class="auth-wrapper">
    <div class="auth-card">
      <div class="tg-logo-circle">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="#fff">
          <path d="M21.9 4.3L18.7 19.4c-.2 1-.9 1.3-1.8.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6.1 12.8 1.2 11.3c-1.1-.3-1.1-1.1.2-1.6L20.6 2.3c.9-.3 1.6.2 1.3 2z"/>
        </svg>
      </div>

      <!-- Step 1: Phone -->
      <div id="stepPhone">
        <h1 class="auth-title">ورود به پریموکس</h1>
        <p class="auth-sub">لطفاً کد کشور و شماره تلفن همراه خود را وارد کنید تا کد تأیید ارسال شود.</p>
        <select class="field" id="countryCode">
          <option value="+98">🇮🇷 ایران (+98)</option>
          <option value="+971">🇦🇪 امارات (+971)</option>
          <option value="+90">🇹🇷 ترکیه (+90)</option>
        </select>
        <input type="tel" id="phoneInput" class="field" style="direction:ltr;text-align:left;" placeholder="912 345 6789" />
        <button class="btn-primary" onclick="goToOtp()">ادامه</button>
      </div>

      <!-- Step 2: OTP -->
      <div id="stepOtp" class="hidden">
        <h1 class="auth-title">کد تأیید</h1>
        <p class="auth-sub" id="otpSubtitle">کد ۵ رقمی آزمایشی: <strong>48291</strong></p>
        <div class="otp-row">
          <input class="otp-box" maxlength="1" value="4" />
          <input class="otp-box" maxlength="1" value="8" />
          <input class="otp-box" maxlength="1" value="2" />
          <input class="otp-box" maxlength="1" value="9" />
          <input class="otp-box" maxlength="1" value="1" />
        </div>
        <button class="btn-primary" onclick="goToProfileSetup()">تأیید و ادامه</button>
      </div>

      <!-- Step 3: Profile Setup -->
      <div id="stepRegister" class="hidden">
        <h1 class="auth-title">تکمیل پروفایل</h1>
        <p class="auth-sub">نام و نام کاربری خود را برای نمایش در پریموکس وارد کنید.</p>
        <input type="text" id="regName" class="field" placeholder="نام و نام خانوادگی (مثلاً آقا هُژبر)" value="آقا هُژبر" />
        <input type="text" id="regUser" class="field" style="direction:ltr;text-align:left;" placeholder="@username" value="mmd_ferown" />
        <button class="btn-primary" onclick="finishAuth()">شروع پیام‌رسانی</button>
      </div>
    </div>
  </section>

  <!-- MAIN TELEGRAM APPLICATION -->
  <section id="appSection" class="app-shell hidden">
    <aside class="sidebar">
      <!-- Chats Tab -->
      <div id="tabChats">
        <div class="topbar">
          <span class="brand">Primox</span>
          <button onclick="toggleTheme()" style="border:none;background:transparent;cursor:pointer;font-size:18px;">🌙</button>
        </div>
        <div class="search-pill">
          <span>🔍</span>
          <input type="text" placeholder="جستجوی گفتگوها..." oninput="filterChats(this.value)" />
        </div>
        <div class="folders">
          <button class="folder-tab active">تمامی گفتگوها (۳)</button>
          <button class="folder-tab">شخصی</button>
          <button class="folder-tab">کانال‌ها</button>
        </div>
        <div class="scroll-content" id="chatListContainer"></div>
      </div>

      <!-- Settings Tab -->
      <div id="tabSettings" class="hidden">
        <div class="topbar">
          <span style="font-size:20px;font-weight:800;">تنظیمات</span>
        </div>
        <div class="scroll-content">
          <div class="card-group">
            <div class="settings-row" onclick="switchTab('profile')">
              <div class="icon-badge" style="background:#2AABEE;">👤</div>
              <div>
                <div style="font-weight:700;font-size:14px;">حساب کاربری</div>
                <div style="font-size:12px;color:var(--text-muted);">شماره، نام کاربری، بیوگرافی</div>
              </div>
            </div>
            <div class="settings-row" onclick="toggleTheme()">
              <div class="icon-badge" style="background:#F59E0B;">💬</div>
              <div>
                <div style="font-weight:700;font-size:14px;">تنظیمات گفتگو و حالت شب</div>
                <div style="font-size:12px;color:var(--text-muted);">تغییر پس‌زمینه و تم روشن/تاریک</div>
              </div>
            </div>
            <div class="settings-row">
              <div class="icon-badge" style="background:#22C55E;">🔑</div>
              <div>
                <div style="font-weight:700;font-size:14px;">حریم خصوصی و امنیت</div>
                <div style="font-size:12px;color:var(--text-muted);">آخرین بازدید، دستگاه‌ها، رمز عبور</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Tab -->
      <div id="tabProfile" class="hidden">
        <div class="scroll-content" style="padding-top:24px;text-align:center;">
          <div class="avatar" style="width:86px;height:86px;font-size:28px;margin:0 auto 12px;" id="profileAvatar">آ</div>
          <h2 id="profileNameDisplay" style="font-size:20px;font-weight:800;">آقا هُژبر</h2>
          <p id="profileMetaDisplay" style="font-size:13px;color:var(--text-muted);margin:6px 0 18px;">+98 920 982 7346 · @mmd_ferown</p>
          <div class="card-group" style="padding:18px;">
            <p style="font-weight:700;font-size:14px;margin-bottom:12px;">آیا شماره شما همچنان معتبر است؟</p>
            <div style="display:flex;gap:10px;">
              <button class="btn-primary" style="border-radius:999px;">بله 👍</button>
              <button class="btn-primary" style="border-radius:999px;background:#3B82F6;" onclick="logout()">تغییر حساب</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Bottom Navigation -->
      <nav class="floating-nav">
        <button class="nav-btn active" id="nav-chats" onclick="switchTab('chats')">💬<span>گفتگوها</span></button>
        <button class="nav-btn" id="nav-contacts" onclick="switchTab('chats')">👥<span>مخاطبین</span></button>
        <button class="nav-btn" id="nav-settings" onclick="switchTab('settings')">⚙️<span>تنظیمات</span></button>
        <button class="nav-btn" id="nav-profile" onclick="switchTab('profile')">👤<span>پروفایل</span></button>
      </nav>
    </aside>

    <!-- Chat Conversation Pane -->
    <main class="chat-pane" id="chatPane">
      <div class="chat-header">
        <div style="display:flex;align-items:center;gap:12px;">
          <button onclick="closeMobileChat()" style="border:none;background:transparent;font-size:18px;cursor:pointer;">←</button>
          <div class="avatar" style="width:42px;height:42px;font-size:15px;" id="activeChatAvatar">ت</div>
          <div>
            <div id="activeChatTitle" style="font-weight:700;font-size:15px;">کانال توسعه‌دهندگان وب</div>
            <div style="font-size:12px;color:var(--tg-blue);">آنلاین</div>
          </div>
        </div>
      </div>
      <div class="messages" id="messagesContainer">
        <div class="msg in">سلام! به نسخه گرافیکی تلگرام خوش آمدید ✨</div>
        <div class="msg out">خیلی تمیز و شبیه نسخه اصلی تلگرام شده!</div>
      </div>
      <div class="composer">
        <input type="text" id="composerInput" placeholder="پیام خود را بنویسید..." onkeypress="if(event.key==='Enter')sendMsg()" />
        <button class="send-circle" onclick="sendMsg()">➤</button>
      </div>
    </main>
  </section>

  <script>
    const chats = [
      { id: 1, title: 'کانال توسعه‌دهندگان وب', last: 'نسخه جدید رابط کاربری منتشر شد 🚀', time: '۲۱:۱۱', unread: 12 },
      { id: 2, title: 'سارا محمدی', last: 'طراحی جدیدت خیلی تمیز دراومده!', time: '۲۱:۰۸', unread: 2 },
      { id: 3, title: 'گروه برنامه‌نویسان', last: 'فایل استایل آپلود شد', time: '۲۱:۰۵', unread: 18 }
    ];
    function renderChats(filter = '') {
      const box = document.getElementById('chatListContainer');
      box.innerHTML = chats.filter(c => c.title.includes(filter)).map(c => \`
        <div class="chat-row" onclick="openChat('\${c.title}')">
          <div class="avatar">\${c.title[0]}</div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;">
              <strong style="font-size:14px;">\${c.title}</strong>
              <span style="font-size:11px;color:var(--text-muted);">\${c.time}</span>
            </div>
            <div style="font-size:13px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${c.last}</div>
          </div>
        </div>
      \`).join('');
    }
    function goToOtp() {
      document.getElementById('stepPhone').classList.add('hidden');
      document.getElementById('stepOtp').classList.remove('hidden');
    }
    function goToProfileSetup() {
      document.getElementById('stepOtp').classList.add('hidden');
      document.getElementById('stepRegister').classList.remove('hidden');
    }
    function finishAuth() {
      const name = document.getElementById('regName').value || 'کاربر تلگرام';
      const user = document.getElementById('regUser').value || 'telegram_user';
      document.getElementById('profileNameDisplay').textContent = name;
      document.getElementById('profileAvatar').textContent = name[0];
      document.getElementById('profileMetaDisplay').textContent = document.getElementById('countryCode').value + ' ' + (document.getElementById('phoneInput').value || '920 982 7346') + ' · @' + user;
      document.getElementById('authSection').classList.add('hidden');
      document.getElementById('appSection').classList.remove('hidden');
      renderChats();
    }
    function switchTab(tab) {
      ['tabChats','tabSettings','tabProfile'].forEach(id => document.getElementById(id).classList.add('hidden'));
      ['nav-chats','nav-settings','nav-profile'].forEach(id => document.getElementById(id).classList.remove('active'));
      if (tab === 'chats') { document.getElementById('tabChats').classList.remove('hidden'); document.getElementById('nav-chats').classList.add('active'); }
      if (tab === 'settings') { document.getElementById('tabSettings').classList.remove('hidden'); document.getElementById('nav-settings').classList.add('active'); }
      if (tab === 'profile') { document.getElementById('tabProfile').classList.remove('hidden'); document.getElementById('nav-profile').classList.add('active'); }
    }
    function openChat(title) {
      document.getElementById('activeChatTitle').textContent = title;
      document.getElementById('activeChatAvatar').textContent = title[0];
      document.getElementById('chatPane').classList.add('mobile-open');
    }
    function closeMobileChat() { document.getElementById('chatPane').classList.remove('mobile-open'); }
    function sendMsg() {
      const input = document.getElementById('composerInput');
      if (!input.value.trim()) return;
      const box = document.getElementById('messagesContainer');
      const div = document.createElement('div');
      div.className = 'msg out';
      div.textContent = input.value;
      box.appendChild(div);
      input.value = '';
      box.scrollTop = box.scrollHeight;
    }
    function filterChats(val) { renderChats(val); }
    function toggleTheme() { document.body.classList.toggle('dark'); }
    function logout() {
      document.getElementById('appSection').classList.add('hidden');
      document.getElementById('authSection').classList.remove('hidden');
      document.getElementById('stepRegister').classList.add('hidden');
      document.getElementById('stepPhone').classList.remove('hidden');
    }
  </script>
</body>
</html>`;
}
