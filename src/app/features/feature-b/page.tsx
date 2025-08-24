"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Users, Shield, PiggyBank, Loader2, Plus, Search, Calendar, DollarSign, UserCheck, TrendingUp, Building2, Target } from "lucide-react";
import WalletConnector from "@/components/WalletConnector";

import { ABIS } from "@/lib/abis";

const CONTRACT_ABI = ABIS.SistaCircle;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SISTACIRCLE_ADDRESS || "0xB05Ab1fe51014aC99a93778d2fb3998A28Df6b82";

interface CircleRow {
	id: number;
	name: string;
	description: string;
	creator: string;
	contributionAmount: string;
	totalRounds: number;
	currentRound: number;
	maxMembers: number;
	memberCount: number;
	startTime: number;
	roundDuration: number;
	state: number;
	requiresApproval: boolean;
	totalFunds: string;
	emergencyFund: string;
}

export default function EmpowerHerCirclePage() {
	const [account, setAccount] = useState<string | null>(null);
	const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [contract, setContract] = useState<ethers.Contract | null>(null);
	const [activeTab, setActiveTab] = useState<"discover" | "my" | "create">("discover");
	const [circles, setCircles] = useState<CircleRow[]>([]);
	const [myCircles, setMyCircles] = useState<CircleRow[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [form, setForm] = useState<{ name: string; description: string; contributionAmount: string; totalRounds: string; roundDurationDays: string; requiresApproval: boolean }>({
		name: "",
		description: "",
		contributionAmount: "",
		totalRounds: "",
		roundDurationDays: "7",
		requiresApproval: false
	});

	const filteredCircles = useMemo(() => {
		if (!searchTerm) return circles;
		return circles.filter(circle => 
			circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			circle.description.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [circles, searchTerm]);

	const handleWalletConnect = useCallback(async (
		provider: ethers.BrowserProvider, 
		signer: ethers.Signer, 
		account: string
	) => {
		try {
			setProvider(provider);
			setSigner(signer);
			setAccount(account);
			setError(null);

			// Create contract instance
			const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
			setContract(contractInstance);

			// Load initial data
			await Promise.all([
				loadCircles(contractInstance),
				loadMyCircles(contractInstance, account)
			]);
		} catch (e: any) {
			setError(e?.message || "Failed to initialize contract");
		}
	}, []);

	const handleWalletDisconnect = useCallback(() => {
		setProvider(null);
		setSigner(null);
		setAccount(null);
		setContract(null);
		setCircles([]);
		setMyCircles([]);
		setError(null);
	}, []);

	async function loadCircles(cInst?: ethers.Contract | null) {
		if (!contract && !cInst) return;
		const c = cInst || contract!;
		try {
			setLoading(true);
			const totalRaw: bigint = await c.getTotalCircles();
			const total = Number(totalRaw);
			const list: CircleRow[] = [];
			for (let i = 1; i <= total; i++) {
				const info = await c.getCircleInfo(i);
				list.push({
					id: Number(info[0]),
					name: info[1],
					description: info[2],
					creator: info[3],
					contributionAmount: ethers.formatEther(info[4]),
					totalRounds: Number(info[5]),
					currentRound: Number(info[6]),
					maxMembers: Number(info[7]),
					memberCount: Number(info[8]),
					startTime: Number(info[9]),
					roundDuration: Number(info[10]),
					state: Number(info[11]),
					requiresApproval: Boolean(info[12]),
					totalFunds: ethers.formatEther(info[13]),
					emergencyFund: ethers.formatEther(info[14])
				});
			}
			setCircles(list);
		} catch (e) {
			console.error("Failed loading circles", e);
			setError("Failed to load circles. Please check your connection.");
		} finally {
			setLoading(false);
		}
	}

	async function loadMyCircles(cInst: ethers.Contract, user: string) {
		try {
			const ids: bigint[] = await cInst.getUserCircles(user);
			const list: CircleRow[] = [];
			for (const id of ids) {
				const info = await cInst.getCircleInfo(Number(id));
				list.push({
					id: Number(info[0]),
					name: info[1],
					description: info[2],
					creator: info[3],
					contributionAmount: ethers.formatEther(info[4]),
					totalRounds: Number(info[5]),
					currentRound: Number(info[6]),
					maxMembers: Number(info[7]),
					memberCount: Number(info[8]),
					startTime: Number(info[9]),
					roundDuration: Number(info[10]),
					state: Number(info[11]),
					requiresApproval: Boolean(info[12]),
					totalFunds: ethers.formatEther(info[13]),
					emergencyFund: ethers.formatEther(info[14])
				});
			}
			setMyCircles(list);
		} catch (e) {
			console.error("Failed loading my circles", e);
		}
	}

	async function onCreateCircle(e: React.FormEvent) {
		e.preventDefault();
		if (!contract || !account) return;
		try {
			setLoading(true);
			setError(null);
			
			const contribution = ethers.parseEther(form.contributionAmount || "0");
			const totalRounds = Number(form.totalRounds || "0");
			const maxMembers = totalRounds;
			const roundDuration = Number(form.roundDurationDays || "7") * 24 * 60 * 60;
			
			const tx = await contract.createCircle(
				form.name,
				form.description,
				contribution,
				totalRounds,
				maxMembers,
				roundDuration,
				form.requiresApproval
			);
			
			await tx.wait();
			await loadCircles();
			if (account) await loadMyCircles(contract, account);
			
			setForm({ name: "", description: "", contributionAmount: "", totalRounds: "", roundDurationDays: "7", requiresApproval: false });
			setActiveTab("discover");
		} catch (e: any) {
			setError(e?.message || "Create failed");
		} finally {
			setLoading(false);
		}
	}

	async function onJoin(circleId: number) {
		if (!contract || !account) return;
		try {
			setLoading(true);
			setError(null);
			
			const circle = circles.find(c => c.id === circleId);
			if (!circle) return;
			
			const value = ethers.parseEther(circle.contributionAmount);
			const tx = await contract.joinCircle(circleId, { value });
			await tx.wait();
			
			await loadCircles();
			await loadMyCircles(contract, account);
		} catch (e: any) {
			setError(e?.message || "Join failed");
		} finally {
			setLoading(false);
		}
	}

	async function onContribute(circleId: number) {
		if (!contract || !account) return;
		try {
			setLoading(true);
			setError(null);
			
			const circle = myCircles.find(c => c.id === circleId);
			if (!circle) return;
			
			const value = ethers.parseEther(circle.contributionAmount);
			const tx = await contract.contribute(circleId, { value });
			await tx.wait();
			
			await loadMyCircles(contract, account);
		} catch (e: any) {
			setError(e?.message || "Contribution failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Professional Header */}
			<header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg">
				<div className="max-w-7xl mx-auto px-6 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl">
								<Building2 className="w-8 h-8 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-white">BlockDAG Financial Circles</h1>
								<p className="text-blue-100 font-medium">Rotating Savings Associations (Stokvel) - Build Wealth Together</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<WalletConnector
								onConnect={handleWalletConnect}
								onDisconnect={handleWalletDisconnect}
								isConnected={!!account}
								account={account}
							/>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-6 py-8">
				{/* How It Works Section */}
				<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-200">
					<h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">How Rotating Savings Associations Work</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="text-center">
							<div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<Users className="w-8 h-8 text-blue-600" />
							</div>
							<h3 className="font-semibold text-blue-900 mb-2">1. Join a Circle</h3>
							<p className="text-blue-700 text-sm">Members contribute a fixed amount each round (weekly/monthly)</p>
						</div>
						<div className="text-center">
							<div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<PiggyBank className="w-8 h-8 text-indigo-600" />
							</div>
							<h3 className="font-semibold text-blue-900 mb-2">2. Pool Grows</h3>
							<p className="text-blue-700 text-sm">All contributions are pooled together securely on blockchain</p>
						</div>
						<div className="text-center">
							<div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<Target className="w-8 h-8 text-yellow-600" />
							</div>
							<h3 className="font-semibold text-blue-900 mb-2">3. Fair Rotation</h3>
							<p className="text-blue-700 text-sm">Each member receives the full pot in automated, fair rotation</p>
						</div>
					</div>
					<p className="text-center text-blue-700 mt-6">
						<strong>Traditional Stokvel meets modern blockchain technology</strong> - ensuring transparency, security, and automated fairness for all members.
					</p>
				</div>

				{/* Statistics Dashboard */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600">Total Circles</p>
								<p className="text-2xl font-bold text-slate-900">{circles.length}</p>
							</div>
							<div className="bg-blue-100 p-3 rounded-lg">
								<Building2 className="w-6 h-6 text-blue-600" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600">My Circles</p>
								<p className="text-2xl font-bold text-slate-900">{myCircles.length}</p>
							</div>
							<div className="bg-purple-100 p-3 rounded-lg">
								<Users className="w-6 h-6 text-purple-600" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600">Network Status</p>
								<p className="text-2xl font-bold text-slate-900">{account ? "Active" : "Inactive"}</p>
							</div>
							<div className="bg-green-100 p-3 rounded-lg">
								<Shield className="w-6 h-6 text-green-600" />
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600">Total Funds</p>
								<p className="text-2xl font-bold text-slate-900">
									{circles.reduce((sum, c) => sum + parseFloat(c.totalFunds), 0).toFixed(2)} BDAG
								</p>
							</div>
							<div className="bg-emerald-100 p-3 rounded-lg">
								<TrendingUp className="w-6 h-6 text-emerald-600" />
							</div>
						</div>
					</div>
				</div>

				{/* Navigation Tabs */}
				<div className="bg-white rounded-xl border border-blue-200 p-2 mb-8 shadow-sm">
					<div className="flex gap-1">
						<button 
							onClick={() => setActiveTab("discover")} 
							className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
								activeTab === "discover" 
									? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
									: "text-blue-700 hover:bg-blue-50"
							}`}
						>
							<Search className="w-4 h-4 inline mr-2" />
							Discover Circles
						</button>
						<button 
							onClick={() => setActiveTab("my")} 
							className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
								activeTab === "my" 
									? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
									: "text-blue-700 hover:bg-blue-50"
							}`}
						>
							<UserCheck className="w-4 h-4 inline mr-2" />
							My Circles
						</button>
						<button 
							onClick={() => setActiveTab("create")} 
							className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
								activeTab === "create" 
									? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
									: "text-blue-700 hover:bg-blue-50"
							}`}
						>
							<Plus className="w-4 h-4 inline mr-2" />
							Create Circle
						</button>
					</div>
				</div>

				{/* Error Display */}
				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-red-500 rounded-full"></div>
							<p className="text-red-700 font-medium">{error}</p>
						</div>
					</div>
				)}

				{/* Discover Tab */}
				{activeTab === "discover" && (
					<section>
						<div className="mb-6">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
								<input
									type="text"
									placeholder="Search circles by name or description..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								/>
							</div>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredCircles.map((circle) => (
								<div key={circle.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
									<div className="flex items-start justify-between mb-4">
										<h3 className="text-xl font-bold text-slate-900">{circle.name}</h3>
										<span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
											#{circle.id}
										</span>
									</div>
									<p className="text-slate-600 mb-4 line-clamp-3">{circle.description}</p>
									
									<div className="space-y-3 mb-6">
										<div className="flex items-center justify-between text-sm">
											<span className="text-slate-500">Members</span>
											<span className="font-semibold text-slate-900">
												{circle.memberCount}/{circle.maxMembers}
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-slate-500">Contribution</span>
											<span className="font-bold text-indigo-600">
												{circle.contributionAmount} BDAG
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-slate-500">Duration</span>
											<span className="font-semibold text-slate-900">
												{Math.ceil(circle.roundDuration / (24 * 60 * 60))} days
											</span>
										</div>
									</div>
									
									<button 
										onClick={() => onJoin(circle.id)} 
										disabled={!account || loading} 
										className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{loading ? (
											<div className="flex items-center justify-center gap-2">
												<Loader2 className="w-4 h-4 animate-spin" />
												Processing...
											</div>
										) : (
											"Join Circle"
										)}
									</button>
								</div>
							))}
						</div>
						
						{loading && (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="w-8 h-8 text-slate-400 animate-spin mr-3" />
								<span className="text-slate-600 font-medium">Loading circles...</span>
							</div>
						)}
						
						{filteredCircles.length === 0 && !loading && (
							<div className="text-center py-12">
								<Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-slate-600 mb-2">No circles found</h3>
								<p className="text-slate-500">Try adjusting your search or create the first circle.</p>
							</div>
						)}
					</section>
				)}

				{/* My Circles Tab */}
				{activeTab === "my" && (
					<section>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{myCircles.map((circle) => (
								<div key={circle.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
									<div className="flex items-start justify-between mb-4">
										<h3 className="text-xl font-bold text-slate-900">{circle.name}</h3>
										<span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
											Round {circle.currentRound}/{circle.totalRounds}
										</span>
									</div>
									<p className="text-slate-600 mb-4 line-clamp-3">{circle.description}</p>
									
									<div className="space-y-3 mb-6">
										<div className="flex items-center justify-between text-sm">
											<span className="text-slate-500">Members</span>
											<span className="font-semibold text-slate-900">
												{circle.memberCount}/{circle.maxMembers}
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-slate-500">Contribution</span>
											<span className="font-bold text-indigo-600">
												{circle.contributionAmount} BDAG
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-slate-500">Total Funds</span>
											<span className="font-semibold text-slate-900">
												{circle.totalFunds} BDAG
											</span>
										</div>
									</div>
									
									<button 
										onClick={() => onContribute(circle.id)} 
										disabled={!account || loading} 
										className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{loading ? (
											<div className="flex items-center justify-center gap-2">
												<Loader2 className="w-4 h-4 animate-spin" />
												Processing...
											</div>
										) : (
											"Make Contribution"
										)}
									</button>
								</div>
							))}
						</div>
						
						{myCircles.length === 0 && (
							<div className="text-center py-12">
								<Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-slate-600 mb-2">No circles joined yet</h3>
								<p className="text-slate-500">Discover and join circles to get started with your financial journey.</p>
							</div>
						)}
					</section>
				)}

				{/* Create Tab */}
				{activeTab === "create" && (
					<section className="max-w-4xl mx-auto">
						<div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
							<div className="text-center mb-8">
								<div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<Plus className="w-8 h-8 text-indigo-600" />
								</div>
								<h3 className="text-2xl font-bold text-slate-900 mb-2">Create New Circle</h3>
								<p className="text-slate-600">Establish a professional financial empowerment group</p>
							</div>
							
							<form onSubmit={onCreateCircle} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Circle Name *
										</label>
										<input 
											value={form.name} 
											onChange={(e) => setForm({ ...form, name: e.target.value })} 
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
											placeholder="e.g., Professional Women's Investment Group" 
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Contribution Amount (BDAG) *
										</label>
										<input 
											value={form.contributionAmount} 
											onChange={(e) => setForm({ ...form, contributionAmount: e.target.value })} 
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
											placeholder="0.10" 
											type="number"
											step="0.01"
											required
										/>
									</div>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Description *
									</label>
									<textarea 
										value={form.description} 
										onChange={(e) => setForm({ ...form, description: e.target.value })} 
										className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
										rows={4} 
										placeholder="Describe the purpose and goals of this circle..."
										required
									/>
								</div>
								
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Total Rounds *
										</label>
										<input 
											value={form.totalRounds} 
											onChange={(e) => setForm({ ...form, totalRounds: e.target.value })} 
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
											placeholder="12" 
											type="number"
											min="2"
											max="52"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Round Duration (days) *
										</label>
										<input 
											value={form.roundDurationDays} 
											onChange={(e) => setForm({ ...form, roundDurationDays: e.target.value })} 
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
											placeholder="7" 
											type="number"
											min="1"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Max Members
										</label>
										<input 
											value={form.totalRounds} 
											className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500" 
											placeholder="Auto-calculated" 
											disabled
										/>
									</div>
								</div>
								
								<div className="flex items-center gap-3">
									<input 
										id="requiresApproval" 
										type="checkbox" 
										checked={form.requiresApproval} 
										onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })} 
										className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
									/>
									<label htmlFor="requiresApproval" className="text-sm font-medium text-slate-700">
										Require approval for new members
									</label>
								</div>
								
								<button 
									type="submit" 
									disabled={!account || loading} 
									className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
								>
									{loading ? (
										<div className="flex items-center justify-center gap-3">
											<Loader2 className="w-5 h-5 animate-spin" />
											Creating Circle...
										</div>
									) : (
										"Create Professional Circle"
									)}
								</button>
							</form>
						</div>
					</section>
				)}
			</main>
		</div>
	);
}


