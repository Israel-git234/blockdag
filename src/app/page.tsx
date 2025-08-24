"use client";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Building2, Users, Shield, TrendingUp, ArrowRight, Star, CheckCircle, Play, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 py-24 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-300/20 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-sm w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30">
            <Building2 className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            EmpowerHer
            <span className="block text-4xl md:text-5xl text-yellow-200 font-light mt-2 bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-white mb-10 max-w-4xl mx-auto leading-relaxed">
            Building skills, knowledge, and financial independence for women through 
            <span className="text-yellow-200 font-semibold"> blockchain technology</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/features/feature-a"
              className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"
            >
              <Play className="w-6 h-6" />
              Start Learning
            </Link>
            <Link
              href="/features/feature-b"
              className="px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/30 transition-all duration-300"
            >
              Join Financial Circles
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">✨ Platform Features</h2>
            <p className="text-xl text-slate-600">Everything you need for learning, growth, and financial empowerment</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-rose-400 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Play className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Video Learning</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Access professional video content, courses, and tutorials from expert women creators.</p>
              <Link href="/features/feature-a" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-semibold group-hover:gap-3 transition-all duration-300">
                Start Learning →
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-purple-400 to-indigo-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Financial Circles</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Join professional savings circles and build wealth together with like-minded individuals.</p>
              <Link href="/features/feature-b" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold group-hover:gap-3 transition-all duration-300">
                Join Circles →
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Health Records</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Secure, private medical records stored on blockchain with end-to-end encryption and access control.</p>
              <Link href="/features/feature-d" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold group-hover:gap-3 transition-all duration-300">
                Manage Records →
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 py-20 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">🌟 Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of women building skills, knowledge, and financial independence
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/features/feature-a"
              className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"
            >
              <Play className="w-6 h-6" />
              Start Learning
            </Link>
            <Link
              href="/features/feature-b"
              className="px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/30 transition-all duration-300"
            >
              Join Financial Circles
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Links */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">🚀 Explore All Features</h2>
            <p className="text-xl text-slate-600">Discover everything the EmpowerHer platform has to offer</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/features/feature-a" className="group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group-hover:border-rose-300">
                <div className="bg-gradient-to-br from-rose-400 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Play className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Video Learning</h3>
                <p className="text-sm text-slate-600">Professional content & courses</p>
              </div>
            </Link>

            <Link href="/features/feature-b" className="group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group-hover:border-purple-300">
                <div className="bg-gradient-to-br from-purple-400 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Financial Circles</h3>
                <p className="text-sm text-slate-600">Savings & investment groups</p>
              </div>
            </Link>

            <Link href="/features/feature-d" className="group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group-hover:border-emerald-300">
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Health Records</h3>
                <p className="text-sm text-slate-600">Secure medical records</p>
              </div>
            </Link>

            <Link href="/features/feature-e" className="group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group-hover:border-red-300">
                <div className="bg-gradient-to-br from-red-400 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">SafeHaven</h3>
                <p className="text-sm text-slate-600">Emergency safety support</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">EmpowerHer</h3>
                  <p className="text-sm text-slate-400">Professional Platform</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Empowering women through video learning, professional development, and financial tools.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/features/feature-a" className="hover:text-white transition-colors">Video Learning</Link></li>
                <li><Link href="/features/feature-b" className="hover:text-white transition-colors">Financial Circles</Link></li>
                <li><Link href="/features/feature-a" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/features/feature-d" className="hover:text-white transition-colors">Coming Soon</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 EmpowerHer Platform. All rights reserved. Built on BlockDAG network.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
