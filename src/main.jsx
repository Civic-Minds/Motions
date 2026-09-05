import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// The browser's own scroll restoration re-applies a remembered scroll
// position for a URL's history entry after our own scroll-to-top logic runs,
// which shows up as pages (e.g. a HardRedirect target) loading pre-scrolled.
// The app already resets scroll on every route change itself, so take over
// entirely instead of racing the browser's version.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
