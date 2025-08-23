import React, { useState, useEffect } from 'react';
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.js";

// --- CONTRACT CONFIGURATION ---
const empowerTokenAddress = "0xD93111E3C9E9C68C1BaE07F1E3c5f3ce483c9b8f";
const contentAddress = "0xEc66F046C3809Fc029594bAeE02a2dBd058E1A60";

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

const contentABI = [
	{"inputs":[{"internalType":"address","name":"_empowerTokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"videoId","type":"uint256"},{"indexed":true,"internalType":"address","name":"tipper","type":"address"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Tipped","type":"event"},
	{"inputs":[{"internalType":"uint256","name":"_videoId","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"tipVideo","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"string","name":"_ipfsHash","type":"string"}],"name":"uploadVideo","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"videoId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"string","name":"title","type":"string"},{"indexed":false,"internalType":"string","name":"ipfsHash","type":"string"}],"name":"VideoUploaded","type":"event"},
	{"inputs":[],"name":"empowerToken","outputs":[{"internalType":"contract EmpowerToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"getVideosCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
	{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"tips","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
	{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"videos","outputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"ipfsHash","type":"string"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"uint256","name":"totalTips","type":"uint256"}],"stateMutability":"view","type":"function"}
];

// --- SVG Icons ---
const WalletIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const VideoCameraIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>);

// --- Components ---

const VideoCard = ({ video, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300">
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <VideoCameraIcon />
        </div>
        <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800 truncate">{video.title}</h3>
            <p className="text-sm text-gray-500">By: {`${video.creator.substring(0, 6)}...${video.creator.substring(video.creator.length - 4)}`}</p>
            <p className="text-sm text-indigo-600 mt-2">Total Tips: {ethers.utils.formatEther(video.totalTips)} EMW</p>
        </div>
    </div>
);

const VideoPlayerModal = ({ video, isOpen, onClose, onTip }) => {
    const [tipAmount, setTipAmount] = useState('');
    if (!isOpen || !video) return null;

    // Use a public IPFS gateway to stream the video
    const videoUrl = `https://ipfs.io/ipfs/${video.ipfsHash}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl relative">
                <button onClick={onClose} className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg">&times;</button>
                <div className="aspect-w-16 aspect-h-9 bg-black">
                     <video src={videoUrl} controls autoPlay className="w-full h-full object-contain"></video>
                </div>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">{video.title}</h2>
                    <p className="text-sm text-gray-500 mb-4">By: {video.creator}</p>
                    <p className="text-gray-700 mb-6">{video.description}</p>
                    <div className="flex items-center space-x-2">
                        <input 
                            type="number" 
                            placeholder="Tip Amount (EMW)" 
                            value={tipAmount}
                            onChange={(e) => setTipAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <button 
                            onClick={() => onTip(video.id, tipAmount)}
                            className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700 whitespace-nowrap"
                        >
                            Tip Creator
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UploadVideoModal = ({ isOpen, onClose, onUpload }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!title || !description || !ipfsHash) {
            return alert("Please fill all fields.");
        }
        onUpload(title, description, ipfsHash);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Your Video</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Video Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="4"></textarea>
                    <input type="text" placeholder="IPFS Hash of Video File" value={ipfsHash} onChange={e => setIpfsHash(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    <p className="text-xs text-gray-500">Note: For this demo, please upload your video to an IPFS service like Pinata first and paste the hash here.</p>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Upload</button>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
    // Connection and Account State
    const [account, setAccount] = useState(null);
    const [signer, setSigner] = useState(null);
    
    // Contract Instances
    const [tokenContract, setTokenContract] = useState(null);
    const [contentContract, setContentContract] = useState(null);

    // App State
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState('');
    const [emwBalance, setEmwBalance] = useState('0');

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                setError(null);
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await web3Provider.send("eth_requestAccounts", []);
                const web3Signer = web3Provider.getSigner();
                
                setSigner(web3Signer);
                setAccount(accounts[0]);

                const token = new ethers.Contract(empowerTokenAddress, empowerTokenABI, web3Signer);
                const content = new ethers.Contract(contentAddress, contentABI, web3Signer);
                setTokenContract(token);
                setContentContract(content);

            } catch (err) {
                console.error(err);
                setError("Failed to connect wallet.");
            }
        } else {
            setError("MetaMask is not installed.");
        }
    };

    const fetchAllData = async () => {
        if(account && contentContract) {
            fetchVideos();
            fetchBalance();
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [account, contentContract]);

    const fetchVideos = async () => {
        if (!contentContract) return;
        setIsLoading(true);
        try {
            const count = await contentContract.getVideosCount();
            const fetchedVideos = [];
            for (let i = 0; i < count; i++) {
                const videoData = await contentContract.videos(i);
                fetchedVideos.push({ id: i, ...videoData });
            }
            setVideos(fetchedVideos.reverse());
        } catch (err) { console.error("Error fetching videos:", err); }
        setIsLoading(false);
    };
    
    const fetchBalance = async () => {
        if(tokenContract && account) {
            const balance = await tokenContract.balanceOf(account);
            setEmwBalance(ethers.utils.formatEther(balance));
        }
    };

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 4000);
    };

    // --- Contract Interactions ---

    const handleUploadVideo = async (title, description, ipfsHash) => {
        if (!contentContract) return;
        try {
            const tx = await contentContract.uploadVideo(title, description, ipfsHash);
            showNotification("Uploading video to blockchain...");
            await tx.wait();
            showNotification("Video uploaded successfully!");
            fetchAllData();
        } catch (err) { setError("Failed to upload video."); console.error(err); }
    };

    const handleTipCreator = async (videoId, amount) => {
        if (!contentContract || !tokenContract || !amount || parseFloat(amount) <= 0) {
            return alert("Please enter a valid tip amount.");
        }
        try {
            const amountInWei = ethers.utils.parseEther(amount);
            
            showNotification("Approving token transfer for tip...");
            const approveTx = await tokenContract.approve(contentAddress, amountInWei);
            await approveTx.wait();
            
            showNotification("Sending tip...");
            const tipTx = await contentContract.tipVideo(videoId, amountInWei);
            await tipTx.wait();
            
            showNotification("Tip sent successfully!");
            fetchAllData();
        } catch (err) { setError("Failed to send tip."); console.error(err); }
    };
    
    const handleMintTokens = async () => {
        if (!tokenContract) return;
        try {
            const amountToMint = ethers.utils.parseEther("1000");
            const tx = await tokenContract.mint(account, amountToMint);
            showNotification("Minting 1000 EMW...");
            await tx.wait();
            showNotification("Successfully minted 1000 EMW!");
            fetchBalance();
        } catch(err) { setError("Only the contract owner can mint tokens."); console.error(err); }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-md sticky top-0 z-40">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-3xl font-bold text-indigo-600">EmpowerHer TV</h1>
                        <div className="flex items-center space-x-4">
                             {account && (
                                <div className="flex items-center bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-full">
                                    <span>Balance: {parseFloat(emwBalance).toFixed(2)} EMW</span>
                                </div>
                            )}
                            {account ? (
                                <div className="flex items-center bg-gray-200 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full">
                                    {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                                </div>
                            ) : (
                                <button onClick={connectWallet} className="bg-indigo-600 text-white py-2 px-5 rounded-lg font-semibold hover:bg-indigo-700 flex items-center">
                                    <WalletIcon /> Connect Wallet
                                </button>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert"><p>{error}</p><button onClick={() => setError(null)} className="ml-4 font-bold">X</button></div>}
                
                {!account ? (
                    <div className="text-center bg-white p-12 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700">Welcome to EmpowerHer TV!</h3>
                        <p className="text-gray-500 mt-2">Connect your wallet to watch videos and support creators.</p>
                    </div>
                ) : (
                     <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Latest Videos</h2>
                            <div className="flex space-x-2">
                                <button onClick={handleMintTokens} className="bg-yellow-500 text-white py-2 px-5 rounded-lg font-semibold hover:bg-yellow-600 flex items-center shadow-lg">
                                    <PlusIcon /> Get 1000 EMW (Test)
                                </button>
                                <button onClick={() => setIsUploadModalOpen(true)} className="bg-green-500 text-white py-2 px-5 rounded-lg font-semibold hover:bg-green-600 flex items-center shadow-lg">
                                    <VideoCameraIcon /> Upload Video
                                </button>
                            </div>
                        </div>
                        {isLoading ? ( <p className="text-center">Loading Videos from the Blockchain...</p> ) : videos.length > 0 ? (
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                               {videos.map(video => <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />)}
                            </div>
                        ) : ( 
                            <div className="text-center bg-white p-12 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-gray-700">No videos yet!</h3>
                                <p className="text-gray-500 mt-2">Be the first to upload a video.</p>
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

            <UploadVideoModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUploadVideo} />
            <VideoPlayerModal video={selectedVideo} isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} onTip={handleTipCreator} />
            
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



