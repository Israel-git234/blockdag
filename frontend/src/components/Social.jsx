import React, { useState, useRef, useCallback } from 'react';
import { Video, Upload, Heart, MessageCircle, Play, User, Eye, Calendar, AlertCircle } from 'lucide-react';

const Social = ({ account, contracts, onTransaction }) => {
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: "Women in Tech: Breaking Barriers",
      description: "How women are transforming the technology industry",
      uploader: "0x1234...5678",
      views: 1247,
      likes: 89,
      comments: 23,
      thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=225&fit=crop",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      timestamp: "2 hours ago",
      liked: false
    },
    {
      id: 2,
      title: "Financial Independence for Women",
      description: "Building wealth through smart investments",
      uploader: "0x8765...4321",
      views: 892,
      likes: 156,
      comments: 45,
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      timestamp: "1 day ago",
      liked: true
    }
  ]);
  
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Validate file size (max 100MB)
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    setUploadError('');
    
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, MOV, WebM, etc.)');
      setSelectedFile(null);
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 100MB');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
  }, []);

  const validateForm = useCallback(() => {
    if (!uploadTitle.trim()) {
      setUploadError('Please enter a video title');
      return false;
    }
    
    if (uploadTitle.length > 100) {
      setUploadError('Title must be less than 100 characters');
      return false;
    }
    
    if (uploadDescription.length > 500) {
      setUploadError('Description must be less than 500 characters');
      return false;
    }
    
    if (!selectedFile) {
      setUploadError('Please select a video file');
      return false;
    }
    
    return true;
  }, [uploadTitle, uploadDescription, selectedFile]);

  const handleUpload = useCallback(async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    setUploadError('');
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new video object with proper validation
      const newVideo = {
        id: Date.now(), // Use timestamp for unique ID
        title: uploadTitle.trim(),
        description: uploadDescription.trim(),
        uploader: account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Anonymous',
        views: 0,
        likes: 0,
        comments: 0,
        thumbnail: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=225&fit=crop",
        videoUrl: URL.createObjectURL(selectedFile),
        timestamp: "Just now",
        liked: false
      };
      
      setVideos(prevVideos => [newVideo, ...prevVideos]);
      setUploadTitle('');
      setUploadDescription('');
      setSelectedFile(null);
      setShowUpload(false);
      
      // Show success message
      if (onTransaction) {
        onTransaction(Promise.resolve(), 'Video uploaded successfully! 🎉');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [uploadTitle, uploadDescription, selectedFile, account, onTransaction, validateForm]);

  const toggleLike = useCallback((videoId) => {
    setVideos(prevVideos => prevVideos.map(video => {
      if (video.id === videoId) {
        return {
          ...video,
          liked: !video.liked,
          likes: video.liked ? video.likes - 1 : video.likes + 1
        };
      }
      return video;
    }));
  }, []);

  const formatViews = useCallback((views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
  }, []);

  const handleCancelUpload = useCallback(() => {
    setShowUpload(false);
    setUploadTitle('');
    setUploadDescription('');
    setSelectedFile(null);
    setUploadError('');
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Video className="w-8 h-8 text-purple-600" />
            Social Feed
          </h1>
          <p className="text-gray-600 mt-2">Share your story and empower other women</p>
        </div>
        
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
        >
          <Upload className="w-5 h-5" />
          {showUpload ? 'Cancel' : 'Upload Video'}
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Video</h3>
          
          {/* Error Display */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              {uploadError}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter video title..."
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{uploadTitle.length}/100 characters</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Describe your video..."
                rows="3"
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{uploadDescription.length}/500 characters</p>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Video File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {selectedFile ? selectedFile.name : 'Click to select video file'}
              </p>
              {selectedFile && (
                <p className="text-sm text-gray-500 mb-2">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Choose File
              </button>
              <p className="text-xs text-gray-500 mt-2">Maximum file size: 100MB</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleCancelUpload}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || !uploadTitle.trim() || !selectedFile}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Video
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Video Feed */}
      <div className="space-y-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Video Thumbnail */}
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 rounded-full p-4">
                  <Play className="w-8 h-8 text-purple-600 ml-1" />
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                {formatViews(video.views)} views
              </div>
            </div>
            
            {/* Video Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-gray-600 mb-3">{video.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {video.uploader}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {video.timestamp}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleLike(video.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    video.liked 
                      ? 'text-red-600 bg-red-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${video.liked ? 'fill-current' : ''}`} />
                  <span>{video.likes}</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{video.comments}</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  <Eye className="w-5 h-5" />
                  <span>Watch</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {videos.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share your story!</p>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Upload First Video
          </button>
        </div>
      )}
    </div>
  );
};

export default Social;
