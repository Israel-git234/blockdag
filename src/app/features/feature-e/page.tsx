"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Heart, 
  Users, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Navigation,
  Headphones,
  Video,
  Calendar,
  UserCheck,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Search,
  Filter,
  Plus,
  Send,
  X
} from "lucide-react";
import WalletConnector from "@/components/WalletConnector";

// Import correct contract ABIs
import { ABIS } from "@/lib/abis";

const ASSISTANCE_REGISTRY_ABI = ABIS.AssistanceCenterRegistry;
const EMERGENCY_ALERT_ABI = ABIS.EmergencyAlert;
const COUNSELOR_MARKETPLACE_ABI = ABIS.CounselorMarketplace;

// Mock contract addresses - replace with deployed addresses
const CONTRACT_ADDRESSES = {
  registry: process.env.NEXT_PUBLIC_ASSISTANCE_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000",
  emergency: process.env.NEXT_PUBLIC_EMERGENCY_ALERT_ADDRESS || "0x0000000000000000000000000000000000000000",
  counselor: process.env.NEXT_PUBLIC_COUNSELOR_MARKETPLACE_ADDRESS || "0x0000000000000000000000000000000000000000"
};

interface AssistanceCenter {
  id: number;
  name: string;
  location: string;
  country: string;
  province: string;
  community: string;
  services: string;
  contactInfo: string;
  verified: boolean;
  rating: number;
}

interface Counselor {
  wallet: string;
  name: string;
  specialization: string;
  bio: string;
  languages: string;
  available: boolean;
  verified: boolean;
  rate: number;
  sessionCount: number;
  rating: number;
}

interface EmergencyAlert {
  id: number;
  user: string;
  alertType: string;
  timestamp: number;
  resolved: boolean;
  active: boolean;
  notes: string;
}

