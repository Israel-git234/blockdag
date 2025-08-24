import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Shield, Eye, EyeOff, Copy, Download, Upload } from 'lucide-react';

const WalletComponent = ({ account, tokenContract, onBalanceUpdate }) => {
    const [balance, setBalance] = useState('0');
    const [showSeed, setShowSeed] = useState(false);
    const [seedPhrase, setSeedPhrase] = useState('');
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Generate a mock seed phrase (in production, this would come from wallet generation)
    useEffect(() => {
        if (account && !seedPhrase) {
            // Mock seed phrase - in real implementation this would be generated securely
            const mockSeed = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
            setSeedPhrase(mockSeed);
        }
    }, [account, seedPhrase]);

    // Fetch balance
    useEffect(() => {
        const fetchBalance = async () => {
            if (account && tokenContract) {
                try {
                    const bal = await tokenContract.balanceOf(account);
                    const formattedBalance = ethers.utils.formatEther(bal);
                    setBalance(formattedBalance);
                    if (onBalanceUpdate) {
                        onBalanceUpdate(formattedBalance);
                    }
                } catch (error) {
                    console.error('Error fetching balance:', error);
                }
            }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, [account, tokenContract, onBalanceUpdate]);

    // Mock transaction history
    useEffect(() => {
        if (account) {
            const mockTransactions = [
                {
                    id: 1,
                    type: 'received',
                    amount: '50.0',
                    from: '0x1234...5678',
                    to: account.substring(0, 6) + '...' + account.substring(account.length - 4),
                    timestamp: Date.now() - 3600000,
                    status: 'confirmed'
                },
                {
                    id: 2,
                    type: 'sent',
                    amount: '25.0',
                    from: account.substring(0, 6) + '...' + account.substring(account.length - 4),
                    to: '0x8765...4321',
                    timestamp: Date.now() - 7200000,
                    status: 'confirmed'
                }
            ];
            setTransactions(mockTransactions);
        }
    }, [account]);

    const handleSend = async () => {
        if (!recipient || !amount || !tokenContract) return;
        
        setIsLoading(true);
        try {
            const amountInWei = ethers.utils.parseEther(amount);
            const tx = await tokenContract.transfer(recipient, amountInWei);
            await tx.wait();
            
            // Add to transaction history
            const newTx = {
                id: Date.now(),
                type: 'sent',
                amount: amount,
                from: account.substring(0, 6) + '...' + account.substring(account.length - 4),
                to: recipient.substring(0, 6) + '...' + recipient.substring(recipient.length - 4),
                timestamp: Date.now(),
                status: 'confirmed'
            };
            setTransactions([newTx, ...transactions]);
            
            // Clear form
            setRecipient('');
            setAmount('');
            
            // Refresh balance
            const bal = await tokenContract.balanceOf(account);
            setBalance(ethers.utils.formatEther(bal));
            
        } catch (error) {
            console.error('Error sending tokens:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const exportWallet = () => {
        const walletData = {
            address: account,
            seedPhrase: seedPhrase,
            balance: balance,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet-${account.substring(0, 8)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleBiometric = () => {
        setIsBiometricEnabled(!isBiometricEnabled);
        // In production, this would integrate with actual biometric authentication
    };

    const formatAddress = (address) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Wallet className="mr-2" />
                    BlockDAG Wallet
                </h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={toggleBiometric}
                        className={`p-2 rounded-lg ${isBiometricEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                        title="Toggle Biometric Security"
                    >
                        <Shield className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Balance Display */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                <div className="text-sm opacity-90">Total Balance</div>
                <div className="text-3xl font-bold">{parseFloat(balance).toFixed(2)} EMW</div>
                <div className="text-sm opacity-90 mt-1">≈ ${(parseFloat(balance) * 0.5).toFixed(2)} USD</div>
            </div>

            {/* Address and Seed */}
            <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Wallet Address</div>
                    <div className="flex items-center justify-between">
                        <code className="text-sm font-mono">{formatAddress(account)}</code>
                        <button
                            onClick={() => copyToClipboard(account)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Copy Address"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Seed Phrase</div>
                    <div className="flex items-center justify-between">
                        <code className="text-sm font-mono">
                            {showSeed ? seedPhrase : '••• ••• ••• ••• ••• ••• ••• ••• ••• ••• ••• •••'}
                        </code>
                        <button
                            onClick={() => setShowSeed(!showSeed)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title={showSeed ? "Hide Seed" : "Show Seed"}
                        >
                            {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Send Tokens */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Send Tokens</h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Recipient Address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                        type="number"
                        placeholder="Amount (EMW)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !recipient || !amount}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Send Tokens'}
                    </button>
                </div>
            </div>

            {/* Wallet Actions */}
            <div className="flex space-x-3 mb-6">
                <button
                    onClick={exportWallet}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export Wallet
                </button>
                <button
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Wallet
                </button>
            </div>

            {/* Transaction History */}
            <div>
                <h3 className="font-semibold mb-3">Recent Transactions</h3>
                <div className="space-y-2">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                                tx.type === 'received' ? 'bg-green-50' : 'bg-red-50'
                            }`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-medium ${
                                        tx.type === 'received' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {tx.type === 'received' ? '+' : '-'}{tx.amount} EMW
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {tx.type === 'received' ? 'from' : 'to'} {tx.type === 'received' ? tx.from : tx.to}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {formatTimestamp(tx.timestamp)}
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs ${
                                tx.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                            }`}>
                                {tx.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WalletComponent;
