import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from './config/contracts';
import WalletComponent from './components/Wallet';
import PaymentCard from './components/PaymentCard';
import Explorer from './components/Explorer';
import Finance from './components/Finance';

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [activeTab, setActiveTab] = useState('social');
  const [walletBalance, setWalletBalance] = useState('0');
  const [contracts, setContracts] = useState({});

  // Connect to BlockDAG Primordial Testnet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);

        // Create provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setProvider(provider);
        setSigner(signer);

        // Check if we're on the right network
        const network = await provider.getNetwork();
        if (network.chainId !== NETWORK_CONFIG.CHAIN_ID) {
          // Switch to BlockDAG Primordial Testnet
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${NETWORK_CONFIG.CHAIN_ID.toString(16)}` }],
            });
          } catch (switchError) {
            // If network doesn't exist, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${NETWORK_CONFIG.CHAIN_ID.toString(16)}`,
                  chainName: 'BlockDAG Primordial Testnet',
                  nativeCurrency: {
                    name: 'BDAG',
                    symbol: 'BDAG',
                    decimals: 18
                  },
                  rpcUrls: [NETWORK_CONFIG.RPC_URL],
                  blockExplorerUrls: [NETWORK_CONFIG.EXPLORER_URL]
                }]
              });
            }
          }
        }

        // Initialize contracts
        await initializeContracts(signer);
       
        // Get initial balance
        await updateBalance(account, signer);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Initialize all smart contracts
  const initializeContracts = async (signer) => {
    try {
      // Import contract ABIs (you'll need these)
      const contractABIs = {
        // Add your contract ABIs here
      };

      const contractInstances = {};
     
      // Initialize each contract
      Object.entries(CONTRACT_ADDRESSES).forEach(([name, address]) => {
        if (contractABIs[name]) {
          contractInstances[name] = new ethers.Contract(address, contractABIs[name], signer);
        }
      });

      setContracts(contractInstances);
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  };

  // Update wallet balance
  const updateBalance = async (account, signer) => {
    try {
      if (contracts.EMPOWER_TOKEN) {
        const balance = await contracts.EMPOWER_TOKEN.balanceOf(account);
        setWalletBalance(ethers.utils.formatEther(balance));
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
        if (accounts[0] && signer) {
          updateBalance(accounts[0], signer);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, [signer]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">EmpowerHer</h1>
            </div>
           
            <div className="flex items-center space-x-4">
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {walletBalance} EMW
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('social')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'social'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Social
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'health'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Health & Safety
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'finance'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Finance
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wallet'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setActiveTab('card')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'card'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payment Card
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'explorer'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Explorer
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'social' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Social Platform</h2>
            <p className="text-gray-600">Women-first content creation with on-chain rewards</p>
            {/* Add your social features here */}
          </div>
        )}

        {activeTab === 'health' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Health & Safety</h2>
            <p className="text-gray-600">Emergency response, medical records, and clinic bookings</p>
            {/* Add your health features here */}
          </div>
        )}

        {activeTab === 'finance' && (
          <Finance
            account={account}
            contracts={contracts}
            onTransaction={updateBalance}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletComponent
            account={account}
            balance={walletBalance}
            contracts={contracts}
            onTransaction={updateBalance}
          />
        )}

        {activeTab === 'card' && (
          <PaymentCard
            account={account}
            balance={walletBalance}
            onTransaction={updateBalance}
          />
        )}

        {activeTab === 'explorer' && (
          <Explorer
            account={account}
            contracts={contracts}
          />
        )}
      </main>
    </div>
  );
}


export default App;


