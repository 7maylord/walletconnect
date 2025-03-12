import ChainSwitch from './components/ChainSwitch'
import WalletConnect from './components/WalletConnect'
import './App.css'

function App() {

  return (
    <>
      <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">EIP-6963 Wallet Selector</h1>
            <WalletConnect />
            <ChainSwitch />
      </div>
    </>
  )
}

export default App
