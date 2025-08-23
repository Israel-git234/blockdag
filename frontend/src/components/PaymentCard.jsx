import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

const PaymentCard = ({ account, balance, onTransaction }) => {
    const [cardNumber, setCardNumber] = useState('**** **** **** 1234');
    const [cardHolder, setCardHolder] = useState('JANE DOE');
    const [expiryDate, setExpiryDate] = useState('12/25');
    const [cvv, setCvv] = useState('***');
    const [showCvv, setShowCvv] = useState(false);
    const [fxRate, setFxRate] = useState(0.5); // Mock USD/EMW rate
    const [transactions, setTransactions] = useState([]);
    const [isCardActive, setIsCardActive] = useState(true);
    const [spendingLimit, setSpendingLimit] = useState(1000);
    const [dailySpent, setDailySpent] = useState(0);

    // Mock FX rate updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate FX rate fluctuations
            const change = (Math.random() - 0.5) * 0.02; // ±1% change
            setFxRate(prev => Math.max(0.1, Math.min(2.0, prev + change));
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Mock transaction history
    useEffect(() => {
        const mockTransactions = [
            {
                id: 1,
                merchant: 'Woolworths',
                amount: 45.50,
                currency: 'ZAR',
                timestamp: Date.now() - 3600000,
                status: 'completed',
                category: 'groceries'
            },
            {
                id: 2,
                merchant: 'Uber',
                amount: 120.00,
                currency: 'ZAR',
                timestamp: Date.now() - 7200000,
                status: 'completed',
                category: 'transport'
            },
            {
                id: 3,
                merchant: 'Netflix',
                amount: 15.99,
                currency: 'USD',
                timestamp: Date.now() - 86400000,
                status: 'completed',
                category: 'entertainment'
            }
        ];
        setTransactions(mockTransactions);
    }, []);

    const toggleCard = () => {
        setIsCardActive(!isCardActive);
    };

    const generateReceipt = (transaction) => {
        const receipt = {
            transactionId: `TXN-${Date.now()}`,
            merchant: transaction.merchant,
            amount: transaction.amount,
            currency: transaction.currency,
            emwAmount: (transaction.amount / fxRate).toFixed(2),
            timestamp: new Date().toLocaleString(),
            exchangeRate: fxRate.toFixed(4)
        };

        // In production, this would generate a proper receipt format
        const receiptText = `
Receipt
========
Transaction ID: ${receipt.transactionId}
Merchant: ${receipt.merchant}
Amount: ${receipt.amount} ${receipt.currency}
EMW Amount: ${receipt.emwAmount} EMW
Exchange Rate: ${receipt.exchangeRate} USD/EMW
Time: ${receipt.timestamp}
        `.trim();

        // Create downloadable receipt
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${receipt.transactionId}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        return receipt;
    };

    const formatCurrency = (amount, currency) => {
        if (currency === 'ZAR') {
            return `R${amount.toFixed(2)}`;
        } else if (currency === 'USD') {
            return `$${amount.toFixed(2)}`;
        }
        return `${amount.toFixed(2)} ${currency}`;
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'groceries':
                return '🛒';
            case 'transport':
                return '🚗';
            case 'entertainment':
                return '🎬';
            case 'health':
                return '🏥';
            default:
                return '💳';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <CreditCard className="mr-2" />
                    Payment Card
                </h2>
                <button
                    onClick={toggleCard}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCardActive 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                    }`}
                >
                    {isCardActive ? 'Active' : 'Suspended'}
                </button>
            </div>

            {/* Card Display */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="text-sm opacity-90">BlockDAG Card</div>
                    <div className="text-sm opacity-90">VISA</div>
                </div>
                
                <div className="text-xl font-mono mb-4">{cardNumber}</div>
                
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xs opacity-90 mb-1">Card Holder</div>
                        <div className="font-medium">{cardHolder}</div>
                    </div>
                    <div>
                        <div className="text-xs opacity-90 mb-1">Expires</div>
                        <div className="font-medium">{expiryDate}</div>
                    </div>
                    <div>
                        <div className="text-xs opacity-90 mb-1">CVV</div>
                        <div className="font-medium">
                            {showCvv ? '123' : '***'}
                            <button
                                onClick={() => setShowCvv(!showCvv)}
                                className="ml-2 text-xs underline"
                            >
                                {showCvv ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live FX Rate */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-600">Live Exchange Rate</div>
                        <div className="text-lg font-bold text-green-600">
                            ${fxRate.toFixed(4)} USD/EMW
                        </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    Updates every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Spending Limits */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600 mb-1">Daily Limit</div>
                    <div className="text-lg font-bold text-blue-800">
                        ${spendingLimit.toFixed(2)}
                    </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-600 mb-1">Spent Today</div>
                    <div className="text-lg font-bold text-orange-800">
                        ${dailySpent.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div>
                <h3 className="font-semibold mb-3">Recent Transactions</h3>
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="text-2xl">{getCategoryIcon(tx.category)}</div>
                                <div>
                                    <div className="font-medium">{tx.merchant}</div>
                                    <div className="text-sm text-gray-500">
                                        {formatTimestamp(tx.timestamp)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">
                                    {formatCurrency(tx.amount, tx.currency)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {(tx.amount / fxRate).toFixed(2)} EMW
                                </div>
                            </div>
                            <div className="ml-3">
                                {getStatusIcon(tx.status)}
                            </div>
                            <button
                                onClick={() => generateReceipt(tx)}
                                className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
                            >
                                Receipt
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Card Controls */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700">
                        Set Spending Limit
                    </button>
                    <button className="bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700">
                        Report Lost Card
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCard;
