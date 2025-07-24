import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { Buffer } from 'buffer'
import './index.css'
import App from './App.tsx'

;(window as any).Buffer = Buffer

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
)
