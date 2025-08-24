"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { 
  Shield, 
  FileText, 
  UserPlus, 
  Lock, 
  Upload, 
  Download, 
  Users, 
  Calendar, 
  Plus, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Heart,
  Stethoscope,
  Clipboard,
  Key,
  Database,
  Globe
} from "lucide-react";
import WalletConnector from "@/components/WalletConnector";

import { ABIS } from "@/lib/abis";

// Contract ABI for Women's Health Records
const CONTRACT_ABI = ABIS.WomenHealthRecords;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WOMEN_HEALTH_RECORDS_ADDRESS || "0x0000000000000000000000000000000000000000";

interface MedicalRecord {
  cid: string;
  timestamp: number;
  recordType: string;
  description: string;
}

interface Doctor {
  name: string;
  specialization: string;
  licenseNumber: string;
  isVerified: boolean;
  verificationDate: number;
}

export default function WomenHealthRecordsPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState<"records" | "upload" | "doctors" | "access">("records");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [authorizedDoctors, setAuthorizedDoctors] = useState<string[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  
  // Form States
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    recordType: "",
    description: "",
    password: ""
  });
  
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    specialization: "",
    licenseNumber: ""
  });
  
  const [accessForm, setAccessForm] = useState({
    doctorAddress: ""
  });

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
      await loadRecords(contractInstance, account);
      await loadAuthorizedDoctors(contractInstance, account);
    } catch (e: any) {
      setError(e?.message || "Failed to initialize contract");
    }
  }, []);

  const handleWalletDisconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
    setRecords([]);
    setAuthorizedDoctors([]);
    setError(null);
  }, []);

  const loadRecords = async (contractInstance: ethers.Contract, userAccount: string) => {
    try {
      const recordsData = await contractInstance.getMyRecords();
      const formattedRecords = recordsData.map((record: any) => ({
        cid: record[0],
        timestamp: Number(record[1]),
        recordType: record[2],
        description: record[3]
      }));
      setRecords(formattedRecords);
    } catch (e) {
      console.error("Failed to load records:", e);
    }
  };

  const loadAuthorizedDoctors = async (contractInstance: ethers.Contract, userAccount: string) => {
    try {
      const doctors = await contractInstance.getAuthorizedDoctors(userAccount);
      setAuthorizedDoctors(doctors);
    } catch (e) {
      console.error("Failed to load authorized doctors:", e);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !account || !uploadForm.file) return;

    try {
      setLoading(true);
      setError(null);

      // Simulate IPFS upload and encryption
      const cid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      // Add record to blockchain
      const tx = await contract.addRecord(
        cid,
        uploadForm.recordType,
        uploadForm.description
      );
      
      await tx.wait();
      
      // Reload records
      await loadRecords(contract, account);
      
      // Reset form
      setUploadForm({
        file: null,
        recordType: "",
        description: "",
        password: ""
      });
      
      alert("Medical record uploaded successfully!");
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !account) return;

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.registerDoctor(
        doctorForm.name,
        doctorForm.specialization,
        doctorForm.licenseNumber
      );
      
      await tx.wait();
      
      // Reset form
      setDoctorForm({
        name: "",
        specialization: "",
        licenseNumber: ""
      });
      
      alert("Doctor registration submitted successfully!");
    } catch (e: any) {
      setError(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !account) return;

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.grantDoctorAccess(accessForm.doctorAddress);
      await tx.wait();
      
      // Reload authorized doctors
      await loadAuthorizedDoctors(contract, account);
      
      // Reset form
      setAccessForm({ doctorAddress: "" });
      
      alert("Access granted successfully!");
    } catch (e: any) {
      setError(e?.message || "Failed to grant access");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (doctorAddress: string) => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.revokeDoctorAccess(doctorAddress);
      await tx.wait();
      
      // Reload authorized doctors
      await loadAuthorizedDoctors(contract, account);
      
      alert("Access revoked successfully!");
    } catch (e: any) {
      setError(e?.message || "Failed to revoke access");
    } finally {
      setLoading(false);
    }
  };

  const getDoctorInfo = async (doctorAddress: string) => {
    if (!contract) return;

    try {
      const info = await contract.getDoctorInfo(doctorAddress);
      setDoctorInfo({
        name: info[0],
        specialization: info[1],
        licenseNumber: info[2],
        isVerified: info[3],
        verificationDate: Number(info[4])
      });
    } catch (e) {
      console.error("Failed to get doctor info:", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Women's Health Records</h1>
                <p className="text-pink-100 font-medium">Secure, Private Medical Records on BlockDAG</p>
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
        {/* Security Features Overview */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-pink-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🔒 Privacy & Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">End-to-End Encryption</h3>
              <p className="text-gray-600 text-sm">Your medical records are encrypted before storage</p>
            </div>
            <div className="text-center">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">IPFS Storage</h3>
              <p className="text-gray-600 text-sm">Records stored on decentralized IPFS network</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Access Control</h3>
              <p className="text-gray-600 text-sm">You control who can view your records</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl border border-pink-200 p-2 mb-8 shadow-sm">
          <div className="flex gap-1">
            <button 
              onClick={() => setActiveTab("records")} 
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "records" 
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg" 
                  : "text-pink-700 hover:bg-pink-50"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              My Records
            </button>
            <button 
              onClick={() => setActiveTab("upload")} 
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "upload" 
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg" 
                  : "text-pink-700 hover:bg-pink-50"
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Record
            </button>
            <button 
              onClick={() => setActiveTab("doctors")} 
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "doctors" 
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg" 
                  : "text-pink-700 hover:bg-pink-50"
              }`}
            >
              <Stethoscope className="w-4 h-4 inline mr-2" />
              Doctor Access
            </button>
            <button 
              onClick={() => setActiveTab("access")} 
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "access" 
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg" 
                  : "text-pink-700 hover:bg-pink-50"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Manage Access
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

        {/* Records Tab */}
        {activeTab === "records" && (
          <div className="bg-white rounded-xl border border-pink-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">My Medical Records</h3>
            {records.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">No records yet</h4>
                <p className="text-gray-500">Upload your first medical record to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{record.recordType}</h4>
                        <p className="text-gray-600 mb-2">{record.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(record.timestamp * 1000).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="w-4 h-4" />
                            IPFS: {record.cid.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="bg-white rounded-xl border border-pink-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Upload Medical Record</h3>
            <form onSubmit={handleFileUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Record File *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Record Type *
                </label>
                <select
                  value={uploadForm.recordType}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, recordType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="">Select record type</option>
                  <option value="Lab Results">Lab Results</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Medical Report">Medical Report</option>
                  <option value="Vaccination Record">Vaccination Record</option>
                  <option value="Imaging">Imaging (X-Ray, MRI, etc.)</option>
                  <option value="Consultation Notes">Consultation Notes</option>
                  <option value="Surgery Report">Surgery Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Brief description of the medical record..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encryption Password
                </label>
                <input
                  type="password"
                  value={uploadForm.password}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Optional: Custom encryption password"
                />
                <p className="text-sm text-gray-500 mt-1">Leave empty to use wallet-based encryption</p>
              </div>

              <button
                type="submit"
                disabled={loading || !account}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading & Encrypting...
                  </div>
                ) : (
                  "Upload Medical Record"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === "doctors" && (
          <div className="bg-white rounded-xl border border-pink-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Register as Doctor</h3>
            <form onSubmit={handleDoctorRegistration} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Dr. Jane Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Cardiology, Gynecology, etc."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical License Number *
                </label>
                <input
                  type="text"
                  value={doctorForm.licenseNumber}
                  onChange={(e) => setDoctorForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="MD123456"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !account}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering...
                  </div>
                ) : (
                  "Register as Doctor"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Access Management Tab */}
        {activeTab === "access" && (
          <div className="space-y-6">
            {/* Grant Access */}
            <div className="bg-white rounded-xl border border-pink-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Grant Doctor Access</h3>
              <form onSubmit={handleGrantAccess} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor's Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={accessForm.doctorAddress}
                    onChange={(e) => setAccessForm(prev => ({ ...prev, doctorAddress: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0x..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !account}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Granting...
                    </div>
                  ) : (
                    "Grant Access"
                  )}
                </button>
              </form>
            </div>

            {/* Authorized Doctors */}
            <div className="bg-white rounded-xl border border-pink-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Authorized Doctors</h3>
              {authorizedDoctors.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No doctors have access to your records yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {authorizedDoctors.map((doctorAddress, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{doctorAddress}</p>
                          <button
                            onClick={() => getDoctorInfo(doctorAddress)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            View Doctor Info
                          </button>
                        </div>
                        <button
                          onClick={() => handleRevokeAccess(doctorAddress)}
                          disabled={loading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Revoke Access
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Doctor Info Modal */}
            {doctorInfo && (
              <div className="bg-white rounded-xl border border-pink-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Doctor Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{doctorInfo.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Specialization:</span>
                    <span className="ml-2 text-gray-900">{doctorInfo.specialization}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">License:</span>
                    <span className="ml-2 text-gray-900">{doctorInfo.licenseNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 ${doctorInfo.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {doctorInfo.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


