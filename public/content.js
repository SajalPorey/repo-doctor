(function () {
  // Only trigger on repo pages: github.com/owner/repo
  const match = location.pathname.match(/^\/([^\/\?#]+)\/([^\/\?#]+)\/?$/);
  if (!match) return;

  const owner = match[1];
  const repo = match[2];

  // Skip GitHub special "owners"
  const excluded = ['orgs', 'marketplace', 'explore', 'settings', 'notifications', 'topics', 'collections', 'trending'];
  if (excluded.includes(owner)) return;

  // Avoid double-inject
  if (document.getElementById('repodoctor-sidebar')) return;

  const SIDEBAR_WIDTH = '400px';

  let isDarkTheme = true;

  // ── Sidebar container ────────────────────────────────────────────────────
  const sidebar = document.createElement('div');
  sidebar.id = 'repodoctor-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: ${SIDEBAR_WIDTH};
    height: 100vh;
    z-index: 99999;
    background: #09090b;
    border-left: 1px solid #27272a;
    box-shadow: -8px 0 32px rgba(0,0,0,0.6);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    display: flex;
    flex-direction: column;
    font-family: sans-serif;
  `;

  // ── Header bar inside sidebar ────────────────────────────────────────────
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid #27272a;
    background: #09090b;
    flex-shrink: 0;
  `;

  const title = document.createElement('span');
  title.textContent = '🩺 RepoDoctor';
  title.style.cssText = 'color: #a78bfa; font-size: 13px; font-weight: 600; font-family: monospace;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: #71717a;
    cursor: pointer;
    font-size: 14px;
    padding: 2px 6px;
    border-radius: 4px;
    transition: color 0.2s, background 0.2s;
  `;
  closeBtn.onmouseenter = () => {
    closeBtn.style.color = isDarkTheme ? '#fff' : '#09090b';
    closeBtn.style.background = isDarkTheme ? '#3f3f46' : '#e4e4e7';
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.color = '#71717a';
    closeBtn.style.background = 'none';
  };

  header.appendChild(title);
  header.appendChild(closeBtn);

  // ── iframe ───────────────────────────────────────────────────────────────
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL(`index.html?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
  iframe.style.cssText = `
    width: 100%;
    flex: 1;
    border: none;
    background: #09090b;
  `;

  sidebar.appendChild(header);
  sidebar.appendChild(iframe);

  // ── Tab / toggle button ──────────────────────────────────────────────────
  const toggle = document.createElement('button');
  toggle.id = 'repodoctor-toggle';
  toggle.title = 'RepoDoctor — GitHub Health Check';
  toggle.innerHTML = `<span style="writing-mode:vertical-rl;text-orientation:mixed;letter-spacing:0.1em;font-size:11px;font-weight:600;font-family:monospace;">🩺 RepoDoctor</span>`;
  toggle.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    z-index: 100000;
    background: #7c3aed;
    color: white;
    border: none;
    width: 28px;
    padding: 16px 0;
    border-radius: 8px 0 0 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: -2px 0 12px rgba(124,58,237,0.5);
    transition: right 0.3s cubic-bezier(0.4,0,0.2,1), background 0.2s;
  `;
  toggle.onmouseenter = () => { toggle.style.background = '#6d28d9'; };
  toggle.onmouseleave = () => { toggle.style.background = '#7c3aed'; };

  // ── State ────────────────────────────────────────────────────────────────
  let isOpen = false;

  function openSidebar() {
    isOpen = true;
    sidebar.style.transform = 'translateX(0)';
    toggle.style.right = SIDEBAR_WIDTH;
  }

  function closeSidebar() {
    isOpen = false;
    sidebar.style.transform = 'translateX(100%)';
    toggle.style.right = '0';
  }

  toggle.addEventListener('click', () => isOpen ? closeSidebar() : openSidebar());
  closeBtn.addEventListener('click', closeSidebar);

  document.body.appendChild(sidebar);
  document.body.appendChild(toggle);

  // Listen for theme change message from the iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'repodoctor:theme') {
      isDarkTheme = event.data.theme === 'dark';
      sidebar.style.background = isDarkTheme ? '#09090b' : '#ffffff';
      sidebar.style.borderLeft = isDarkTheme ? '1px solid #27272a' : '1px solid #e4e4e7';
      header.style.background = isDarkTheme ? '#09090b' : '#f4f4f5';
      header.style.borderBottom = isDarkTheme ? '1px solid #27272a' : '1px solid #e4e4e7';
      title.style.color = isDarkTheme ? '#a78bfa' : '#7c3aed';
      iframe.style.background = isDarkTheme ? '#09090b' : '#ffffff';
    }
  });

  // Auto-open after a short delay so the page settles
  setTimeout(openSidebar, 600);
})();
