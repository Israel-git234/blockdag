"use client";

import { useEffect } from 'react';

export default function SimpleTest() {
  useEffect(() => {
    // Add the JavaScript function to the window object
    (window as any).connectMetaMask = async function() {
      if ((window as any).ethereum) {
        try {
          // Request account access
          const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          console.log("Connected accounts:", accounts);
          
          // Update UI
          const statusDiv = document.getElementById('status');
          if (statusDiv) {
            statusDiv.innerHTML = `✅ Connected: ${accounts[0]}`;
            statusDiv.className = 'text-green-600 font-semibold';
          }

          // Listen for account changes
          (window as any).ethereum.on('accountsChanged', (newAccounts: string[]) => {
            console.log("Accounts changed:", newAccounts);
            const statusDiv = document.getElementById('status');
            if (statusDiv) {
              if (newAccounts.length > 0) {
                statusDiv.innerHTML = `✅ Connected: ${newAccounts[0]}`;
                statusDiv.className = 'text-green-600 font-semibold';
              } else {
                statusDiv.innerHTML = '❌ Disconnected';
                statusDiv.className = 'text-red-600 font-semibold';
              }
            }
          });

          // Listen for network changes
          (window as any).ethereum.on('chainChanged', (chainId: string) => {
            console.log("Network changed to:", chainId);
            const chainDiv = document.getElementById('chain');
            if (chainDiv) {
              chainDiv.innerHTML = `Chain ID: ${chainId} (${parseInt(chainId, 16)})`;
            }
          });

        } catch (error) {
          console.error("User rejected the request or an error occurred:", error);
          const statusDiv = document.getElementById('status');
          if (statusDiv) {
            statusDiv.innerHTML = `❌ Error: ${(error as any).message || 'Connection failed'}`;
            statusDiv.className = 'text-red-600 font-semibold';
          }
        }
      } else {
        console.log("MetaMask is not installed!");
        alert("Please install MetaMask to use this DApp.");
        const statusDiv = document.getElementById('status');
        if (statusDiv) {
          statusDiv.innerHTML = '❌ MetaMask not installed';
          statusDiv.className = 'text-red-600 font-semibold';
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Simple MetaMask Test</h1>
        
        <button 
          onClick={() => (window as any).connectMetaMask()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
        
        <div className="mt-6 space-y-2">
          <div id="status" className="text-gray-600">Click "Connect Wallet" to start</div>
          <div id="chain" className="text-sm text-gray-500"></div>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <p>This uses the exact JavaScript code you provided:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>window.ethereum.request()</li>
            <li>eth_requestAccounts method</li>
            <li>accountsChanged event listener</li>
            <li>chainChanged event listener</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
