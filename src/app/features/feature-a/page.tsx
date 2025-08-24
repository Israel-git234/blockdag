"use client";
import React, { useState, useRef } from "react";
import { Play, Heart, MessageCircle, Share2, TrendingUp, Search, Plus, User, Home, Compass, GraduationCap, Upload, Video, BookOpen, DollarSign, Users, Calendar, Star, Menu, Settings, LogOut } from "lucide-react";

const EmpowerHerApp = () => {
	const [activeTab, setActiveTab] = useState("home");
	const [likedVideos, setLikedVideos] = useState(new Set<number>());
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [createType, setCreateType] = useState<"video" | "course">("video");
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Form states for video creation
	const [videoForm, setVideoForm] = useState({
		title: "",
		description: "",
		category: "",
		expertise: "",
		price: "",
		thumbnail: null as File | null
	});

	// Store uploaded videos
	const [uploadedVideos, setUploadedVideos] = useState<Array<{
		id: number;
		title: string;
		description: string;
		creator: string;
		expertise: string;
		views: string;
		likes: string;
		duration: string;
		thumbnail: string;
		earnings: string;
		category: string;
		price: string;
		uploadDate: Date;
	}>>([]);

	// Form states for course creation
	const [courseForm, setCourseForm] = useState({
		title: "",
		instructor: "",
		description: "",
		duration: "",
		level: "Beginner",
		price: "",
		thumbnail: null as File | null
	});

	const featuredVideos = [
		{
			id: 1,
			title: "5 Essential Tips for New Mothers: From Sleep to Self-Care",
			creator: "Dr. Sarah Williams",
			expertise: "Pediatric Nursing",
			views: "127K",
			likes: "8.2K",
			duration: "12:45",
			thumbnail: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=250&fit=crop",
			earnings: "$324",
			category: "Parenting",
		},
		{
			id: 2,
			title: "Breaking into Tech: My Journey from Beginner to Senior Developer",
			creator: "Maria Rodriguez",
			expertise: "Software Engineering",
			views: "95K",
			likes: "6.1K",
			duration: "18:30",
			thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop",
			earnings: "$287",
			category: "Technology",
		},
		{
			id: 3,
			title: "Quick & Healthy Meals for Busy Professional Women",
			creator: "Chef Amanda Chen",
			expertise: "Culinary Arts",
			views: "203K",
			likes: "12.5K",
			duration: "15:20",
			thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop",
			earnings: "$456",
			category: "Cooking",
		},
		{
			id: 4,
			title: "AI for Beginners: Understanding Machine Learning in Simple Terms",
			creator: "Dr. Priya Patel",
			expertise: "Artificial Intelligence",
			views: "89K",
			likes: "5.8K",
			duration: "22:10",
			thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
			earnings: "$234",
			category: "AI & Technology",
		},
	];

	const freeCourses = [
		{
			id: 1,
			title: "Digital Marketing Fundamentals",
			instructor: "Lisa Thompson",
			duration: "6 weeks",
			certificate: true,
			enrolled: "2,430",
			rating: 4.8,
			level: "Beginner",
			thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
		},
		{
			id: 2,
			title: "Project Management Essentials",
			instructor: "Rachel Green",
			duration: "4 weeks",
			certificate: true,
			enrolled: "1,856",
			rating: 4.9,
			level: "Intermediate",
			thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop",
		},
		{
			id: 3,
			title: "Financial Literacy for Women",
			instructor: "Jennifer Davis",
			duration: "5 weeks",
			certificate: true,
			enrolled: "3,201",
			rating: 4.7,
			level: "Beginner",
			thumbnail: "https://images.unsplash.com/photo-1554224154-26032fced8bd?w=300&h=200&fit=crop",
		},
	];

	const categories = [
		"All",
		"Parenting",
		"Technology",
		"Cooking",
		"Business",
		"Health & Wellness",
		"Finance",
		"Education",
		"Arts & Creativity",
		"Career Development",
		"Mental Health",
		"Fitness",
		"Relationships",
		"Travel",
		"Lifestyle"
	];



	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (createType === "video") {
				setVideoForm(prev => ({ ...prev, thumbnail: file }));
			} else {
				setCourseForm(prev => ({ ...prev, thumbnail: file }));
			}
		}
	};

	const handleVideoSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!videoForm.title || !videoForm.description || !videoForm.category) {
			alert("Please fill in all required fields");
			return;
		}

		setIsUploading(true);
		setUploadProgress(0);

		// Simulate upload progress
		const interval = setInterval(() => {
			setUploadProgress(prev => {
				if (prev >= 100) {
					clearInterval(interval);
					setIsUploading(false);
					return 100;
				}
				return prev + 10;
			});
		}, 200);

		// Simulate upload time
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Create new video object and add to uploaded videos
		const newVideo = {
			id: Date.now(),
			title: videoForm.title,
			description: videoForm.description,
			creator: "You",
			expertise: videoForm.expertise || "Creator",
			views: "0",
			likes: "0",
			duration: "0:00",
			thumbnail: videoForm.thumbnail ? URL.createObjectURL(videoForm.thumbnail) : "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=250&fit=crop",
			earnings: "$0",
			category: videoForm.category,
			price: videoForm.price || "0",
			uploadDate: new Date()
		};

		setUploadedVideos(prev => [newVideo, ...prev]);

		// Reset form and close modal
		setVideoForm({
			title: "",
			description: "",
			category: "",
			expertise: "",
			price: "",
			thumbnail: null
		});
		setShowCreateModal(false);
		setUploadProgress(0);
		setIsUploading(false);

		alert("Video uploaded successfully! It's now live on the platform.");
	};

	const handleCourseSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!courseForm.title || !courseForm.description || !courseForm.duration) {
			alert("Please fill in all required fields");
			return;
		}

		setIsUploading(true);
		setUploadProgress(0);

		// Simulate upload progress
		const interval = setInterval(() => {
			setUploadProgress(prev => {
				if (prev >= 100) {
					clearInterval(interval);
					setIsUploading(false);
					return 100;
				}
				return prev + 10;
			});
		}, 200);

		// Simulate upload time
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Reset form and close modal
		setCourseForm({
			title: "",
			instructor: "",
			description: "",
			duration: "",
			level: "Beginner",
			price: "",
			thumbnail: null
		});
		setShowCreateModal(false);
		setUploadProgress(0);
		setIsUploading(false);

		alert("Empowerment course created successfully! It will be reviewed and published soon.");
	};

	const toggleLike = (videoId: number) => {
		setLikedVideos(prev => {
			const newSet = new Set(prev);
			if (newSet.has(videoId)) {
				newSet.delete(videoId);
			} else {
				newSet.add(videoId);
			}
			return newSet;
		});
	};

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Header */}
			<header className="bg-white border-b border-slate-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-6 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="bg-gradient-to-br from-pink-600 to-rose-600 p-3 rounded-xl">
								<Play className="w-8 h-8 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-slate-900">EmpowerHer Learning Platform</h1>
								<p className="text-slate-600 font-medium">Share Knowledge, Build Skills, Empower Others</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<button
								onClick={() => setShowCreateModal(true)}
								className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all duration-200 flex items-center gap-2"
							>
								<Plus className="w-5 h-5" />
								Create Video
							</button>
							
							{/* Hamburger Menu */}
							<div className="relative">
								<button
									onClick={() => setShowMenu(!showMenu)}
									className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
								>
									<Menu className="w-6 h-6" />
								</button>
								
								{showMenu && (
									<div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
										<button className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
											<Settings className="w-4 h-4" />
											Settings
										</button>
										<button className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
											<User className="w-4 h-4" />
											Profile
										</button>
										<hr className="my-2 border-slate-200" />
										<button className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
											<LogOut className="w-4 h-4" />
											Logout
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Navigation Tabs */}
			<nav className="bg-white border-b border-slate-200">
				<div className="max-w-7xl mx-auto px-6">
					<div className="flex space-x-8">
						<button
							onClick={() => setActiveTab("home")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "home"
									? "border-pink-500 text-pink-600"
									: "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
							}`}
						>
							<Home className="w-4 h-4 inline mr-2" />
							Home
						</button>
						<button
							onClick={() => setActiveTab("videos")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "videos"
									? "border-pink-500 text-pink-600"
									: "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
							}`}
						>
							<Video className="w-4 h-4 inline mr-2" />
							Videos
						</button>
						<button
							onClick={() => setActiveTab("courses")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "courses"
									? "border-pink-500 text-pink-600"
									: "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
							}`}
						>
							<BookOpen className="w-4 h-4 inline mr-2" />
							Learning Courses
						</button>
						<button
							onClick={() => setActiveTab("earnings")}
							className={`py-4 px-1 border-b-2 font-medium text-sm ${
								activeTab === "earnings"
									? "border-pink-500 text-pink-600"
									: "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
							}`}
						>
							<DollarSign className="w-4 h-4 inline mr-2" />
							My Earnings
						</button>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-6 py-8">
				{/* Home Tab */}
				{activeTab === "home" && (
					<div className="space-y-8">
						{/* Hero Section */}
						<div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 text-center">
							<h2 className="text-3xl font-bold text-slate-900 mb-4">
								Share Your Knowledge, Empower Other Women
							</h2>
							<p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
								Create videos and courses that help women build skills, advance careers, and achieve financial independence. 
								Your expertise can change lives and generate income.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<button
									onClick={() => {
										setCreateType("video");
										setShowCreateModal(true);
									}}
									className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all duration-200 flex items-center justify-center gap-2"
								>
									<Video className="w-5 h-5" />
									Upload Video
								</button>
								<button
									onClick={() => {
										setCreateType("course");
										setShowCreateModal(true);
									}}
									className="px-6 py-3 border-2 border-pink-600 text-pink-600 font-semibold rounded-xl hover:bg-pink-50 transition-all duration-200 flex items-center justify-center gap-2"
								>
									<BookOpen className="w-5 h-5" />
									Create Learning Course
								</button>
							</div>
						</div>

						{/* Featured Videos */}
						<section>
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-2xl font-bold text-slate-900">Featured Videos</h3>
								<button className="text-pink-600 hover:text-pink-700 font-medium">
									View All →
								</button>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
								{featuredVideos.map((video) => (
									<div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200">
										<div className="relative">
											<img
												src={video.thumbnail}
												alt={video.title}
												className="w-full h-48 object-cover"
											/>
											<div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
												<Play className="w-12 h-12 text-white" />
											</div>
											<div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
												{video.duration}
											</div>
										</div>
										<div className="p-4">
											<h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">
												{video.title}
											</h4>
											<p className="text-sm text-slate-600 mb-2">{video.creator}</p>
											<div className="flex items-center justify-between text-sm text-slate-500 mb-3">
												<span>{video.views} views</span>
												<span>{video.earnings} earned</span>
											</div>
											<div className="flex items-center justify-between">
												<button
													onClick={() => toggleLike(video.id)}
													className={`flex items-center gap-1 text-sm ${
														likedVideos.has(video.id)
															? "text-pink-600"
															: "text-slate-500 hover:text-pink-600"
													}`}
												>
													<Heart className={`w-4 h-4 ${likedVideos.has(video.id) ? "fill-current" : ""}`} />
													{video.likes}
												</button>
												<span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
													{video.category}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</section>

						{/* Your Uploaded Videos */}
						{uploadedVideos.length > 0 && (
							<section className="mb-8">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-2xl font-bold text-slate-900">Your Uploaded Videos</h3>
									<span className="text-sm text-slate-500 bg-pink-100 px-3 py-1 rounded-full">
										{uploadedVideos.length} video{uploadedVideos.length !== 1 ? 's' : ''}
									</span>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									{uploadedVideos.map((video) => (
										<div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border-2 border-pink-200">
											<div className="relative">
												<img
													src={video.thumbnail}
													alt={video.title}
													className="w-full h-48 object-cover"
												/>
												<div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
													<Play className="w-12 h-12 text-white" />
												</div>
												<div className="absolute top-3 right-3 bg-pink-500 text-white text-xs px-2 py-1 rounded">
													LIVE
												</div>
											</div>
											<div className="p-4">
												<h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">
													{video.title}
												</h4>
												<p className="text-sm text-slate-600 mb-2">{video.creator}</p>
												<div className="flex items-center justify-between text-sm text-slate-500 mb-3">
													<span>{video.views} views</span>
													<span>{video.earnings} earned</span>
												</div>
												<div className="flex items-center justify-between">
													<button
														onClick={() => toggleLike(video.id)}
														className={`flex items-center gap-1 text-sm ${
															likedVideos.has(video.id)
																? "text-pink-600"
																: "text-slate-500 hover:text-pink-600"
														}`}
													>
														<Heart className={`w-4 h-4 ${likedVideos.has(video.id) ? "fill-current" : ""}`} />
														{video.likes}
													</button>
													<span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
														{video.category}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</section>
						)}

						{/* Free Courses */}
						<section>
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-2xl font-bold text-slate-900">Free Learning Courses</h3>
								<button className="text-pink-600 hover:text-pink-700 font-medium">
									View All →
								</button>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{freeCourses.map((course) => (
									<div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200">
										<img
											src={course.thumbnail}
											alt={course.title}
											className="w-full h-40 object-cover"
										/>
										<div className="p-4">
											<h4 className="font-semibold text-slate-900 mb-2">{course.title}</h4>
											<p className="text-sm text-slate-600 mb-3">{course.instructor}</p>
											<div className="flex items-center justify-between text-sm text-slate-500 mb-3">
												<span>{course.duration}</span>
												<span>{course.level}</span>
											</div>
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-1">
													<Star className="w-4 h-4 text-yellow-400 fill-current" />
													<span className="text-sm font-medium">{course.rating}</span>
												</div>
												<span className="text-sm text-slate-500">{course.enrolled} enrolled</span>
											</div>
											<button className="w-full py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200">
												Enroll Free
											</button>
										</div>
									</div>
								))}
							</div>
						</section>
					</div>
				)}

				{/* Videos Tab */}
				{activeTab === "videos" && (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h3 className="text-2xl font-bold text-slate-900">All Empowerment Videos</h3>
							<div className="flex items-center gap-4">
								<select className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
									{categories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
								<button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
									<Search className="w-4 h-4" />
								</button>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{featuredVideos.map((video) => (
								<div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200">
									<div className="relative">
										<img
											src={video.thumbnail}
											alt={video.title}
											className="w-full h-48 object-cover"
										/>
										<div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
											<Play className="w-12 h-12 text-white" />
										</div>
										<div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
											{video.duration}
										</div>
									</div>
									<div className="p-4">
										<h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">
											{video.title}
										</h4>
										<p className="text-sm text-slate-600 mb-2">{video.creator}</p>
										<div className="flex items-center justify-between text-sm text-slate-500 mb-3">
											<span>{video.views} views</span>
											<span>{video.earnings} earned</span>
										</div>
										<div className="flex items-center justify-between">
											<button
												onClick={() => toggleLike(video.id)}
												className={`flex items-center gap-1 text-sm ${
													likedVideos.has(video.id)
														? "text-pink-600"
														: "text-slate-500 hover:text-pink-600"
												}`}
											>
												<Heart className={`w-4 h-4 ${likedVideos.has(video.id) ? "fill-current" : ""}`} />
												{video.likes}
											</button>
											<span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
												{video.category}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Courses Tab */}
				{activeTab === "courses" && (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h3 className="text-2xl font-bold text-slate-900">All Learning Courses</h3>
							<div className="flex items-center gap-4">
								<select className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
									<option value="all">All Levels</option>
									<option value="beginner">Beginner</option>
									<option value="intermediate">Intermediate</option>
									<option value="advanced">Advanced</option>
								</select>
								<button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
									<Search className="w-4 h-4" />
								</button>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{freeCourses.map((course) => (
								<div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200">
									<img
										src={course.thumbnail}
										alt={course.title}
										className="w-full h-40 object-cover"
									/>
									<div className="p-4">
										<h4 className="font-semibold text-slate-900 mb-2">{course.title}</h4>
										<p className="text-sm text-slate-600 mb-3">{course.instructor}</p>
										<div className="flex items-center justify-between text-sm text-slate-500 mb-3">
											<span>{course.duration}</span>
											<span>{course.level}</span>
										</div>
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-1">
												<Star className="w-4 h-4 text-yellow-400 fill-current" />
												<span className="text-sm font-medium">{course.rating}</span>
											</div>
											<span className="text-sm text-slate-500">{course.enrolled} enrolled</span>
										</div>
										<button className="w-full py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200">
											Enroll Free
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Earnings Tab */}
				{activeTab === "earnings" && (
					<div className="space-y-6">
						<div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8">
							<h3 className="text-2xl font-bold text-slate-900 mb-4">Your Earnings Overview</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="bg-white rounded-xl p-6 text-center">
									<div className="text-3xl font-bold text-pink-600 mb-2">$1,245</div>
									<div className="text-slate-600">Total Earnings</div>
								</div>
								<div className="bg-white rounded-xl p-6 text-center">
									<div className="text-3xl font-bold text-pink-600 mb-2">$89</div>
									<div className="text-slate-600">This Month</div>
								</div>
								<div className="bg-white rounded-xl p-6 text-center">
									<div className="text-3xl font-bold text-pink-600 mb-2">12</div>
									<div className="text-slate-600">Published Videos</div>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl p-6">
							<h4 className="text-lg font-semibold text-slate-900 mb-4">Recent Earnings</h4>
							<div className="space-y-3">
								{featuredVideos.slice(0, 3).map((video) => (
									<div key={video.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
										<div>
											<div className="font-medium text-slate-900">{video.title}</div>
											<div className="text-sm text-slate-500">{video.views} views</div>
										</div>
										<div className="text-right">
											<div className="font-semibold text-green-600">{video.earnings}</div>
											<div className="text-sm text-slate-500">Last 30 days</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</main>

			{/* Create Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-slate-200">
							<div className="flex items-center justify-between">
								<h3 className="text-xl font-bold text-slate-900">
									Create {createType === "video" ? "Video" : "Learning Course"}
								</h3>
								<button
									onClick={() => setShowCreateModal(false)}
									className="text-slate-400 hover:text-slate-600"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>

						<div className="p-6">
							{createType === "video" ? (
								<form onSubmit={handleVideoSubmit} className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Video Title *
										</label>
										<input
											type="text"
											value={videoForm.title}
											onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
											placeholder="Enter an engaging title for your empowerment video"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Description *
										</label>
										<textarea
											value={videoForm.description}
											onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
											rows={3}
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
											placeholder="Describe what viewers will learn from your video"
											required
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">
												Category *
											</label>
											<select
												value={videoForm.category}
												onChange={(e) => setVideoForm(prev => ({ ...prev, category: e.target.value }))}
												className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
												required
											>
												<option value="">Select Category</option>
												{categories.slice(1).map((category) => (
													<option key={category} value={category}>
														{category}
													</option>
												))}
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">
												Your Expertise
											</label>
											<input
												type="text"
												value={videoForm.expertise}
												onChange={(e) => setVideoForm(prev => ({ ...prev, expertise: e.target.value }))}
												className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
												placeholder="e.g., Software Engineer, Chef, Doctor"
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Video File *
										</label>
										<input
											type="file"
											accept="video/*"
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Thumbnail Image
										</label>
										<input
											type="file"
											accept="image/*"
											onChange={handleFileSelect}
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Price (Optional)
										</label>
										<input
											type="number"
											value={videoForm.price}
											onChange={(e) => setVideoForm(prev => ({ ...prev, price: e.target.value }))}
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
											placeholder="0.00 (Free) or enter price in USD"
											step="0.01"
											min="0"
										/>
									</div>

									<button
										type="submit"
										disabled={isUploading}
										className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50"
									>
										{isUploading ? (
											<div className="flex items-center justify-center gap-2">
												<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
												Uploading... {uploadProgress}%
											</div>
										) : (
											"Upload Video"
										)}
									</button>
								</form>
							) : (
								<form onSubmit={handleCourseSubmit} className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Course Title *
										</label>
										<input
											type="text"
											value={courseForm.title}
											onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
											placeholder="Enter an engaging title for your course"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Description *
										</label>
										<textarea
											value={courseForm.description}
											onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
											rows={3}
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
											placeholder="Describe what students will learn from your course"
											required
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">
												Duration *
											</label>
											<input
												type="text"
												value={courseForm.duration}
												onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
												className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
												placeholder="e.g., 6 weeks, 8 hours"
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">
												Level
											</label>
											<select
												value={courseForm.level}
												onChange={(e) => setCourseForm(prev => ({ ...prev, level: e.target.value }))}
												className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
											>
												<option value="Beginner">Beginner</option>
												<option value="Intermediate">Intermediate</option>
												<option value="Advanced">Advanced</option>
											</select>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Course Materials *
										</label>
										<input
											type="file"
											multiple
											accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov"
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Thumbnail Image
										</label>
										<input
											type="file"
											accept="image/*"
											onChange={handleFileSelect}
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Price (Optional)
										</label>
										<input
											type="number"
											value={courseForm.price}
											onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
											className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
											placeholder="0.00 (Free) or enter price in USD"
											step="0.01"
											min="0"
										/>
									</div>

									<button
										type="submit"
										disabled={isUploading}
										className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50"
									>
										{isUploading ? (
											<div className="flex items-center justify-center gap-2">
												<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
												Creating... {uploadProgress}%
											</div>
										) : (
											"Create Learning Course"
										)}
									</button>
								</form>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EmpowerHerApp;



