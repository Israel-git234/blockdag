import React, { useState, useEffect } from 'react';
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.js";
import WalletComponent from './components/Wallet';
import PaymentCard from './components/PaymentCard';
import Explorer from './components/Explorer';
import Finance from './components/Finance';

// --- CONTRACT CONFIGURATION ---
const creatorRegistryAddress = "0x9a0ED98ff619d15B41f57b541f57a149f64e516b2916";
const adRevenuePoolAddress = "0x63bbEAf7b2c29341FF031A539cD9f406Be117781";
const empowerTokenAddress = "0xD93111E3C9E9C68C1BaE07F1E3c5f3ce483c9b8f";
const providerRegistryAddress = "0xa250f5eD7E3161336C30FF9C73A486d4A144c1d6";
const medRecordAnchorAddress = "0x5DcB90a416f6053AdE3A6E1711d00A4595B5C8fb";
const consentPermitAddress = "0x9d8364937c5b042957ad7a8300981081f395dF6e";
const clinicQueueAddress = "0x283B8d24Bf29eFA4296b3645dC3E42B70D163226";
const sosRegistryAddress = "0x66f5B07a821CD84A2322FAE46fF44be62347C833";

// --- ABIs ---
const empowerTokenABI = [ {"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"}, {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"}, {"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"}, {"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"}, {"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"}, {"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"}, {"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"}, {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"}, {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"}, {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"} ];
const creatorRegistryABI = [ {"inputs":[],"stateMutability":"nonpayable","type":"constructor"}, {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"}, {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creatorAddress","type":"address"},{"indexed":false,"internalType":"string","name":"channelName","type":"string"}],"name":"CreatorRegistered","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creatorAddress","type":"address"}],"name":"CreatorRemoved","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creatorAddress","type":"address"}],"name":"CreatorVerified","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}, {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"creators","outputs":[{"internalType":"bool","name":"isRegistered","type":"bool"},{"internalType":"bool","name":"isVerifiedExpert","type":"bool"},{"internalType":"string","name":"channelName","type":"string"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"string","name":"_channelName","type":"string"}],"name":"registerCreator","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"_creatorAddress","type":"address"}],"name":"removeCreator","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"_creatorAddress","type":"address"}],"name":"verifyCreator","outputs":[],"stateMutability":"nonpayable","type":"function"} ];
const adRevenuePoolABI = [ {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"depositRevenue","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"_creator","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"distributePayout","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"_paymentTokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"}, {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"}, {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PayoutDistributed","type":"event"}, {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"depositor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RevenueDeposited","type":"event"}, {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[],"name":"getPoolBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"paymentToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"} ];
const providerRegistryABI = [ {"inputs":[],"stateMutability":"nonpayable","type":"constructor"}, {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"}, {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"providerAddress","type":"address"},{"indexed":false,"internalType":"enum ProviderRegistry.ProviderType","name":"pType","type":"uint8"},{"indexed":false,"internalType":"string","name":"name","type":"string"}],"name":"ProviderAdded","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"providerAddress","type":"address"}],"name":"ProviderRemoved","type":"event"}, {"inputs":[{"internalType":"address","name":"_providerAddress","type":"address"},{"internalType":"enum ProviderRegistry.ProviderType","name":"_pType","type":"uint8"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_location","type":"string"}],"name":"addProvider","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"_providerAddress","type":"address"}],"name":"getProviderType","outputs":[{"internalType":"enum ProviderRegistry.ProviderType","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"_providerAddress","type":"address"}],"name":"isProviderRegistered","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"providers","outputs":[{"internalType":"bool","name":"isRegistered","type":"bool"},{"internalType":"enum ProviderRegistry.ProviderType","name":"pType","type":"uint8"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"location","type":"string"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"_providerAddress","type":"address"}],"name":"removeProvider","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"} ];
const medRecordAnchorABI = [ {"inputs":[],"stateMutability":"nonpayable","type":"constructor"}, {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"}, {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"bytes32","name":"newHash","type":"bytes32"}],"name":"RecordUpdated","type":"event"}, {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getRecordHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"recordHashes","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"bytes32","name":"_newHash","type":"bytes32"}],"name":"updateRecordHash","outputs":[],"stateMutability":"nonpayable","type":"function"} ];
const consentPermitABI = [ {"inputs":[{"internalType":"address","name":"_providerRegistryAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"patient","type":"address"},{"indexed":true,"internalType":"address","name":"provider","type":"address"},{"indexed":false,"internalType":"uint256","name":"expiryTimestamp","type":"uint256"}],"name":"ConsentGranted","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"patient","type":"address"},{"indexed":true,"internalType":"address","name":"provider","type":"address"}],"name":"ConsentRevoked","type":"event"}, {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"consents","outputs":[{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"expiryTimestamp","type":"uint256"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"_provider","type":"address"},{"internalType":"uint256","name":"_duration","type":"uint256"}],"name":"grantConsent","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[],"name":"providerRegistry","outputs":[{"internalType":"contract ProviderRegistry","name":"","type":"address"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"_provider","type":"address"}],"name":"revokeConsent","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"_patient","type":"address"},{"internalType":"address","name":"_provider","type":"address"}],"name":"verifyConsent","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"} ];
const clinicQueueABI = [ {"inputs":[{"internalType":"address","name":"_providerRegistryAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"clinic","type":"address"},{"indexed":true,"internalType":"address","name":"patient","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"AppointmentBooked","type":"event"}, {"inputs":[{"internalType":"address","name":"_clinic","type":"address"},{"internalType":"uint256","name":"_appointmentTimestamp","type":"uint256"},{"internalType":"string","name":"_notes","type":"string"}],"name":"bookAppointment","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"dailyAppointments","outputs":[{"internalType":"address","name":"patient","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"notes","type":"string"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"address","name":"_clinic","type":"address"},{"internalType":"uint256","name":"_dayTimestamp","type":"uint256"}],"name":"getAppointmentsForDay","outputs":[{"components":[{"internalType":"address","name":"patient","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"notes","type":"string"}],"internalType":"struct ClinicQueue.Appointment[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"}, {"inputs":[],"name":"providerRegistry","outputs":[{"internalType":"contract ProviderRegistry","name":"","type":"address"}],"stateMutability":"view","type":"function"} ];
const sosRegistryABI = [ {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"eventId","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"SOSResolved","type":"event"}, {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"eventId","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"location","type":"string"}],"name":"SOSTriggered","type":"event"}, {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"activeUserEvents","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"uint256","name":"_eventId","type":"uint256"}],"name":"resolveSOS","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"sosEvents","outputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"location","type":"string"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"}, {"inputs":[{"internalType":"string","name":"_location","type":"string"}],"name":"triggerSOS","outputs":[],"stateMutability":"nonpayable","type":"function"}, {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userHasActiveEvent","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"} ];

// --- SVG Icons ---
const WalletIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>);

// --- Main App Component ---
export default function App() {
    // Connection State
    const [account, setAccount] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Contract Instances
    const [tokenContract, setTokenContract] = useState(null);
    const [creatorRegistry, setCreatorRegistry] = useState(null);
    const [adRevenuePool, setAdRevenuePool] = useState(null);
    const [providerRegistry, setProviderRegistry] = useState(null);
    const [medRecordAnchor, setMedRecordAnchor] = useState(null);
    const [consentPermit, setConsentPermit] = useState(null);
    const [clinicQueue, setClinicQueue] = useState(null);
    const [sosRegistry, setSosRegistry] = useState(null);

    // App State
    const [activeTab, setActiveTab] = useState('social');
    const [notification, setNotification] = useState('');
    const [error, setError] = useState(null);
    const [walletBalance, setWalletBalance] = useState('0');

    // Social State
    const [isRegistered, setIsRegistered] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [poolBalance, setPoolBalance] = useState("0");
    const [payoutAddress, setPayoutAddress] = useState("");
    const [payoutAmount, setPayoutAmount] = useState("");
    const [depositAmount, setDepositAmount] = useState("");

    // Health State
    const [location, setLocation] = useState("");


    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await web3Provider.send("eth_requestAccounts", []);
                const web3Signer = web3Provider.getSigner();
                
                setAccount(accounts[0]);

                // Instantiate all contracts
                setTokenContract(new ethers.Contract(empowerTokenAddress, empowerTokenABI, web3Signer));
                setCreatorRegistry(new ethers.Contract(creatorRegistryAddress, creatorRegistryABI, web3Signer));
                setAdRevenuePool(new ethers.Contract(adRevenuePoolAddress, adRevenuePoolABI, web3Signer));
                setProviderRegistry(new ethers.Contract(providerRegistryAddress, providerRegistryABI, web3Signer));
                setMedRecordAnchor(new ethers.Contract(medRecordAnchorAddress, medRecordAnchorABI, web3Signer));
                setConsentPermit(new ethers.Contract(consentPermitAddress, consentPermitABI, web3Signer));
                setClinicQueue(new ethers.Contract(clinicQueueAddress, clinicQueueABI, web3Signer));
                setSosRegistry(new ethers.Contract(sosRegistryAddress, sosRegistryABI, web3Signer));

            } catch (err) { console.error(err); setError("Failed to connect wallet."); }
        } else { setError("MetaMask is not installed."); }
    };

    const fetchData = async () => {
        if (account && creatorRegistry && adRevenuePool) {
            const creatorData = await creatorRegistry.creators(account);
            setIsRegistered(creatorData.isRegistered);
            const balance = await adRevenuePool.getPoolBalance();
            setPoolBalance(ethers.utils.formatEther(balance));
            const owner = await adRevenuePool.owner();
            setIsAdmin(owner.toLowerCase() === account.toLowerCase());
        }
    };

    useEffect(() => {
        fetchData();
    }, [account, creatorRegistry, adRevenuePool]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 4000);
    };

    // --- Social Contract Interactions ---
    const handleRegister = async () => {
        if (!creatorRegistry || !channelName) return;
        try {
            const tx = await creatorRegistry.registerCreator(channelName);
            await tx.wait();
            showNotification("Registration successful!");
            fetchData();
        } catch (err) { setError("Registration failed."); console.error(err); }
    };

    const handleDeposit = async () => {
        if (!adRevenuePool || !tokenContract || !depositAmount) return;
        try {
            const amountInWei = ethers.utils.parseEther(depositAmount);
            const approveTx = await tokenContract.approve(adRevenuePoolAddress, amountInWei);
            await approveTx.wait();
            const depositTx = await adRevenuePool.depositRevenue(amountInWei);
            await depositTx.wait();
            showNotification("Deposit successful!");
            fetchData();
        } catch (err) { setError("Deposit failed."); console.error(err); }
    };

    const handlePayout = async () => {
        if (!adRevenuePool || !payoutAddress || !payoutAmount) return;
        try {
            const amountInWei = ethers.utils.parseEther(payoutAmount);
            const tx = await adRevenuePool.distributePayout(payoutAddress, amountInWei);
            await tx.wait();
            showNotification("Payout successful!");
            fetchData();
        } catch (err) { setError("Payout failed."); console.error(err); }
    };

    // --- Health & Safety Contract Interactions ---
    const handleTriggerSOS = async () => {
        if (!sosRegistry || !location) return alert("Please enter your location.");
        try {
            const tx = await sosRegistry.triggerSOS(location);
            await tx.wait();
            showNotification("SOS triggered! Help is on the way.");
        } catch (err) { setError("Failed to trigger SOS."); console.error(err); }
    };


    const renderSocial = () => (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Creator Zone</h2>
                {isRegistered ? (
                    <p className="text-green-600">You are registered as a creator!</p>
                ) : (
                    <div className="space-y-4">
                        <input type="text" placeholder="Your Channel Name" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                        <button onClick={handleRegister} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Register as Creator</button>
                    </div>
                )}
            </div>
            {isAdmin && (
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
                    <div className="mb-8 p-4 bg-indigo-50 rounded-lg">
                        <h3 className="font-semibold text-lg">Ad Revenue Pool Balance</h3>
                        <p className="text-3xl font-bold text-indigo-600">{parseFloat(poolBalance).toFixed(2)} EMW</p>
                    </div>
                    <div className="space-y-4 mb-6">
                        <h3 className="font-semibold">Deposit Funds</h3>
                        <input type="number" placeholder="Amount (EMW)" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                        <button onClick={handleDeposit} className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600">Deposit</button>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold">Distribute Payout</h3>
                        <input type="text" placeholder="Creator Address" value={payoutAddress} onChange={e => setPayoutAddress(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                        <input type="number" placeholder="Amount (EMW)" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                        <button onClick={handlePayout} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600">Send Payout</button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderHealth = () => (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
             <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">Emergency SOS</h2>
             <p className="text-center text-gray-600 mb-6">If you are in danger, enter your location and press the panic button. Trusted contacts will be notified.</p>
             <div className="space-y-4">
                <input type="text" placeholder="e.g., '123 Main St, Cape Town' or Lat/Long" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                <button onClick={handleTriggerSOS} className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-red-700 animate-pulse">
                    TRIGGER PANIC BUTTON
                </button>
             </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-md sticky top-0 z-40">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-3xl font-bold text-indigo-600">EmpowerHer</h1>
                        <div className="flex items-center space-x-4">
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
                    </div>
                    <div className="flex space-x-8 border-b">
                        <button onClick={() => setActiveTab('social')} className={`py-4 px-1 border-b-2 ${activeTab === 'social' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Social</button>
                        <button onClick={() => setActiveTab('health')} className={`py-4 px-1 border-b-2 ${activeTab === 'health' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Health & Safety</button>
                        <button onClick={() => setActiveTab('finance')} className={`py-4 px-1 border-b-2 ${activeTab === 'finance' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Finance</button>
                        <button onClick={() => setActiveTab('wallet')} className={`py-4 px-1 border-b-2 ${activeTab === 'wallet' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Wallet</button>
                        <button onClick={() => setActiveTab('card')} className={`py-4 px-1 border-b-2 ${activeTab === 'card' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Payment Card</button>
                        <button onClick={() => setActiveTab('explorer')} className={`py-4 px-1 border-b-2 ${activeTab === 'explorer' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Explorer</button>
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
                    <div>
                        {activeTab === 'social' && renderSocial()}
                        {activeTab === 'health' && renderHealth()}
                        {activeTab === 'finance' && <Finance account={account} tokenContract={tokenContract} contracts={{}} />}
                        {activeTab === 'wallet' && <WalletComponent account={account} tokenContract={tokenContract} onBalanceUpdate={setWalletBalance} />}
                        {activeTab === 'card' && <PaymentCard account={account} balance={walletBalance} />}
                        {activeTab === 'explorer' && <Explorer account={account} contracts={{}} />}
                    </div>
                )}
            </main>
            
            {notification && (
                <div className="fixed bottom-5 right-5 bg-blue-500 text-white py-3 px-5 rounded-lg shadow-lg animate-fade-in-out z-50">
                    {notification}
                </div>
            )}
        </div>
    );
}


