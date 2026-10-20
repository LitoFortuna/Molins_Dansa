import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tipografies autoallotjades (cap petició a tercers: sense Google Fonts).
import '@fontsource/unbounded/latin-800.css'
import '@fontsource/onest/latin-400.css'
import '@fontsource/onest/latin-500.css'
import '@fontsource/onest/latin-600.css'
import './index.css'
import App from './App.jsx'

// Les entrades per scroll només s'activen si hi ha JS i IntersectionObserver;
// altrament tot el contingut queda visible des del primer moment.
if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('has-reveal')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
