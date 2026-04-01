import { db } from './firebase.js';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export const renderHistory = (container) => {
  container.innerHTML = `
    <header class="header">
      <div class="logo-container">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>
        <div class="logo-text">
          <h1>SmartStation</h1>
          <p>Archive Log</p>
        </div>
      </div>
      <div class="nav-icons">
        <a href="#/"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></a>
        <a href="#/qr"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h1"/><path d="M7 11h1"/><path d="M7 15h1"/><path d="M11 7h1"/><path d="M11 11h1"/><path d="M11 15h1"/><path d="M15 7h1"/><path d="M15 11h1"/><path d="M15 15h1"/></svg></a>
        <a href="#/dashboard"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></a>
      </div>
    </header>

    <div class="portal-container">
      <section class="glass card" style="border-left: 4px solid var(--purple-secondary); padding: 1.5rem; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 class="font-head" style="font-size: 1rem; color: var(--purple-secondary);">CLAIMED ITEMS HISTORY</h2>
          <span id="history-status" class="status-pill" style="border: 1px solid var(--purple-secondary); color: var(--purple-secondary); background: rgba(168, 85, 247, 0.1); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">Syncing Archive...</span>
        </div>

        <div id="claimed-list">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="text-align: left; font-size: 0.75rem; color: var(--text-dim);">
                <th style="padding: 1rem 0;">Identification</th>
                <th style="padding: 1rem 0;">Temporal Status</th>
                <th style="padding: 1rem 0;">Metadata</th>
              </tr>
            </thead>
            <tbody id="claimed-tbody">
              <tr id="empty-state">
                <td colspan="3" style="text-align: center; color: var(--text-dim); padding: 4rem 1rem; font-size: 0.85rem;">
                  History archive synchronization active. No records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <footer class="footer">
      <h3>QUICK ACCESS</h3>
      <a href="#/" class="footer-link">Available Lost Items</a>
      <a href="#/history" class="footer-link">Claimed Items History</a>
      <a href="#/dashboard" class="footer-link">Segregator Dashboard</a>
      
      <h3 style="margin-top: 2rem;">STATION INFO</h3>
      <p style="margin-top: 3rem; font-size: 0.75rem; color: var(--text-dim); opacity: 0.7; text-align: center;">
        ©️ 2026 SmartStation. Powered by advanced IoT technology.
      </p>
    </footer>
  `

  const tbody = document.getElementById('claimed-tbody');
  const statusPill = document.getElementById('history-status');

  // Fetch all transactions/inventory events
  const q = collection(db, "inventory");
  
  onSnapshot(q, (snapshot) => {
    // Sort in JavaScript to avoid Firestore Index requirements
    const items = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));

    tbody.innerHTML = '';
    
    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--text-dim); padding: 4rem 1rem; font-size: 0.85rem;">
            History archive synchronization active. No records found.
          </td>
        </tr>
      `;
    } else {
      items.forEach((item) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-dim)';
        tr.style.fontSize = '0.8rem';
        
        const isStore = item.type === 'STORE';
        
        tr.innerHTML = `
          <td style="padding: 1.25rem 0;">
            <div style="font-weight: bold; color: #fff;">ID: ${item.email?.split('@')[0] || 'Unknown'}</div>
            <div style="font-size: 0.65rem; color: var(--text-dim);">${item.timestamp?.toDate().toLocaleDateString() || 'Recent'}</div>
          </td>
          <td style="padding: 1.25rem 0;">
            <span style="color: ${isStore ? 'var(--cyan-primary)' : 'var(--purple-secondary)'}; font-weight: bold;">
              ${isStore ? 'STORED' : 'RETRIEVED'}
            </span>
          </td>
          <td style="padding: 1.25rem 0;">
            <div style="font-size: 0.7rem; color: var(--text-dim);">STATION-01</div>
            <div style="font-size: 0.6rem; opacity: 0.5;">HASH: ${item.id.substring(0, 8)}</div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
    statusPill.textContent = 'Archive Sync Online';
  }, (error) => {
    console.error("Firestore history error:", error);
    alert("History Sync Error: " + error.message);
    statusPill.textContent = 'Sync Failed';
  });
}
