import './style.css'
import { renderHome } from './home.js'
import { renderQR } from './qr.js'
import { renderDashboard } from './dashboard.js'
import { renderHistory } from './history.js'
import { renderPortal } from './portal.js'

const app = document.querySelector('#app')

const router = () => {
  const path = window.location.hash || '#/'
  app.innerHTML = '' // Clear page
  
  if (path === '#/' || path === '') {
    renderHome(app)
  } else if (path === '#/qr') {
    renderQR(app)
  } else if (path === '#/dashboard') {
    renderDashboard(app)
  } else if (path === '#/history') {
    renderHistory(app)
  } else if (path === '#/portal') {
    renderPortal(app)
  }
}

window.addEventListener('hashchange', router)
window.addEventListener('load', router)
document.addEventListener('click', (e) => {
  if (e.target.matches('nav a')) {
    e.preventDefault()
    window.location.hash = e.target.getAttribute('href')
  }
})
