import { db } from './firebase.js';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';

export const renderHome = (container) => {
  container.innerHTML = `
    <header class="header">
      <div class="logo-container">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>
        <div class="logo-text">
          <h1>SmartStation</h1>
          <p>Campus Utility Hub</p>
        </div>
      </div>
      <div class="nav-icons" style="margin-bottom: 0;">
        <a href="#/"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E1FF" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></a>
        <a href="#/qr"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h1"/><path d="M7 11h1"/><path d="M7 15h1"/><path d="M11 7h1"/><path d="M11 11h1"/><path d="M11 15h1"/><path d="M15 7h1"/><path d="M15 11h1"/><path d="M15 15h1"/></svg></a>
        <a href="#/dashboard"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></a>
      </div>
    </header>

    <div class="portal-container">
      <section class="glass card glass-cyan" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 class="font-head" style="font-size: 1rem; color: var(--cyan-primary);">AVAILABLE LOST ITEMS</h2>
          <span id="system-status" class="status-pill animate-pulse" style="border: 1px solid var(--green-status); color: var(--green-status); background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">Syncing...</span>
        </div>

        <div id="inventory-list">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="text-align: left; font-size: 0.75rem; color: var(--text-dim);">
                <th style="padding: 1rem 0;">Identification</th>
                <th style="padding: 1rem 0;">Status</th>
                <th style="padding: 1rem 0;">Action</th>
              </tr>
            </thead>
            <tbody id="inventory-tbody">
              <tr id="loading-state">
                <td colspan="3" style="text-align: center; color: var(--text-dim); padding: 4rem 1rem; font-size: 0.9rem;">
                  Searching the storage matrix...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <div style="text-align: center; margin-bottom: 2rem;">
        <p style="color: var(--text-dim); font-size: 0.85rem;">
          "Initialize scan sequence to store or retrieve items."
        </p>
      </div>
    </div>

    <footer class="footer">
      <h3>QUICK ACCESS</h3>
      <a href="#/" class="footer-link">Available Lost Items</a>
      <a href="#/history" class="footer-link">Claimed Items History</a>
      <a href="#/dashboard" class="footer-link">Segregator Dashboard</a>
      
      <h3 style="margin-top: 2rem;">STATION INFO</h3>
      <p style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; font-size: 0.9rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-primary)" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        Campus Central Hub, Building A
      </p>
      <p style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-primary)" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        support@smartstation.campus
      </p>
      <div style="margin-top: 3rem; font-size: 0.75rem; color: var(--text-dim); opacity: 0.7; text-align: center;">
        ©️ 2026 SmartStation. Powered by advanced IoT technology.
      </div>
    </footer>
  `

  const tbody = document.getElementById('inventory-tbody');
  const statusPill = document.getElementById('system-status');

  // Fetch items that are currently "STORED"
  const q = query(collection(db, "inventory"), where("type", "==", "STORE"), orderBy("timestamp", "desc"));
  
  onSnapshot(q, (snapshot) => {
    tbody.innerHTML = '';
    
    if (snapshot.empty) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--text-dim); padding: 4rem 1rem; font-size: 0.9rem;">
            No assets currently secured in the storage matrix.
          </td>
        </tr>
      `;
    } else {
      snapshot.forEach((doc) => {
        const item = doc.data();
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-dim)';
        tr.style.fontSize = '0.85rem';
        
        tr.innerHTML = `
          <td style="padding: 1.25rem 0;">
            <div style="font-weight: bold; color: #fff;">ID: ${item.email.split('@')[0]}</div>
            <div style="font-size: 0.7rem; color: var(--text-dim);">${item.timestamp?.toDate().toLocaleString() || 'Pending...'}</div>
          </td>
          <td style="padding: 1.25rem 0;">
            <span style="color: var(--cyan-primary); background: rgba(0, 225, 255, 0.1); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">SECURED</span>
          </td>
          <td style="padding: 1.25rem 0;">
            <a href="#/portal" style="color: var(--cyan-primary); text-decoration: none; font-weight: bold; font-size: 0.75rem;">CLAIM > </a>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
    statusPill.textContent = 'System Online';
    statusPill.classList.remove('animate-pulse');
  }, (error) => {
    console.error("Firestore error:", error);
    statusPill.textContent = 'Connection Error';
    statusPill.style.color = '#ef4444';
  });
}