export default function SafeHavenPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState<"emergency" | "centers" | "counseling" | "help">("emergency");
  const [emergencyType, setEmergencyType] = useState<string>("");
  const [emergencyNotes, setEmergencyNotes] = useState<string>("");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  // Data States
  const [centers, setCenters] = useState<AssistanceCenter[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  
  // Mock data for demo
  const mockCenters: AssistanceCenter[] = [
    {
      id: 1,
      name: "Women's Safe Haven Center",
      location: "Downtown District",
      country: "South Africa",
      province: "Gauteng",
      community: "Johannesburg",
      services: "Emergency shelter, Legal aid, Counseling, Medical support",
      contactInfo: "24/7 Hotline: 0800 150 150",
      verified: true,
      rating: 4.8
    },
    {
      id: 2,
      name: "Empowerment Resource Center",
      location: "Cape Town Central",
      country: "South Africa", 
      province: "Western Cape",
      community: "Cape Town",
      services: "Skills training, Financial literacy, Job placement, Childcare",
      contactInfo: "Office: 021 555 0123",
      verified: true,
      rating: 4.6
    },
    {
      id: 3,
      name: "Healing Hearts Sanctuary",
      location: "Durban North",
      country: "South Africa",
      province: "KwaZulu-Natal", 
      community: "Durban",
      services: "Trauma counseling, Group therapy, Art therapy, Support groups",
      contactInfo: "Emergency: 031 555 0789",
      verified: true,
      rating: 4.9
    }
  ];

  const mockCounselors: Counselor[] = [
    {
      wallet: "0x1234567890123456789012345678901234567890",
      name: "Dr. Sarah Johnson",
      specialization: "Trauma & PTSD Specialist",
      bio: "Licensed psychologist with 10+ years experience in trauma recovery and women's mental health.",
      languages: "English, Afrikaans, Zulu",
      available: true,
      verified: true,
      rate: 150,
      sessionCount: 247,
      rating: 4.9
    },
    {
      wallet: "0x2345678901234567890123456789012345678901",
      name: "Dr. Nomsa Mbeki", 
      specialization: "Domestic Violence Counselor",
      bio: "Specialized in helping survivors of domestic violence rebuild their lives with dignity and strength.",
      languages: "English, Zulu, Xhosa, Sotho",
      available: true,
      verified: true,
      rate: 120,
      sessionCount: 189,
      rating: 4.8
    },
    {
      wallet: "0x3456789012345678901234567890123456789012",
      name: "Dr. Fatima Al-Rashid",
      specialization: "Anxiety & Depression Specialist", 
      bio: "Helping women overcome anxiety and depression through evidence-based therapeutic approaches.",
      languages: "English, Arabic, French",
      available: true,
      verified: true,
      rate: 135,
      sessionCount: 156,
      rating: 4.7
    }
  ];

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
      
      // Load initial data
      setCenters(mockCenters);
      setCounselors(mockCounselors);
    } catch (e: any) {
      setError(e?.message || "Failed to initialize contracts");
    }
  }, []);

  const handleWalletDisconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setCenters([]);
    setCounselors([]);
    setAlerts([]);
    setError(null);
  }, []);

  const handleEmergencyAlert = async () => {
    if (!signer || !emergencyType) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get user's location (simplified)
      const location = "encrypted_location_data";
      
      // In a real implementation, this would call the smart contract
      // const contract = new ethers.Contract(CONTRACT_ADDRESSES.emergency, EMERGENCY_ALERT_ABI, signer);
      // const tx = await contract.triggerAlert(location, emergencyType, emergencyNotes);
      // await tx.wait();
      
      // For demo, simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert("🚨 Emergency alert sent! Help is on the way. Stay safe!");
      setShowEmergencyModal(false);
      setEmergencyType("");
      setEmergencyNotes("");
    } catch (e: any) {
      setError(e?.message || "Failed to send emergency alert");
    } finally {
      setLoading(false);
    }
  };

  const handleBookCounselor = async (counselor: Counselor, isEmergency: boolean = false) => {
    if (!signer) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would call the smart contract
      const rateInWei = ethers.parseEther((counselor.rate / 1000).toString()); // Convert to ETH equivalent
      
      // For demo, simulate booking
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const sessionType = isEmergency ? "Emergency Session" : "Regular Session";
      alert(`✅ ${sessionType} booked with ${counselor.name}! You'll receive connection details shortly.`);
    } catch (e: any) {
      setError(e?.message || "Failed to book session");
    } finally {
      setLoading(false);
    }
  };

  const emergencyTypes = [
    { value: "domestic_violence", label: "Domestic Violence", icon: Shield, color: "bg-red-500" },
    { value: "harassment", label: "Harassment", icon: AlertTriangle, color: "bg-orange-500" },
    { value: "medical", label: "Medical Emergency", icon: Heart, color: "bg-pink-500" },
    { value: "general", label: "General Safety", icon: Users, color: "bg-purple-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">SafeHaven</h1>
                <p className="text-white/90 font-medium">Your Safety, Our Priority 💜</p>
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
        {/* Emergency Quick Access */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">🚨 Emergency Support</h2>
              <p className="text-white/90">Need immediate help? We're here for you 24/7</p>
            </div>
            <button
              onClick={() => setShowEmergencyModal(true)}
              disabled={!account}
              className="px-8 py-4 bg-white text-red-600 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="w-6 h-6 inline mr-2" />
              SOS ALERT
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-2 mb-8 shadow-lg">
          <div className="flex gap-1">
            <button 
              onClick={() => setActiveTab("emergency")} 
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "emergency" 
                  ? "bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg" 
                  : "text-slate-700 hover:bg-white/50"
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Emergency
            </button>
            <button 
              onClick={() => setActiveTab("centers")} 
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "centers" 
                  ? "bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg" 
                  : "text-slate-700 hover:bg-white/50"
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Safe Centers
            </button>
            <button 
              onClick={() => setActiveTab("counseling")} 
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "counseling" 
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg" 
                  : "text-slate-700 hover:bg-white/50"
              }`}
            >
              <Headphones className="w-4 h-4 inline mr-2" />
              Counseling
            </button>
            <button 
              onClick={() => setActiveTab("help")} 
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "help" 
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg" 
                  : "text-slate-700 hover:bg-white/50"
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Resources
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Emergency Tab */}
        {activeTab === "emergency" && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">🆘 Emergency Support Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emergencyTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <div key={type.value} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <div className={`${type.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 mb-2">{type.label}</h4>
                      <p className="text-slate-600 mb-4">Immediate support for {type.label.toLowerCase()} situations</p>
                      <button
                        onClick={() => {
                          setEmergencyType(type.value);
                          setShowEmergencyModal(true);
                        }}
                        disabled={!account}
                        className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
                      >
                        Get Help Now
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">🛡️ Safety Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Stay Secure</h4>
                  <p className="text-slate-600 text-sm">Keep your location private and only share with trusted contacts</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Emergency Contacts</h4>
                  <p className="text-slate-600 text-sm">Keep important numbers easily accessible</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Support Network</h4>
                  <p className="text-slate-600 text-sm">Build connections with trusted friends and family</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Centers Tab */}
        {activeTab === "centers" && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">🏠 Verified Safe Centers</h3>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by location..."
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {centers.map((center) => (
                  <div key={center.id} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-slate-800">{center.name}</h4>
                          {center.verified && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{center.location}, {center.community}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(center.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="text-sm text-slate-600">({center.rating})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-slate-700 font-medium mb-2">Services:</p>
                      <p className="text-sm text-slate-600">{center.services}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-slate-700 font-medium mb-2">Contact:</p>
                      <p className="text-sm text-slate-600">{center.contactInfo}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Get Directions
                      </button>
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Contact Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Counseling Tab */}
        {activeTab === "counseling" && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">👩‍⚕️ Professional Counselors</h3>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-400" />
                  <select className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option>All Specializations</option>
                    <option>Trauma & PTSD</option>
                    <option>Domestic Violence</option>
                    <option>Anxiety & Depression</option>
                    <option>Family Counseling</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {counselors.map((counselor) => (
                  <div key={counselor.wallet} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-slate-800">{counselor.name}</h4>
                          {counselor.verified && (
                            <UserCheck className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-emerald-600 font-medium text-sm mb-2">{counselor.specialization}</p>
                        <div className="flex items-center gap-2 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(counselor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="text-sm text-slate-600">({counselor.rating}) • {counselor.sessionCount} sessions</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-800">R{counselor.rate}</p>
                        <p className="text-xs text-slate-600">per session</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 mb-2">{counselor.bio}</p>
                      <p className="text-xs text-slate-500"><strong>Languages:</strong> {counselor.languages}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleBookCounselor(counselor)}
                        disabled={loading || !account}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-sm font-medium disabled:opacity-50"
                      >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Book Session
                      </button>
                      <button 
                        onClick={() => handleBookCounselor(counselor, true)}
                        disabled={loading || !account}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium disabled:opacity-50"
                      >
                        <Zap className="w-4 h-4 inline mr-2" />
                        Emergency
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "help" && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">📚 Support Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 text-center">
                  <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-pink-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Self-Care Guide</h4>
                  <p className="text-slate-600 text-sm mb-4">Daily practices for mental and emotional wellbeing</p>
                  <button className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors">
                    Read Guide
                  </button>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Support Groups</h4>
                  <p className="text-slate-600 text-sm mb-4">Connect with others who understand your journey</p>
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
                    Join Group
                  </button>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Crisis Hotlines</h4>
                  <p className="text-slate-600 text-sm mb-4">24/7 support when you need it most</p>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                    View Numbers
                  </button>
                </div>
              </div>
            </div>
            
            {/* Legal Resources */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-8 shadow-lg">
              <h3 className="text-xl font-bold text-slate-800 mb-4">⚖️ Legal Support</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Know Your Rights</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Right to safety and protection</li>
                    <li>• Right to legal representation</li>
                    <li>• Right to confidential support</li>
                    <li>• Right to emergency protection orders</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Legal Aid Contacts</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Legal Aid SA: 0800 110 110</li>
                    <li>• Women's Legal Centre: 021 424 5660</li>
                    <li>• Lawyers for Human Rights: 011 339 1960</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Emergency Alert Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-red-600">🚨 Emergency Alert</h3>
              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Emergency Type *
                </label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select emergency type</option>
                  {emergencyTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Any additional information that might help..."
                />
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  <strong>Your location will be securely encrypted</strong> and only shared with verified helpers in your area.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmergencyAlert}
                  disabled={loading || !emergencyType}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Alert...
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 inline mr-2" />
                      Send Emergency Alert
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
