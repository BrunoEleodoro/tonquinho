import { useState } from 'react'
import { TonConnectButton, useTonAddress, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const userFriendlyAddress = useTonAddress()
  const wallet = useTonWallet()
  const [tonConnectUI] = useTonConnectUI()

  const sendTransaction = async () => {
    if (!wallet) return

    try {
      await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: "0QD-SuoCHsCL2pIZfE8IAKsjc0aDpDUQAoo-ALHl2mje04A-",
            amount: "20000000",
          },
        ],
      })
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>TON Connect React App</h1>
      
      <div className="card">
        <TonConnectButton />
        
        {wallet && (
          <div style={{ marginTop: '20px' }}>
            <p>Connected wallet: {wallet.device.appName}</p>
            <p>Address: {userFriendlyAddress}</p>
            <button onClick={sendTransaction} style={{ marginTop: '10px' }}>
              Send Test Transaction (0.02 TON)
            </button>
          </div>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
        
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
