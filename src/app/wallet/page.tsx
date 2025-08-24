"use client";

import { useEffect, useState } from "react";

export default function WalletNiceUI() {
  const [mounted, setMounted] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined" || !(window as any).ethereum) return;

    (window as any).ethereum.request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length > 0) setAccount(accounts[0]);
      })
      .catch(() => {});

    (window as any).ethereum.request({ method: "eth_chainId" })
      .then((id: string) => setChainId(id))
      .catch(() => {});

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] || null);
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(newChainId);
    };

    (window as any).ethereum.on?.("accountsChanged", handleAccountsChanged);
    (window as any).ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      (window as any).ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      (window as any).ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  async function connectMetaMask() {
    setError(null);
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("MetaMask not installed. Install the extension.");
      return;
    }

    try {
      setConnecting(true);
      const accounts: string[] = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts?.[0] || null);
      const id: string = await (window as any).ethereum.request({ method: "eth_chainId" });
      setChainId(id);
    } catch (e: any) {
      setError(e?.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  }

  function disconnect() {
    setAccount(null);
    setError(null);
  }

  if (!mounted) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="animate-pulse text-gray-500">Loading wallet...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Connect Your Wallet
          </h1>
          <p className="mt-2 text-gray-600">Securely connect with MetaMask to continue.</p>
        </div>

        <div className="bg-white/80 backdrop-blur border border-purple-100 shadow-xl rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-wider text-gray-500">Status</div>
              <div className="mt-1 inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${account ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="font-medium text-gray-800">{account ? "Connected" : "Disconnected"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {account ? (
                <button
                  onClick={disconnect}
                  className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold shadow hover:shadow-md hover:bg-red-700 transition"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={connectMetaMask}
                  disabled={connecting}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:shadow-md disabled:opacity-50 transition"
                >
                  {connecting ? "Connecting..." : "Connect MetaMask"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="text-xs uppercase tracking-wide text-gray-500">Account</div>
              <div className="mt-1 font-mono text-sm text-gray-800 break-all">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="text-xs uppercase tracking-wide text-gray-500">Network (Chain ID)</div>
              <div className="mt-1 font-mono text-sm text-gray-800">
                {chainId ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700">{chainId}</span>
                    <span className="text-gray-400">/</span>
                    <span className="px-2 py-0.5 rounded bg-pink-50 text-pink-700">{parseInt(chainId, 16)}</span>
                  </span>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <div className="font-semibold">Error</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          )}

          <div className="mt-8 text-xs text-gray-500">
            <ul className="list-disc list-inside space-y-1">
              <li>We use MetaMask's injected provider (window.ethereum).</li>
              <li>Handles account and network changes in real-time.</li>
              <li>No external wallet SDKs; CSP-friendly.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
