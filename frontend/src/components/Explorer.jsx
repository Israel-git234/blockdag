import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, Eye, Copy, TrendingUp, Users, DollarSign } from 'lucide-react';

const Explorer = ({ account, contracts }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [platformStats, setPlatformStats] = useState({
        totalUsers: 1250,
        totalTransactions: 45678,
        totalVolume: 1250000,
        activeCreators: 89
    });
    const [selectedTx, setSelectedTx] = useState(null);

    // Mock recent transactions from various contracts
    useEffect(() => {
        const mockTransactions = [
            {
                id: '0x1234...5678',
                type: 'Creator Registration',
                contract: 'CreatorRegistry',
                user: '0xabcd...efgh',
                timestamp: Date.now() - 300000,
                status: 'confirmed',
                blockNumber: 12345678,
                gasUsed: '125,000',
                gasPrice: '20 Gwei'
            },
            {
                id: '0x8765...4321',
                type: 'Ad Revenue Payout',
                contract: 'AdRevenuePool',
                user: '0xijkl...mnop',
                timestamp: Date.now() - 600000,
                status: 'confirmed',
                blockNumber: 12345677,
                gasUsed: '98,000',
                gasPrice: '20 Gwei'
            },
            {
                id: '0x9876...5432',
                type: 'Course Certificate Minted',
                contract: 'CourseCertSBT',
                user: '0xqrst...uvwx',
                timestamp: Date.now() - 900000,
                status: 'confirmed',
                blockNumber: 12345676,
                gasUsed: '156,000',
                gasPrice: '20 Gwei'
            },
            {
                id: '0x5432...1098',
                type: 'SOS Alert',
                contract: 'SOSRegistry',
                user: '0xyzaa...bbcc',
                timestamp: Date.now() - 1200000,
                status: 'confirmed',
                blockNumber: 12345675,
                gasUsed: '67,000',
                gasPrice: '20 Gwei'
            },
            {
                id: '0x2109...8765',
                type: 'Grant Created',
                contract: 'GrantDAO',
                user: '0xdddd...eeee',
                timestamp: Date.now() - 1500000,
                status: 'confirmed',
                blockNumber: 12345674,
                gasUsed: '234,000',
                gasPrice: '20 Gwei'
            }
        ];
        setRecentTransactions(mockTransactions);
    }, []);

    const handleSearch = () => {
        // In production, this would search the blockchain
        console.log('Searching for:', searchQuery);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const openInExplorer = (txHash) => {
        // In production, this would open in the actual BlockDAG explorer
        window.open(`https://explorer.blockdag.com/tx/${txHash}`, '_blank');
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'Creator Registration':
                return '👩‍💻';
            case 'Ad Revenue Payout':
                return '💰';
            case 'Course Certificate Minted':
                return '🎓';
            case 'SOS Alert':
                return '🚨';
            case 'Grant Created':
                return '🎯';
            default:
                return '📄';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-600';
            case 'pending':
                return 'bg-yellow-100 text-yellow-600';
            case 'failed':
                return 'bg-red-100 text-red-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Eye className="mr-2" />
                    BlockDAG Explorer
                </h2>
                <div className="text-sm text-gray-500">
                    Real-time blockchain transparency
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Search by transaction hash, address, or block number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </button>
                </div>
            </div>

            {/* Platform Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-800">{formatNumber(platformStats.totalUsers)}</div>
                    <div className="text-sm text-blue-600">Total Users</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-800">{formatNumber(platformStats.totalTransactions)}</div>
                    <div className="text-sm text-green-600">Transactions</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-800">${formatNumber(platformStats.totalVolume)}</div>
                    <div className="text-sm text-purple-600">Total Volume</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-800">{platformStats.activeCreators}</div>
                    <div className="text-sm text-orange-600">Active Creators</div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div>
                <h3 className="font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                    {recentTransactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedTx(tx)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                                    <div>
                                        <div className="font-medium">{tx.type}</div>
                                        <div className="text-sm text-gray-500">
                                            Contract: {tx.contract}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-gray-600">{tx.id}</div>
                                    <div className="text-xs text-gray-500">
                                        Block #{tx.blockNumber}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(tx.id);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Copy Transaction Hash"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openInExplorer(tx.id);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="View on Explorer"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                <div className="flex justify-between">
                                    <span>User: {tx.user}</span>
                                    <span>Gas: {tx.gasUsed} @ {tx.gasPrice}</span>
                                    <span>{formatTimestamp(tx.timestamp)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transaction Details Modal */}
            {selectedTx && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Transaction Details</h3>
                            <button
                                onClick={() => setSelectedTx(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-600">Transaction Hash</div>
                                <div className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedTx.id}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600">Type</div>
                                    <div className="font-medium">{selectedTx.type}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Status</div>
                                    <div className="font-medium">{selectedTx.status}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Block Number</div>
                                    <div className="font-medium">{selectedTx.blockNumber}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Contract</div>
                                    <div className="font-medium">{selectedTx.contract}</div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-sm text-gray-600">User Address</div>
                                <div className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedTx.user}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600">Gas Used</div>
                                    <div className="font-medium">{selectedTx.gasUsed}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Gas Price</div>
                                    <div className="font-medium">{selectedTx.gasPrice}</div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-sm text-gray-600">Timestamp</div>
                                <div className="font-medium">{formatTimestamp(selectedTx.timestamp)}</div>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex space-x-3">
                            <button
                                onClick={() => openInExplorer(selectedTx.id)}
                                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View on Explorer
                            </button>
                            <button
                                onClick={() => copyToClipboard(selectedTx.id)}
                                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Hash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Explorer;
