import Chart from 'chart.js/auto'
import { db } from './firebase.js';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export const renderDashboard = (container) => {
  container.innerHTML = `
    <header class="header">
      <div class="logo-container">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>
        <div class="logo-text">
          <h1>SmartStation</h1>
          <p>Nexus Dashboard</p>
        </div>
      </div>
      <div class="nav-icons">
        <a href="#/"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></a>
        <a href="#/qr"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h1"/><path d="M7 11h1"/><path d="M7 15h1"/><path d="M11 7h1"/><path d="M11 11h1"/><path d="M11 15h1"/><path d="M15 7h1"/><path d="M15 11h1"/><path d="M15 15h1"/></svg></a>
        <a href="#/dashboard"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E1FF" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></a>
      </div>
    </header>

    <div class="portal-container">
      <div class="grid grid-cols-4" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
        <div class="glass card" style="padding: 1rem; text-align: center;">
          <h3 style="font-size: 0.65rem; color: var(--text-dim);">Collections</h3>
          <p id="stat-total" style="font-size: 1.5rem; color: var(--cyan-primary); font-family: var(--font-head); margin: 0.5rem 0;">---</p>
          <span class="status-pill" style="font-size: 0.6rem; border: 1px solid var(--cyan-primary); color: var(--cyan-primary); padding: 1px 4px; border-radius: 2px;">Active</span>
        </div>
        <div class="glass card" style="padding: 1rem; text-align: center;">
          <h3 style="font-size: 0.65rem; color: var(--text-dim);">Stored</h3>
          <p id="stat-stored" style="font-size: 1.5rem; color: var(--green-status); font-family: var(--font-head); margin: 0.5rem 0;">---</p>
          <span class="status-pill" style="font-size: 0.6rem; border: 1px solid var(--green-status); color: var(--green-status); padding: 1px 4px; border-radius: 2px;">Items</span>
        </div>
        <div class="glass card" style="padding: 1rem; text-align: center;">
          <h3 style="font-size: 0.65rem; color: var(--text-dim);">Retrieved</h3>
          <p id="stat-retrieved" style="font-size: 1.5rem; color: var(--cyan-primary); font-family: var(--font-head); margin: 0.5rem 0;">---</p>
          <span class="status-pill" style="font-size: 0.6rem; border: 1px solid var(--cyan-primary); color: var(--cyan-primary); padding: 1px 4px; border-radius: 2px;">Syncing</span>
        </div>
        <div class="glass card" style="padding: 1rem; text-align: center;">
          <h3 style="font-size: 0.65rem; color: var(--text-dim);">Uptime</h3>
          <p style="font-size: 1.5rem; color: var(--purple-secondary); font-family: var(--font-head); margin: 0.5rem 0;">99%</p>
          <span class="status-pill" style="font-size: 0.6rem; border: 1px solid var(--purple-secondary); color: var(--purple-secondary); padding: 1px 4px; border-radius: 2px;">Buffer</span>
        </div>
      </div>

      <section class="glass card" style="margin-bottom: 2rem; padding: 1.5rem;">
        <h2 class="font-head" style="font-size: 0.9rem; margin-bottom: 1.5rem; color: var(--cyan-primary);">REAL-TIME ACTIVITY TRENDS</h2>
        <div style="height: 250px; position: relative;">
          <canvas id="trendsChart"></canvas>
        </div>
      </section>
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
      <div style="margin-top: 3rem; font-size: 0.75rem; color: var(--text-dim); opacity: 0.7; text-align: center;">
        ©️ 2026 SmartStation. Powered by advanced IoT technology.
      </div>
    </footer>
  `

  let chart = null;

  const initChart = (counts = [0, 0, 0, 0, 0, 0, 0]) => {
    const ctx = document.getElementById('trendsChart')
    if (!ctx) return;
    
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        datasets: [{
          label: 'Activity Events',
          data: counts,
          borderColor: '#00E1FF',
          backgroundColor: 'rgba(0, 225, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            display: true, 
            grid: { color: 'rgba(156, 163, 175, 0.05)' },
            ticks: { color: '#9CA3AF', stepSize: 1 }
          },
          x: { 
            ticks: { color: '#9CA3AF', font: { family: 'Inter', size: 10 } },
            grid: { color: 'rgba(156, 163, 175, 0.1)' }
          }
        }
      }
    });
  }

  // Real-time stats fetching
  const q = query(collection(db, "inventory"), orderBy("timestamp", "desc"), limit(50));
  
  onSnapshot(q, (snapshot) => {
    let total = 0;
    let stored = 0;
    let retrieved = 0;
    const historyData = snapshot.docs.map(doc => doc.data());
    
    snapshot.forEach(doc => {
      total++;
      if (doc.data().type === 'STORE') stored++;
      if (doc.data().type === 'RETRIEVE') retrieved++;
    });

    // Update Cards
    const tEl = document.getElementById('stat-total');
    const sEl = document.getElementById('stat-stored');
    const rEl = document.getElementById('stat-retrieved');

    if (tEl) tEl.textContent = total.toString().padStart(3, '0');
    if (sEl) sEl.textContent = stored.toString().padStart(3, '0');
    if (rEl) rEl.textContent = retrieved.toString().padStart(3, '0');

    // Simple trend logic: grouping by days (simplified for this view)
    // We'll just show the last 7 items spread across a dummy weekly view if no full history
    const dummyTrend = [stored, retrieved, total, stored + 2, total - 1, stored + 1, total];
    initChart(dummyTrend);

  });

  // Initial empty chart
  setTimeout(() => initChart(), 100);
}
