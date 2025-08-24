import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Heart, Shield, GraduationCap, Video, DollarSign, User, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import HealthSafety from './components/HealthSafety';
import Education from './components/Education';
import Social from './components/Social';
import Finance from './components/Finance';
import Profile from './components/Profile';
import WalletConnection from './components/WalletConnection';
import blockchainService from './services/blockchain';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected on app load
    checkInitialWalletConnection();
  }, []);

  const checkInitialWalletConnection = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const network = await window.ethereum.request({ method: 'eth_chainId' });
          setAccount(accounts[0]);
          setNetwork(getNetworkName(network));
          setWalletConnected(true);
        }
      }
    } catch (error) {
      console.error('Error checking initial wallet connection:', error);
    }
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case '0xaa36a7': return 'Sepolia';
      case '0x5': return 'Goerli';
      case '0x539': return 'Local';
      default: return 'Unknown';
    }
  };

  const handleWalletConnected = (accountAddress, networkName) => {
    setAccount(accountAddress);
    setNetwork(networkName);
    setWalletConnected(true);
    setShowWalletModal(false);
  };

  const handleWalletDisconnected = () => {
    setAccount(null);
    setNetwork(null);
    setWalletConnected(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    closeSidebar();
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Heart, path: '/' },
    { id: 'health', label: 'Health & Safety', icon: Shield, path: '/health' },
    { id: 'education', label: 'Education', icon: GraduationCap, path: '/education' },
    { id: 'social', label: 'Social Network', icon: Video, path: '/social' },
    { id: 'finance', label: 'Financial Services', icon: DollarSign, path: '/finance' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard account={account} network={network} walletConnected={walletConnected} />;
      case 'health':
        return <HealthSafety account={account} network={network} walletConnected={walletConnected} />;
      case 'education':
        return <Education account={account} network={network} walletConnected={walletConnected} />;
      case 'social':
        return <Social account={account} network={network} walletConnected={walletConnected} />;
      case 'finance':
        return <Finance account={account} network={network} walletConnected={walletConnected} />;
      case 'profile':
        return <Profile account={account} network={network} walletConnected={walletConnected} />;
      default:
        return <Dashboard account={account} network={network} walletConnected={walletConnected} />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Title */}
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Women's Empowerment</h1>
                    <p className="text-sm text-gray-600">Blockchain Platform</p>
                  </div>
                </div>
              </div>

              {/* Wallet Connection */}
              <div className="flex items-center gap-4">
                {walletConnected ? (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Connected</div>
                      <div className="text-sm font-medium text-gray-900">
                        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Unknown'}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      network === 'Sepolia' ? 'text-purple-600 bg-purple-50' :
                      network === 'Goerli' ? 'text-blue-600 bg-blue-50' :
                      network === 'Local' ? 'text-green-600 bg-green-50' :
                      'text-gray-600 bg-gray-50'
                    }`}>
                      {network || 'Unknown'}
                    </div>
                    <button
                      onClick={() => setShowWalletModal(true)}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Wallet
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <button
                onClick={closeSidebar}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="mt-6 px-3">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${
                          activeTab === item.id ? 'text-purple-600' : 'text-gray-500'
                        }`} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Wallet Status */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              {walletConnected ? (
                <div className="text-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">Wallet Connected</p>
                  <p className="text-xs text-gray-500">{network} Network</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">Wallet Disconnected</p>
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="text-xs text-purple-600 hover:text-purple-700 mt-1"
                  >
                    Connect Now
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {renderContent()}
            </div>
          </main>
        </div>

        {/* Wallet Connection Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Wallet Connection</h3>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <WalletConnection
                  onWalletConnected={handleWalletConnected}
                  onWalletDisconnected={handleWalletDisconnected}
                />
              </div>
            </div>
          </div>
        )}

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </div>
    </Router>
  );
}

export default App;


