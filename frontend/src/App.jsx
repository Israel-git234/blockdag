import React, { useState, useEffect } from 'react';
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.js";

// --- CONTRACT CONFIGURATION ---
// Using the addresses you provided
const creatorRegistryAddress = "0x9a0ED98ff619d15B41f57b541f57a149f64e516b2916";
const adRevenuePoolAddress = "0x63bbEAf7b2c29341FF031A539cD9f406Be117781";
// We'll use the EmpowerToken as the payment token for the ad pool
const empowerTokenAddress = "0xD93111E3C9E9C68C1BaE07F1E3c5f3ce483c9b8f";


const creatorRegistryABI = [
	{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
	{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
	{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creatorAddress","type":"address"},{"indexed":false,"internalType":"string","name":"channelName","type":"string"}],"name":"CreatorRegistered","type":"event"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creatorAddress","type":"address"}],"name":"CreatorRemoved","type":"event"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creatorAddress","type":"address"}],"name":"CreatorVerified","type":"event"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
	{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"creators","outputs":[{"internalType":"bool","name":"isRegistered","type":"bool"},{"internalType":"bool","name":"isVerifiedExpert","type":"bool"},{"internalType":"string","name":"channelName","type":"string"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
	{"inputs":[{"internalType":"string","name":"_channelName","type":"string"}],"name":"registerCreator","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"address","name":"_creatorAddress","type":"address"}],"name":"removeCreator","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"address","name":"_creatorAddress","type":"address"}],"name":"verifyCreator","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

const adRevenuePoolABI = [
	{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"depositRevenue","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"address","name":"_creator","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"distributePayout","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"address","name":"_paymentTokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
	{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
	{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PayoutDistributed","type":"event"},
	{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RevenueDeposited","type":"event"},
	{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[],"name":"getPoolBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"paymentToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"}
];

const empowerTokenABI = [
	{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
	{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},
	{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},
	{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},
	{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},
	{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},
	{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},
	{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
	{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
	{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
	{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
	{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
	{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

// --- SVG Icons ---
const WalletIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>);

// --- Main App Component ---
export default function App() {
    // Connection State
    const [account, setAccount] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Contract Instances
    const [tokenContract, setTokenContract] = useState(null);
    const [registryContract, setRegistryContract] = useState(null);
    const [poolContract, setPoolContract] = useState(null);

    // App State
    const [isRegistered, setIsRegistered] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [poolBalance, setPoolBalance] = useState("0");
    const [emwBalance, setEmwBalance] = useState("0");

    // Admin Panel State
    const [payoutAddress, setPayoutAddress] = useState("");
    const [payoutAmount, setPayoutAmount] = useState("");
    const [depositAmount, setDepositAmount] = useState("");

    const [notification, setNotification] = useState('');
    const [error, setError] = useState(null);

    // Connect Wallet and Initialize
    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await web3Provider.send("eth_requestAccounts", []);
                const web3Signer = web3Provider.getSigner();
                
                setSigner(web3Signer);
                setAccount(accounts[0]);

                const token = new ethers.Contract(empowerTokenAddress, empowerTokenABI, web3Signer);
                const registry = new ethers.Contract(creatorRegistryAddress, creatorRegistryABI, web3Signer);
                const pool = new ethers.Contract(adRevenuePoolAddress, adRevenuePoolABI, web3Signer);

                setTokenContract(token);
                setRegistryContract(registry);
                setPoolContract(pool);

            } catch (err) {
                console.error(err);
                setError("Failed to connect wallet.");
            }
        } else {
            setError("MetaMask is not installed.");
        }
    };

    // Fetch data from contracts
    const fetchData = async () => {
        if (account && registryContract && poolContract && tokenContract) {
            const creatorData = await registryContract.creators(account);
            setIsRegistered(creatorData.isRegistered);

            const balance = await poolContract.getPoolBalance();
            setPoolBalance(ethers.utils.formatEther(balance));

            const userBalance = await tokenContract.balanceOf(account);
            setEmwBalance(ethers.utils.formatEther(userBalance));
            
            const owner = await poolContract.owner();
            setIsAdmin(owner.toLowerCase() === account.toLowerCase());
        }
    };

    useEffect(() => {
        fetchData();
    }, [account, registryContract, poolContract, tokenContract]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 4000);
    };

    // --- Contract Interactions ---

    const handleRegister = async () => {
        if (!registryContract || !channelName) return alert("Please enter a channel name.");
        try {
            const tx = await registryContract.registerCreator(channelName);
            showNotification("Registering creator...");
            await tx.wait();
            showNotification("Registration successful!");
            fetchData();
        } catch (err) { setError("Registration failed."); console.error(err); }
    };

    const handleDeposit = async () => {
        if (!poolContract || !tokenContract || !depositAmount) return alert("Please enter an amount.");
        try {
            const amountInWei = ethers.utils.parseEther(depositAmount);
            showNotification("Approving token transfer...");
            const approveTx = await tokenContract.approve(adRevenuePoolAddress, amountInWei);
            await approveTx.wait();
            
            showNotification("Depositing funds...");
            const depositTx = await poolContract.depositRevenue(amountInWei);
            await depositTx.wait();

            showNotification("Deposit successful!");
            fetchData();
        } catch (err) { setError("Deposit failed."); console.error(err); }
    };

    const handlePayout = async () => {
        if (!poolContract || !payoutAddress || !payoutAmount) return alert("Please fill all fields.");
        try {
            const amountInWei = ethers.utils.parseEther(payoutAmount);
            const tx = await poolContract.distributePayout(payoutAddress, amountInWei);
            showNotification("Distributing payout...");
            await tx.wait();
            showNotification("Payout successful!");
            fetchData();
        } catch (err) { setError("Payout failed."); console.error(err); }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-md">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-indigo-600">EmpowerHer: Social</h1>
                    <div className="flex items-center space-x-4">
                        {account && (
                             <div className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-full">
                                <span>{parseFloat(emwBalance).toFixed(2)} EMW</span>
                            </div>
                        )}
                        {account ? (
                            <div className="bg-gray-200 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full">
                                {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                            </div>
                        ) : (
                            <button onClick={connectWallet} className="bg-indigo-600 text-white py-2 px-5 rounded-lg font-semibold hover:bg-indigo-700 flex items-center">
                                <WalletIcon /> Connect Wallet
                            </button>
                        )}
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert"><p>{error}</p><button onClick={() => setError(null)} className="ml-4 font-bold">X</button></div>}
                
                {!account ? (
                    <div className="text-center bg-white p-12 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700">Welcome!</h3>
                        <p className="text-gray-500 mt-2">Connect your wallet to get started.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Creator Panel */}
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Creator Zone</h2>
                            {isRegistered ? (
                                <p className="text-green-600">You are registered as a creator!</p>
                            ) : (
                                <div className="space-y-4">
                                    <p>Register to start sharing your content.</p>
                                    <input 
                                        type="text"
                                        placeholder="Your Channel Name"
                                        value={channelName}
                                        onChange={(e) => setChannelName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <button onClick={handleRegister} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">
                                        Register as Creator
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Admin Panel */}
                        {isAdmin && (
                            <div className="bg-white p-8 rounded-lg shadow-md">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
                                <div className="mb-8 p-4 bg-indigo-50 rounded-lg">
                                    <h3 className="font-semibold text-lg">Ad Revenue Pool Balance</h3>
                                    <p className="text-3xl font-bold text-indigo-600">{parseFloat(poolBalance).toFixed(2)} EMW</p>
                                </div>
                                
                                <div className="space-y-4 mb-6">
                                    <h3 className="font-semibold">Deposit Funds to Pool</h3>
                                    <input type="number" placeholder="Amount (EMW)" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <button onClick={handleDeposit} className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600">Deposit</button>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Distribute Payout to Creator</h3>
                                    <input type="text" placeholder="Creator Address" value={payoutAddress} onChange={e => setPayoutAddress(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <input type="number" placeholder="Amount (EMW)" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    <button onClick={handlePayout} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600">Send Payout</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            
            {notification && (
                <div className="fixed bottom-5 right-5 bg-blue-500 text-white py-3 px-5 rounded-lg shadow-lg animate-fade-in-out z-50">
                    {notification}
                </div>
            )}
            
            <style>{`
                @keyframes fade-in-out {
                    0% { opacity: 0; transform: translateY(20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(20px); }
                }
                .animate-fade-in-out {
                    animation: fade-in-out 4s ease-in-out;
                }
            `}</style>
        </div>
    );
}


