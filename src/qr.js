export const renderQR = (container) => {
  container.innerHTML = `
    <header class="header">
      <div class="logo-container">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>
        <div class="logo-text">
          <h1>SmartStation</h1>
          <p>QR Access Portal</p>
        </div>
      </div>
      <div class="nav-icons">
        <a href="#/"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></a>
        <a href="#/qr"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E1FF" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h1"/><path d="M7 11h1"/><path d="M7 15h1"/><path d="M11 7h1"/><path d="M11 11h1"/><path d="M11 15h1"/><path d="M15 7h1"/><path d="M15 11h1"/><path d="M15 15h1"/></svg></a>
        <a href="#/dashboard"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></a>
      </div>
    </header>

    <div class="portal-container" style="text-align: center; padding: 2rem 1.5rem;">
      <h2 class="font-head" style="font-size: 2.5rem; margin-bottom: 2rem; background: linear-gradient(180deg, #00E1FF, #A855F7); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
        SMART STATION<br>QR ACCESS CODE
      </h2>
      
      <p style="color: var(--text-dim); font-size: 0.95rem; margin-bottom: 2rem; line-height: 1.6;">
        Print or display this QR code on your storage box. Users can scan it to access the store/retrieve portal.
      </p>

      <div style="width: 250px; height: 250px; background: #fff; padding: 15px; border-radius: 12px; box-shadow: 0 0 40px var(--cyan-glow); margin: 0 auto 2.5rem;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://jrujju-smart-station.web.app/#/portal" alt="Access QR" style="width: 100%; height: 100%;">
      </div>
      
      <a href="#/portal" class="btn btn-cyan animate-pulse" style="width: 100%; padding: 1.25rem; font-family: var(--font-head); font-weight: 700; font-size: 1.1rem; letter-spacing: 2px;">
        SCAN TO ACCESS PORTAL
      </a>
      
      <div style="margin-top: 2rem; color: var(--text-dim); text-transform: uppercase; font-family: var(--font-head); font-size: 0.7rem; letter-spacing: 4px; opacity: 0.5;">
        System Online // Nexus v2.4
      </div>
    </div>

    <footer class="footer">
      <h3>QUICK ACCESS</h3>
      <a href="#/" class="footer-link">Available Lost Items</a>
      <a href="#/history" class="footer-link">Claimed Items History</a>
      <a href="#/dashboard" class="footer-link">Segregator Dashboard</a>
    </footer>
  `
}
