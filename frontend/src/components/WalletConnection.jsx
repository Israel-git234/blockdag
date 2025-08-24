import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import blockchainService from '../services/blockchain';

const WalletConnection = ({ onWalletConnected, onWalletDisconnected }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState('');
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
    
    // Listen for wallet events
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await handleWalletConnection(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      handleWalletDisconnection();
    } else {
      await handleWalletConnection(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const result = await blockchainService.connectWallet();
      
      if (result.success) {
        await handleWalletConnection(result.account);
        setNetwork(result.network);
        
        // Check if network is supported
        if (result.chainId !== 11155111 && result.chainId !== 5 && result.chainId !== 1337) {
          setShowNetworkWarning(true);
        }
        
        if (onWalletConnected) {
          onWalletConnected(result.account, result.network);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to connect wallet: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletConnection = async (accountAddress) => {
    setAccount(accountAddress);
    setIsConnected(true);
    
    // Get account balance
    try {
      const balanceResult = await blockchainService.getBalance(accountAddress);
      setBalance(balanceResult);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const handleWalletDisconnection = () => {
    setAccount(null);
    setIsConnected(false);
    setNetwork(null);
    setBalance('0');
    setError('');
    setShowNetworkWarning(false);
    
    blockchainService.disconnect();
    
    if (onWalletDisconnected) {
      onWalletDisconnected();
    }
  };

  const disconnectWallet = () => {
    handleWalletDisconnection();
  };

  const switchToSupportedNetwork = async () => {
    try {
      // Try to switch to Sepolia testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
      });
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'SEP',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            }],
          });
        } catch (addError) {
          setError('Failed to add Sepolia network: ' + addError.message);
        }
      } else {
        setError('Failed to switch network: ' + error.message);
      }
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      // You could add a toast notification here
    }
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkColor = (networkName) => {
    switch (networkName?.toLowerCase()) {
      case 'sepolia':
        return 'text-purple-600 bg-purple-50';
      case 'goerli':
        return 'text-blue-600 bg-blue-50';
      case 'hardhat':
      case 'localhost':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        {/* Network Warning */}
        {showNetworkWarning && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Unsupported Network</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1 mb-2">
              Please switch to Sepolia testnet for the best experience.
            </p>
            <button
              onClick={switchToSupportedNetwork}
              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
            >
              Switch to Sepolia
            </button>
          </div>
        )}

        {/* Connected Wallet Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Connected</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkColor(network)}`}>
                  {network || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{shortenAddress(account)}</span>
                <button
                  onClick={copyAddress}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy address"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Balance</div>
            <div className="text-lg font-semibold text-gray-900">{parseFloat(balance).toFixed(4)} ETH</div>
          </div>
        </div>

        {/* Disconnect Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={disconnectWallet}
            className="w-full bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gray-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600 mb-6">
          Connect your MetaMask wallet to access the Women's Empowerment Platform
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
        >
          {isConnecting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Connect MetaMask
            </>
          )}
        </button>

        <div className="mt-4 text-xs text-gray-500">
          <p>Supported networks: Sepolia, Goerli, Local</p>
          <p>Make sure MetaMask is installed and unlocked</p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnection;
