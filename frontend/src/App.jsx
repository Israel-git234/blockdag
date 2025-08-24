import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG, initializeContracts } from './config/contracts';
import WalletComponent from './components/Wallet';
import PaymentCard from './components/PaymentCard';
import Explorer from './components/Explorer';
import Finance from './components/Finance';
import Social from './components/Social';
import HealthSafety from './components/HealthSafety';
import Profile from './components/Profile';

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [activeTab, setActiveTab] = useState('social');
  const [walletBalance, setWalletBalance] = useState('0');
  const [contracts, setContracts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  // Connect to BlockDAG Primordial Testnet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError('');
      
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
        const contractInstances = await initializeContracts(signer);
        setContracts(contractInstances);
        
        // Get initial balance
        await updateBalance(account, contractInstances.EMPOWER_TOKEN);
        
        showNotification('Wallet connected successfully!');
      } else {
        setError('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update wallet balance
  const updateBalance = async (account, tokenContract) => {
    try {
      if (tokenContract && account) {
        const balance = await tokenContract.balanceOf(account);
        setWalletBalance(ethers.utils.formatEther(balance));
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 4000);
  };

  // Handle transaction
  const handleTransaction = async (txPromise, successMessage = 'Transaction successful!') => {
    try {
      setIsLoading(true);
      setError('');
      
      const tx = await txPromise;
      await tx.wait();
      
      showNotification(successMessage);
      
      // Update balance after transaction
      if (contracts.EMPOWER_TOKEN) {
        await updateBalance(account, contracts.EMPOWER_TOKEN);
      }
      
      return true;
    } catch (error) {
      console.error('Transaction failed:', error);
      setError('Transaction failed: ' + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || '');
        if (accounts[0] && contracts.EMPOWER_TOKEN) {
          updateBalance(accounts[0], contracts.EMPOWER_TOKEN);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, [contracts]);

  // Social tab functionality
  const renderSocial = () => (
    <Social 
      account={account} 
      contracts={contracts}
      onTransaction={handleTransaction}
    />
  );

  // Health & Safety tab functionality
  const renderHealth = () => (
    <HealthSafety 
      account={account} 
      contracts={contracts}
      onTransaction={handleTransaction}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">EmpowerHer</h1>
              <p className="ml-4 text-sm text-gray-600 hidden md:block">Web3 for Women's Safety, Finance & Freedom</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {!account ? (
                <button
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
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
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
            <button onClick={() => setError('')} className="ml-4 font-bold">×</button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
            <p>Processing transaction...</p>
          </div>
        )}

        {!account ? (
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700">Welcome to EmpowerHer!</h3>
            <p className="text-gray-500 mt-2">Connect your wallet to access the women empowerment platform</p>
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div>
            {activeTab === 'social' && renderSocial()}
            {activeTab === 'health' && renderHealth()}
            {activeTab === 'finance' && (
              <Finance 
                account={account} 
                contracts={contracts}
                onTransaction={handleTransaction}
              />
            )}
            {activeTab === 'wallet' && (
              <WalletComponent 
                account={account} 
                balance={walletBalance}
                contracts={contracts}
                onTransaction={handleTransaction}
              />
            )}
            {activeTab === 'card' && (
              <PaymentCard 
                account={account} 
                balance={walletBalance}
                onTransaction={handleTransaction}
              />
            )}
            {activeTab === 'explorer' && (
              <Explorer 
                account={account}
                contracts={contracts}
              />
            )}
            {activeTab === 'profile' && (
              <Profile 
                account={account}
                contracts={contracts}
                onTransaction={handleTransaction}
              />
            )}
          </div>
        )}
      </main>
      
      {/* Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
    </div>
  );
}

export default App;


