"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, Shield, TrendingUp, Play } from "lucide-react";

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Building2,
      description: "Platform Overview"
    },
    {
      name: "EmpowerHer App",
      href: "/features/feature-a",
      icon: Play,
      description: "Video Content & Learning"
    },
    {
      name: "Financial Circles",
      href: "/features/feature-b",
      icon: Users,
      description: "Savings & Investment Groups"
    },
    {
      name: "Health Records",
      href: "/features/feature-d",
      icon: Shield,
      description: "Secure Medical Records"
    },
    {
      name: "SafeHaven",
      href: "/features/feature-e",
      icon: Shield,
      description: "Emergency Safety Support"
    }
  ];

  return (
    <nav className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 border-b border-rose-400 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-white/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EmpowerHer</h1>
              <p className="text-xs text-white/80">Professional Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                                    className={`group relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/30" 
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-rose-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {item.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-rose-600"></div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
