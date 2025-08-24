import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  Edit,
  Save,
  X
} from 'lucide-react';

const Profile = ({ account, contracts, onTransaction }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+27 82 123 4567',
    location: 'Johannesburg, South Africa',
    preferences: {
      notifications: true,
      privacyMode: false,
      language: 'English',
      currency: 'ZAR'
    }
  });

  const [tempProfile, setTempProfile] = useState({ ...profileData });

  const handleSave = async () => {
    try {
      // Simulate saving profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData({ ...tempProfile });
      setIsEditing(false);
      
      if (onTransaction) {
        onTransaction(Promise.resolve(), 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setTempProfile({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfile({
      ...tempProfile,
      [field]: value
    });
  };

  const handlePreferenceChange = (pref, value) => {
    setTempProfile({
      ...tempProfile,
      preferences: {
        ...tempProfile.preferences,
        [pref]: value
      }
    });
  };

  const disconnectWallet = () => {
    // This would typically clear the wallet connection
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <User className="w-8 h-8 text-purple-600" />
          Profile & Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account, preferences, and privacy</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'preferences'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Preferences
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'security'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Security
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profileData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={tempProfile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profileData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={tempProfile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profileData.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfile.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profileData.location}</p>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Wallet Information</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700 mb-1">Connected Wallet</p>
                <p className="font-mono text-sm text-blue-900">{account}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">Network</p>
                <p className="text-sm text-blue-900">BlockDAG Primordial Testnet</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Preferences</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Receive alerts for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.preferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Privacy Mode</h4>
                <p className="text-sm text-gray-600">Hide sensitive information from public view</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.preferences.privacyMode}
                  onChange={(e) => handlePreferenceChange('privacyMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={profileData.preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="English">English</option>
                <option value="Afrikaans">Afrikaans</option>
                <option value="Zulu">Zulu</option>
                <option value="Xhosa">Xhosa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={profileData.preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ZAR">South African Rand (ZAR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Security & Privacy</h3>
          
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Blockchain Security</h4>
              <p className="text-green-700 text-sm">
                Your data is secured using blockchain technology. Medical records, financial transactions, 
                and personal information are encrypted and stored on the BlockDAG network for maximum security.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Privacy Features</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Zero-knowledge proofs for sensitive data</li>
                <li>• Encrypted off-chain storage with on-chain verification</li>
                <li>• Consent-based data sharing</li>
                <li>• Anonymous reporting capabilities</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy Settings
              </button>
              <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Security Help
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Wallet */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Wallet Connection</h3>
            <p className="text-sm text-gray-600">Disconnect your wallet from this application</p>
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
