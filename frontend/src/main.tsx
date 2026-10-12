import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SessionExpiredModal } from './components/session-expired-modal'
import AppRouter from './router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionExpiredModal />
    <AppRouter />
  </StrictMode>,
)
