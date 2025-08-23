import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Target, Briefcase, Heart, Users, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const Finance = ({ account, tokenContract, contracts }) => {
    const [activeTab, setActiveTab] = useState('grants');
    const [grants, setGrants] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [streams, setStreams] = useState([]);
    const [donations, setDonations] = useState([]);
    
    // Form states
    const [grantTitle, setGrantTitle] = useState('');
    const [grantDescription, setGrantDescription] = useState('');
    const [grantAmount, setGrantAmount] = useState('');
    const [votePower, setVotePower] = useState('');
    const [selectedGrant, setSelectedGrant] = useState(null);
    
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jobBounty, setJobBounty] = useState('');
    const [jobDeadline, setJobDeadline] = useState('');
    const [milestones, setMilestones] = useState(['']);
    const [milestoneAmounts, setMilestoneAmounts] = useState(['']);
    
    const [streamRecipient, setStreamRecipient] = useState('');
    const [streamAmountPerSecond, setStreamAmountPerSecond] = useState('');
    const [streamDuration, setStreamDuration] = useState('');
    const [streamDescription, setStreamDescription] = useState('');
    
    const [donationRecipient, setDonationRecipient] = useState('');
    const [donationAmount, setDonationAmount] = useState('');
    const [donationMessage, setDonationMessage] = useState('');

    // Mock data
    useEffect(() => {
        // Mock grants
        const mockGrants = [
            {
                id: 1,
                creator: '0x1234...5678',
                title: 'Women in Tech Bootcamp',
                description: 'A comprehensive coding bootcamp for women in South Africa',
                requestedAmount: '5000',
                totalVotes: 1250,
                fundingDeadline: Date.now() + 86400000 * 7, // 7 days
                isActive: true,
                isFunded: false
            },
            {
                id: 2,
                creator: '0x8765...4321',
                title: 'Rural Healthcare Initiative',
                description: 'Mobile clinics for rural communities',
                requestedAmount: '8000',
                totalVotes: 890,
                fundingDeadline: Date.now() + 86400000 * 5, // 5 days
                isActive: true,
                isFunded: false
            }
        ];
        setGrants(mockGrants);

        // Mock jobs
        const mockJobs = [
            {
                id: 1,
                employer: '0xabcd...efgh',
                title: 'Web Developer for E-commerce',
                description: 'Build a modern e-commerce platform',
                totalBounty: '2000',
                deadline: Date.now() + 86400000 * 14, // 14 days
                isActive: true,
                assignedWorker: null
            },
            {
                id: 2,
                employer: '0xijkl...mnop',
                title: 'Content Creator for Health Blog',
                description: 'Create educational health content',
                totalBounty: '1500',
                deadline: Date.now() + 86400000 * 21, // 21 days
                isActive: true,
                assignedWorker: null
            }
        ];
        setJobs(mockJobs);

        // Mock streams
        const mockStreams = [
            {
                id: 1,
                sponsor: '0xqrst...uvwx',
                recipient: '0x1234...5678',
                amountPerSecond: '0.001',
                startTime: Date.now() - 86400000, // 1 day ago
                stopTime: Date.now() + 86400000 * 30, // 30 days from now
                isActive: true,
                description: 'Monthly support for women entrepreneurs'
            }
        ];
        setStreams(mockStreams);

        // Mock donations
        const mockDonations = [
            {
                id: 1,
                donor: '0xyzaa...bbcc',
                recipient: '0x1234...5678',
                amount: '500',
                message: 'Supporting your amazing work!',
                timestamp: Date.now() - 3600000, // 1 hour ago
                isRevoked: false
            }
        ];
        setDonations(mockDonations);
    }, []);

    const handleCreateGrant = async () => {
        if (!grantTitle || !grantDescription || !grantAmount) return;
        
        try {
            // In production, this would call the GrantDAO contract
            const newGrant = {
                id: Date.now(),
                creator: account,
                title: grantTitle,
                description: grantDescription,
                requestedAmount: grantAmount,
                totalVotes: 0,
                fundingDeadline: Date.now() + 86400000 * 30, // 30 days
                isActive: true,
                isFunded: false
            };
            
            setGrants([newGrant, ...grants]);
            setGrantTitle('');
            setGrantDescription('');
            setGrantAmount('');
            
        } catch (error) {
            console.error('Error creating grant:', error);
        }
    };

    const handleVote = async (grantId) => {
        if (!votePower) return;
        
        try {
            // In production, this would call the GrantDAO contract
            setGrants(prev => prev.map(grant => 
                grant.id === grantId 
                    ? { ...grant, totalVotes: grant.totalVotes + parseInt(votePower) }
                    : grant
            ));
            setVotePower('');
            setSelectedGrant(null);
            
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleCreateJob = async () => {
        if (!jobTitle || !jobDescription || !jobBounty || !jobDeadline) return;
        
        try {
            const newJob = {
                id: Date.now(),
                employer: account,
                title: jobTitle,
                description: jobDescription,
                totalBounty: jobBounty,
                deadline: new Date(jobDeadline).getTime(),
                isActive: true,
                assignedWorker: null
            };
            
            setJobs([newJob, ...jobs]);
            setJobTitle('');
            setJobDescription('');
            setJobBounty('');
            setJobDeadline('');
            setMilestones(['']);
            setMilestoneAmounts(['']);
            
        } catch (error) {
            console.error('Error creating job:', error);
        }
    };

    const handleApplyForJob = async (jobId) => {
        try {
            // In production, this would call the JobBounty contract
            setJobs(prev => prev.map(job => 
                job.id === jobId 
                    ? { ...job, assignedWorker: account }
                    : job
            ));
            
        } catch (error) {
            console.error('Error applying for job:', error);
        }
    };

    const handleCreateStream = async () => {
        if (!streamRecipient || !streamAmountPerSecond || !streamDuration) return;
        
        try {
            const newStream = {
                id: Date.now(),
                sponsor: account,
                recipient: streamRecipient,
                amountPerSecond: streamAmountPerSecond,
                startTime: Date.now(),
                stopTime: Date.now() + parseInt(streamDuration) * 1000,
                isActive: true,
                description: streamDescription
            };
            
            setStreams([newStream, ...streams]);
            setStreamRecipient('');
            setStreamAmountPerSecond('');
            setStreamDuration('');
            setStreamDescription('');
            
        } catch (error) {
            console.error('Error creating stream:', error);
        }
    };

    const handleMakeDonation = async () => {
        if (!donationRecipient || !donationAmount) return;
        
        try {
            const newDonation = {
                id: Date.now(),
                donor: account,
                recipient: donationRecipient,
                amount: donationAmount,
                message: donationMessage,
                timestamp: Date.now(),
                isRevoked: false
            };
            
            setDonations([newDonation, ...donations]);
            setDonationRecipient('');
            setDonationAmount('');
            setDonationMessage('');
            
        } catch (error) {
            console.error('Error making donation:', error);
        }
    };

    const addMilestone = () => {
        setMilestones([...milestones, '']);
        setMilestoneAmounts([...milestoneAmounts, '']);
    };

    const removeMilestone = (index) => {
        setMilestones(milestones.filter((_, i) => i !== index));
        setMilestoneAmounts(milestoneAmounts.filter((_, i) => i !== index));
    };

    const updateMilestone = (index, value) => {
        const newMilestones = [...milestones];
        newMilestones[index] = value;
        setMilestones(newMilestones);
    };

    const updateMilestoneAmount = (index, value) => {
        const newAmounts = [...milestoneAmounts];
        newAmounts[index] = value;
        setMilestoneAmounts(newAmounts);
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    };

    const formatAmount = (amount) => {
        return parseFloat(amount).toFixed(2);
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('grants')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                        activeTab === 'grants' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <Target className="w-4 h-4 inline mr-2" />
                    Grants
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                        activeTab === 'jobs' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Jobs
                </button>
                <button
                    onClick={() => setActiveTab('streams')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                        activeTab === 'streams' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Streams
                </button>
                <button
                    onClick={() => setActiveTab('donations')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                        activeTab === 'donations' 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <Heart className="w-4 h-4 inline mr-2" />
                    Donations
                </button>
            </div>

            {/* Grants Tab */}
            {activeTab === 'grants' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4">Create Grant Proposal</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Grant Title"
                                value={grantTitle}
                                onChange={(e) => setGrantTitle(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                            <input
                                type="number"
                                placeholder="Amount (EMW)"
                                value={grantAmount}
                                onChange={(e) => setGrantAmount(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <textarea
                            placeholder="Grant Description"
                            value={grantDescription}
                            onChange={(e) => setGrantDescription(e.target.value)}
                            className="w-full mt-4 px-3 py-2 border rounded-lg h-24"
                        />
                        <button
                            onClick={handleCreateGrant}
                            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                        >
                            Create Grant
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4">Active Grants</h3>
                        <div className="space-y-4">
                            {grants.map((grant) => (
                                <div key={grant.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold">{grant.title}</h4>
                                        <span className="text-sm text-gray-500">
                                            {formatTimestamp(grant.fundingDeadline)}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{grant.description}</p>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            Requested: {formatAmount(grant.requestedAmount)} EMW
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Votes: {grant.totalVotes}
                                        </div>
                                        <button
                                            onClick={() => setSelectedGrant(grant)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            Vote
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4">Post Job</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Job Title"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                            <input
                                type="number"
                                placeholder="Bounty (EMW)"
                                value={jobBounty}
                                onChange={(e) => setJobBounty(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <textarea
                            placeholder="Job Description"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="w-full mt-4 px-3 py-2 border rounded-lg h-24"
                        />
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Deadline</label>
                            <input
                                type="date"
                                value={jobDeadline}
                                onChange={(e) => setJobDeadline(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <button
                            onClick={handleCreateJob}
                            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                        >
                            Post Job
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4">Available Jobs</h3>
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <div key={job.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold">{job.title}</h4>
                                        <span className="text-sm text-gray-500">
                                            {formatTimestamp(job.deadline)}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{job.description}</p>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            Bounty: {formatAmount(job.totalBounty)} EMW
                                        </div>
                                        {!job.assignedWorker ? (
                                            <button
                                                onClick={() => handleApplyForJob(job.id)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                            >
                                                Apply
                                            </button>
                                        ) : (
                                            <span className="text-sm text-green-600">
                                                Assigned to {job.assignedWorker.substring(0, 6)}...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Streams Tab */}
            {activeTab === 'streams' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4">Create Stream</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Recipient Address"
                                value={streamRecipient}
                                onChange={(e) => setStreamRecipient(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                            <input
                                type="number"
                                placeholder="Amount per Second (EMW)"
                                value={streamAmountPerSecond}
                                onChange={(e) => setStreamAmountPerSecond(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <input
                                type="number"
                                placeholder="Duration (seconds)"
                                value={streamDuration}
                                onChange={(e) => setStreamDuration(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={streamDescription}
                                onChange={(e) => setStreamDescription(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <button
                            onClick={handleCreateStream}
                            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                        >
                            Start Stream
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4">Active Streams</h3>
                        <div className="space-y-4">
                            {streams.map((stream) => (
                                <div key={stream.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold">Stream #{stream.id}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            stream.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {stream.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{stream.description}</p>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Rate:</span>
                                            <div className="font-medium">{formatAmount(stream.amountPerSecond)} EMW/s</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Recipient:</span>
                                            <div className="font-medium">{stream.recipient.substring(0, 6)}...</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Ends:</span>
                                            <div className="font-medium">{formatTimestamp(stream.stopTime)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4">Make Donation</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Recipient Address"
                                value={donationRecipient}
                                onChange={(e) => setDonationRecipient(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                            <input
                                type="number"
                                placeholder="Amount (EMW)"
                                value={donationAmount}
                                onChange={(e) => setDonationAmount(e.target.value)}
                                className="px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <textarea
                            placeholder="Message (optional)"
                            value={donationMessage}
                            onChange={(e) => setDonationMessage(e.target.value)}
                            className="w-full mt-4 px-3 py-2 border rounded-lg h-20"
                        />
                        <button
                            onClick={handleMakeDonation}
                            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                        >
                            Send Donation
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4">Recent Donations</h3>
                        <div className="space-y-4">
                            {donations.map((donation) => (
                                <div key={donation.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold">
                                            {donation.amount} EMW to {donation.recipient.substring(0, 6)}...
                                        </h4>
                                        <span className="text-sm text-gray-500">
                                            {formatTimestamp(donation.timestamp)}
                                        </span>
                                    </div>
                                    {donation.message && (
                                        <p className="text-gray-600 mb-3">"{donation.message}"</p>
                                    )}
                                    <div className="text-sm text-gray-500">
                                        From: {donation.donor.substring(0, 6)}...
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Voting Modal */}
            {selectedGrant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Vote for Grant</h3>
                        <div className="mb-4">
                            <div className="font-medium">{selectedGrant.title}</div>
                            <div className="text-sm text-gray-600">{selectedGrant.description}</div>
                        </div>
                        <input
                            type="number"
                            placeholder="Vote Power"
                            value={votePower}
                            onChange={(e) => setVotePower(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg mb-4"
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleVote(selectedGrant.id)}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                            >
                                Vote
                            </button>
                            <button
                                onClick={() => setSelectedGrant(null)}
                                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;
