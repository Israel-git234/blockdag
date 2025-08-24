"use client";

import React, { useCallback, useState } from "react";
import { ethers } from "ethers";
import { Wallet, Smartphone, Monitor, Loader2, CheckCircle, XCircle, Zap } from "lucide-react";
import WalletConnectProvider from "@walletconnect/web3-provider";

interface WalletConnectorProps {
  onConnect: (provider: ethers.BrowserProvider, signer: ethers.Signer, account: string) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  account: string | null;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({
  onConnect,
  onDisconnect,
  isConnected,
  account
}) => {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<"walletconnect" | "injected" | "metamask" | null>(null);

  const CHAIN = {
    chainIdHex: "0x413",
    chainId: 1043,
    name: "BlockDAG Primordial Testnet",
    rpcUrls: ["https://rpc.primordial.bdagscan.com"],
    explorers: ["https://primordial.bdagscan.com"],
    nativeCurrency: { name: "BDAG", symbol: "BDAG", decimals: 18 }
  };

  const ensureBlockDAGNetwork = useCallback(async (provider: any) => {
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN.chainIdHex }] });
    } catch (switchError: any) {
      if (switchError?.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: CHAIN.chainIdHex,
            chainName: CHAIN.name,
            nativeCurrency: CHAIN.nativeCurrency,
            rpcUrls: CHAIN.rpcUrls,
            blockExplorerUrls: CHAIN.explorers
          }]
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const connectInjectedWallet = useCallback(async () => {
    setConnecting(true);
    setError(null);
    setWalletType("injected");

    try {
      let provider: any = null;
      if (typeof window !== "undefined") {
        if ((window as any).ethereum) provider = (window as any).ethereum;
        else if ((window as any).web3?.currentProvider) provider = (window as any).web3.currentProvider;
      }
      if (!provider) throw new Error("No wallet detected. Please install MetaMask or another Web3 wallet.");

      await ensureBlockDAGNetwork(provider);
      const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      if (!account) throw new Error("No accounts found");

      const browserProvider = new ethers.BrowserProvider(provider);
      const signer = await browserProvider.getSigner();
      onConnect(browserProvider, signer, account);
    } catch (e: any) {
      setError(e?.message || "Wallet connection failed");
      setWalletType(null);
    } finally {
      setConnecting(false);
    }
  }, [ensureBlockDAGNetwork, onConnect]);

  const connectMetaMask = useCallback(async () => {
    setConnecting(true);
    setError(null);
    setWalletType("metamask");
    try {
      if (typeof window === "undefined" || !(window as any).ethereum?.isMetaMask) {
        throw new Error("MetaMask not detected");
      }
      const eth = (window as any).ethereum;
      await ensureBlockDAGNetwork(eth);
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      if (!account) throw new Error("No accounts found");
      const browserProvider = new ethers.BrowserProvider(eth);
      const signer = await browserProvider.getSigner();
      onConnect(browserProvider, signer, account);
    } catch (e: any) {
      setError(e?.message || "MetaMask connection failed");
      setWalletType(null);
    } finally {
      setConnecting(false);
    }
  }, [ensureBlockDAGNetwork, onConnect]);

  const connectWalletConnect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    setWalletType("walletconnect");
    try {
      const provider = new WalletConnectProvider({
        rpc: { [CHAIN.chainId]: CHAIN.rpcUrls[0] },
        chainId: CHAIN.chainId,
        qrcode: true,
        pollingInterval: 15000,
      });
      await provider.enable();
      const browserProvider = new ethers.BrowserProvider(provider as any);
      const signer = await browserProvider.getSigner();
      const accounts = await browserProvider.listAccounts();
      const account = accounts[0]?.address;
      if (!account) throw new Error("No accounts found via WalletConnect");
      onConnect(browserProvider, signer, account);
    } catch (e: any) {
      setError(e?.message || "WalletConnect connection failed");
      setWalletType(null);
    } finally {
      setConnecting(false);
    }
  }, [onConnect]);

  const disconnect = useCallback(() => {
    setWalletType(null);
    setError(null);
    onDisconnect();
  }, [onDisconnect]);

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
          <Wallet className="w-5 h-5" />
          <span className="text-sm font-medium text-slate-700">{account.slice(0, 6)}...{account.slice(-4)}</span>
        </div>
        <div className="bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-xs font-medium text-green-700">Connected</span>
        </div>
        <button onClick={disconnect} className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <button onClick={connectInjectedWallet} disabled={connecting} className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {connecting && walletType === "injected" ? (<><Loader2 className="w-4 h-4 animate-spin" />Connecting...</>) : (<><Zap className="w-4 h-4" />Connect Browser Wallet</>)}
        </button>

        <button onClick={connectMetaMask} disabled={connecting} className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {connecting && walletType === "metamask" ? (<><Loader2 className="w-4 h-4 animate-spin" />Connecting...</>) : (<><Monitor className="w-4 h-4" />MetaMask</>)}
        </button>

        <button onClick={connectWalletConnect} disabled={connecting} className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {connecting && walletType === "walletconnect" ? (<><Loader2 className="w-4 h-4 animate-spin" />Connecting...</>) : (<><Smartphone className="w-4 h-4" />WalletConnect</>)}
        </button>
      </div>

      <div className="text-xs text-slate-500 text-center">Choose your preferred wallet to connect</div>
    </div>
  );
};

export default WalletConnector;
