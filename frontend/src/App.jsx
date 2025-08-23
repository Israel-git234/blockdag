import React, { useState, useEffect } from 'react';
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.js";

// --- CONTRACT CONFIGURATION ---
const empowerTokenAddress = "0xD93111E3C9E9C68C1BaE07F1E3c5f3ce483c9b8f";
const crowdFundingAddress = "0xFA0875e339160B0F78B138939015Dc628596A224";
const stokvelAddress = "0xECDa59EBEb3fBbd15EECF03719B31eb02a077801";

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

const crowdFundingABI = [
	{"inputs":[{"internalType":"address","name":"_empowerTokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"string","name":"title","type":"string"},{"indexed":false,"internalType":"uint256","name":"goal","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"CampaignCreated","type":"event"},
	{"inputs":[{"internalType":"uint256","name":"_campaignId","type":"uint256"}],"name":"claimFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_goal","type":"uint256"},{"internalType":"uint256","name":"_duration","type":"uint256"}],"name":"createCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"uint256","name":"_campaignId","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"donate","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":true,"internalType":"address","name":"donor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Donated","type":"event"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundsClaimed","type":"event"},
	{"inputs":[{"internalType":"uint256","name":"_campaignId","type":"uint256"}],"name":"getRefund","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":true,"internalType":"address","name":"donor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Refunded","type":"event"},
	{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"campaigns","outputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"goal","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"totalDonations","type":"uint256"},{"internalType":"bool","name":"claimed","type":"bool"}],"stateMutability":"view","type":"function"},
	{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"donations","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"empowerToken","outputs":[{"internalType":"contract EmpowerToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"getCampaignsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

const stokvelABI = [
	{"inputs":[{"internalType":"address","name":"_empowerTokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"circleId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"contributionAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxMembers","type":"uint256"}],"name":"CircleCreated","type":"event"},
	{"inputs":[{"internalType":"uint256","name":"_circleId","type":"uint256"}],"name":"contribute","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"circleId","type":"uint256"},{"indexed":true,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ContributionMade","type":"event"},
	{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_contributionAmount","type":"uint256"},{"internalType":"uint256","name":"_maxMembers","type":"uint256"}],"name":"createCircle","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"inputs":[{"internalType":"uint256","name":"_circleId","type":"uint256"}],"name":"joinCircle","outputs":[],"stateMutability":"nonpayable","type":"function"},
	{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"circleId","type":"uint256"},{"indexed":true,"internalType":"address","name":"newMember","type":"address"}],"name":"MemberJoined","type":"event"},
	{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"circles","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"contributionAmount","type":"uint256"},{"internalType":"uint256","name":"maxMembers","type":"uint256"},{"internalType":"uint256","name":"totalBalance","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"address","name":"creator","type":"address"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"empowerToken","outputs":[{"internalType":"contract EmpowerToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},
	{"inputs":[{"internalType":"uint256","name":"_circleId","type":"uint256"}],"name":"getCircleMembers","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
	{"inputs":[],"name":"getCirclesCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

// --- SVG Icons ---
const WalletIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const VideoCameraIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>);
const HeartIcon = ({ filled }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${filled ? 'text-red-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>);
const ChatIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>);
const ShareIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>);


// --- Components ---

const EducationPost = ({ post }) => {
    const [liked, setLiked] = useState(false);
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
                <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                    <p className="font-bold text-gray-800">{post.author.name}</p>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                </div>
            </div>
            <p className="text-gray-700 mb-4">{post.text}</p>
            {post.type === 'video' && (
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200">
                    <img src={post.contentUrl} alt="Video thumbnail" className="w-full h-full object-cover" />
                </div>
            )}
            <div className="flex justify-around items-center mt-4 pt-4 border-t border-gray-200">
                <button onClick={() => setLiked(!liked)} className="flex items-center space-x-2 text-gray-600 hover:text-red-500">
                    <HeartIcon filled={liked} /> <span>{liked ? post.likes + 1 : post.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-indigo-500">
                    <ChatIcon /> <span>{post.comments}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                    <ShareIcon /> <span>Share</span>
                </button>
            </div>
        </div>
    );
};

const UploadContentModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Your Content</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Title" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <textarea placeholder="Description" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="4"></textarea>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video or Article</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">MP4, MOV, PDF, DOCX up to 50MB</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Upload</button>
                </div>
            </div>
        </div>
    );
};

const CampaignCard = ({ campaign, onDonate }) => {
    const [amount, setAmount] = useState('');
    const progress = (parseFloat(ethers.utils.formatEther(campaign.totalDonations)) / parseFloat(ethers.utils.formatEther(campaign.goal))) * 100;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col">
            <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{campaign.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                 <p className="text-xs text-gray-400 mb-4">Creator: {campaign.creator}</p>
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-semibold text-indigo-600">Raised: {parseFloat(ethers.utils.formatEther(campaign.totalDonations)).toFixed(2)} EMW</span>
                        <span className="text-gray-500">Goal: {parseFloat(ethers.utils.formatEther(campaign.goal)).toFixed(2)} EMW</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 p-4 mt-auto">
                <div className="flex items-center space-x-2">
                    <input 
                        type="number" 
                        placeholder="Amount" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                        onClick={() => onDonate(campaign.id, amount)}
                        className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300 whitespace-nowrap"
                    >
                        Donate
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreateCampaignModal = ({ isOpen, onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!title || !description || !goal || !duration) {
            alert("Please fill all fields!");
            return;
        }
        const durationInSeconds = parseInt(duration) * 24 * 60 * 60;
        onCreate(title, description, goal, durationInSeconds);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Start a Crowd-Funding Campaign</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Campaign Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <textarea placeholder="Tell your story..." value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="4"></textarea>
                    <input type="number" placeholder="Funding Goal (EMW)" value={goal} onChange={e => setGoal(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" placeholder="Duration (in days)" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Create Campaign</button>
                </div>
            </div>
        </div>
    );
};

const StokvelCard = ({ circle, onJoin, onContribute }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{circle.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{circle.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                        <p className="text-gray-500">Contribution</p>
                        <p className="font-semibold text-indigo-600">{ethers.utils.formatEther(circle.contributionAmount)} EMW</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Members</p>
                        <p className="font-semibold">{circle.members.length} / {circle.maxMembers.toString()}</p>
                    </div>
                     <div>
                        <p className="text-gray-500">Total Pot</p>
                        <p className="font-semibold">{ethers.utils.formatEther(circle.totalBalance)} EMW</p>
                    </div>
                </div>
            </div>
            <div className="flex space-x-2 mt-4">
                <button onClick={() => onJoin(circle.id)} className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-300">Join</button>
                <button onClick={() => onContribute(circle.id)} className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300">Contribute</button>
            </div>
        </div>
    );
};

const CreateStokvelModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [contribution, setContribution] = useState('');
    const [maxMembers, setMaxMembers] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name || !description || !contribution || !maxMembers) {
            alert("Please fill all fields!");
            return;
        }
        onCreate(name, description, contribution, maxMembers);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Create a Savings Circle</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Circle Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3"></textarea>
                    <input type="number" placeholder="Contribution Amount (EMW)" value={contribution} onChange={e => setContribution(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    <input type="number" placeholder="Maximum Members" value={maxMembers} onChange={e => setMaxMembers(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Create Circle</button>
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
    const [crowdFundingContract, setCrowdFundingContract] = useState(null);
    const [stokvelContract, setStokvelContract] = useState(null);

    // App State
    const [campaigns, setCampaigns] = useState([]);
    const [circles, setCircles] = useState([]);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isStokvelModalOpen, setIsStokvelModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState('');
    const [emwBalance, setEmwBalance] = useState('0');
    const [activeTab, setActiveTab] = useState('crowdfunding');

    const mockEducationPosts = [
        { id: 1, author: { name: 'Jane Doe', avatar: 'https://placehold.co/100x100/A9A9A9/FFFFFF?text=JD' }, timestamp: '2 hours ago', text: 'Just posted a new video on the basics of blockchain technology for beginners. Hope it helps!', type: 'video', contentUrl: 'https://placehold.co/600x400/333/FFF?text=Video+Thumbnail', likes: 120, comments: 15 },
        { id: 2, author: { name: 'Emily Smith', avatar: 'https://placehold.co/100x100/D3D3D3/000000?text=ES' }, timestamp: '5 hours ago', text: 'Here is a quick guide on how to create a budget and stick to it. Financial literacy is key!', type: 'article', contentUrl: null, likes: 250, comments: 45 },
    ];

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
                const crowdfunding = new ethers.Contract(crowdFundingAddress, crowdFundingABI, web3Signer);
                const stokvel = new ethers.Contract(stokvelAddress, stokvelABI, web3Signer);
                setTokenContract(token);
                setCrowdFundingContract(crowdfunding);
                setStokvelContract(stokvel);

            } catch (err) {
                console.error(err);
                setError("Failed to connect wallet. Please try again.");
            }
        } else {
            setError("MetaMask is not installed.");
        }
    };

    const fetchAllData = async () => {
        if(account) {
            fetchCampaigns();
            fetchCircles();
            fetchBalance();
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [account, tokenContract, crowdFundingContract, stokvelContract]);


    const fetchCampaigns = async () => {
        if (!crowdFundingContract) return;
        setIsLoading(true);
        try {
            const count = await crowdFundingContract.getCampaignsCount();
            const fetchedCampaigns = [];
            for (let i = 0; i < count; i++) {
                const campaignData = await crowdFundingContract.campaigns(i);
                fetchedCampaigns.push({ id: i, ...campaignData });
            }
            setCampaigns(fetchedCampaigns.reverse());
        } catch (err) { console.error("Error fetching campaigns:", err); }
        setIsLoading(false);
    };
    
    const fetchCircles = async () => {
        if (!stokvelContract) return;
        setIsLoading(true);
        try {
            const count = await stokvelContract.getCirclesCount();
            const fetchedCircles = [];
            for (let i = 0; i < count; i++) {
                const circleData = await stokvelContract.circles(i);
                const members = await stokvelContract.getCircleMembers(i);
                fetchedCircles.push({ id: i, ...circleData, members });
            }
            setCircles(fetchedCircles.reverse());
        } catch (err) { console.error("Error fetching circles:", err); }
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

    const handleCreateCampaign = async (title, description, goal, duration) => {
        if (!crowdFundingContract) return;
        try {
            const goalInWei = ethers.utils.parseEther(goal);
            const tx = await crowdFundingContract.createCampaign(title, description, goalInWei, duration);
            showNotification("Creating campaign...");
            await tx.wait();
            showNotification("Campaign created successfully!");
            fetchCampaigns();
        } catch (err) { setError("Failed to create campaign."); console.error(err); }
    };

    const handleDonate = async (campaignId, amount) => {
        if (!crowdFundingContract || !tokenContract || !amount || parseFloat(amount) <= 0) {
            return alert("Please enter a valid amount.");
        }
        try {
            const amountInWei = ethers.utils.parseEther(amount);
            showNotification("Approving token transfer...");
            const approveTx = await tokenContract.approve(crowdFundingAddress, amountInWei);
            await approveTx.wait();
            showNotification("Donating...");
            const donateTx = await crowdFundingContract.donate(campaignId, amountInWei);
            await donateTx.wait();
            showNotification("Donation successful!");
            fetchAllData();
        } catch (err) { setError("Donation failed."); console.error(err); }
    };
    
    const handleCreateCircle = async (name, description, contribution, maxMembers) => {
        if (!stokvelContract) return;
        try {
            const contributionInWei = ethers.utils.parseEther(contribution);
            const tx = await stokvelContract.createCircle(name, description, contributionInWei, maxMembers);
            showNotification("Creating savings circle...");
            await tx.wait();
            showNotification("Circle created successfully!");
            fetchCircles();
        } catch (err) { setError("Failed to create circle."); console.error(err); }
    };

    const handleJoinCircle = async (circleId) => {
        if (!stokvelContract) return;
        try {
            const tx = await stokvelContract.joinCircle(circleId);
            showNotification("Joining circle...");
            await tx.wait();
            showNotification("Successfully joined circle!");
            fetchCircles();
        } catch (err) { setError("Failed to join circle."); console.error(err); }
    };

    const handleContributeToCircle = async (circleId) => {
        if (!stokvelContract || !tokenContract) return;
        try {
            const circle = await stokvelContract.circles(circleId);
            const amountInWei = circle.contributionAmount;

            showNotification("Approving contribution...");
            const approveTx = await tokenContract.approve(stokvelAddress, amountInWei);
            await approveTx.wait();
            
            showNotification("Making contribution...");
            const contributeTx = await stokvelContract.contribute(circleId);
            await contributeTx.wait();

            showNotification("Contribution successful!");
            fetchAllData();
        } catch (err) { setError("Contribution failed."); console.error(err); }
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
        } catch(err) { setError("Only the owner can mint tokens."); console.error(err); }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'education':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Education Feed</h2>
                            <button onClick={() => setIsUploadModalOpen(true)} className="bg-green-500 text-white py-2 px-5 rounded-lg font-semibold hover:bg-green-600 flex items-center shadow-lg">
                                <VideoCameraIcon /> Upload Content
                            </button>
                        </div>
                        <div className="max-w-2xl mx-auto">
                            {mockEducationPosts.map(post => <EducationPost key={post.id} post={post} />)}
                        </div>
                    </div>
                );
            case 'crowdfunding':
                return (
                     <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Crowd-Funding Campaigns</h2>
                            <div className="flex space-x-2">
                                <button onClick={() => setIsCampaignModalOpen(true)} className="bg-green-500 text-white py-2 px-5 rounded-lg font-semibold hover:bg-green-600 flex items-center shadow-lg">
                                    <PlusIcon /> Create Campaign
                                </button>
                            </div>
                        </div>
                        {isLoading ? ( <p>Loading Campaigns...</p> ) : campaigns.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                               {campaigns.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} onDonate={handleDonate} />)}
                            </div>
                        ) : ( <p>No campaigns yet.</p> )}
                    </div>
                );
            case 'stokvel':
                 return (
                     <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Savings Circles</h2>
                             <button onClick={() => setIsStokvelModalOpen(true)} className="bg-green-500 text-white py-2 px-5 rounded-lg font-semibold hover:bg-green-600 flex items-center shadow-lg">
                                <PlusIcon /> Create Circle
                            </button>
                        </div>
                        {isLoading ? ( <p>Loading Circles...</p> ) : circles.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                               {circles.map(circle => <StokvelCard key={circle.id} circle={circle} onJoin={handleJoinCircle} onContribute={handleContributeToCircle} />)}
                            </div>
                        ) : ( <p>No savings circles yet.</p> )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-3xl font-bold text-indigo-600">EmpowerHer</h1>
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
                     <div className="flex space-x-8 border-b">
                        <button onClick={() => setActiveTab('crowdfunding')} className={`py-4 px-1 border-b-2 ${activeTab === 'crowdfunding' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Crowd-Funding</button>
                        <button onClick={() => setActiveTab('education')} className={`py-4 px-1 border-b-2 ${activeTab === 'education' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Education Feed</button>
                        <button onClick={() => setActiveTab('stokvel')} className={`py-4 px-1 border-b-2 ${activeTab === 'stokvel' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Savings Circles</button>
                         <button onClick={handleMintTokens} className="ml-auto text-sm text-yellow-600 hover:underline">Get 1000 EMW (Test)</button>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert"><p>{error}</p><button onClick={() => setError(null)} className="ml-4 font-bold">X</button></div>}
                
                {!account ? (
                    <div className="text-center bg-white p-12 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700">Welcome to EmpowerHer!</h3>
                        <p className="text-gray-500 mt-2">Please connect your wallet to get started.</p>
                    </div>
                ) : (
                    renderContent()
                )}
            </main>
            
            {notification && (
                <div className="fixed bottom-5 right-5 bg-blue-500 text-white py-3 px-5 rounded-lg shadow-lg animate-fade-in-out z-50">
                    {notification}
                </div>
            )}

            <CreateCampaignModal isOpen={isCampaignModalOpen} onClose={() => setIsCampaignModalOpen(false)} onCreate={handleCreateCampaign} />
            <UploadContentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
            <CreateStokvelModal isOpen={isStokvelModalOpen} onClose={() => setIsStokvelModalOpen(false)} onCreate={handleCreateCircle} />
            
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


