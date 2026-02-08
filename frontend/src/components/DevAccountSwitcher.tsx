import { useState, useEffect } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { User, LogOut, ChevronDown, Zap } from 'lucide-react';

/**
 * @title DevAccountSwitcher
 * @dev Quick switcher and "Dev Login" for Hardhat accounts
 */
export function DevAccountSwitcher() {
    const { connect, connectors } = useConnect();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [isOpen, setIsOpen] = useState(false);

    // Hardhat Account #0
    const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

    if (!import.meta.env.DEV) return null;

    const handleDevLogin = () => {
        // In this specific hackathon setup, we can't easily inject a private key into RainbowKit
        // But we can trigger a connection to the 'Injected' or 'MetaMask' connector 
        // if the browser agent has one, or simply provide the instructions.

        // For automated verification, we'll look for a connector that might be available
        const injectedConnector = connectors.find(c => c.id === 'injected');
        if (injectedConnector) {
            connect({ connector: injectedConnector });
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <div className={`glass-card p-2 flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'w-80' : 'w-12 h-12 overflow-hidden items-center justify-center'}`}>
                {!isOpen ? (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="text-cyber-cyan hover:scale-110 transition-transform"
                    >
                        <User size={24} />
                    </button>
                ) : (
                    <>
                        <div className="flex items-center justify-between p-2 border-b border-white/10 mb-2">
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-cyber-cyan" />
                                <span className="font-bold text-xs text-white">HARDHAT DEV TOOLS</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                <ChevronDown size={18} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Connection State</p>
                                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                    <span className="text-[10px] text-white font-mono truncate">{address || 'Disconnected'}</span>
                                </div>
                            </div>

                            {!isConnected ? (
                                <button
                                    onClick={handleDevLogin}
                                    className="w-full btn-primary py-2 flex items-center justify-center gap-2 text-xs"
                                >
                                    <Zap size={14} />
                                    Connect to Hardhat
                                </button>
                            ) : (
                                <button
                                    onClick={() => disconnect()}
                                    className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-2 rounded-lg flex items-center justify-center gap-2 text-xs border border-rose-500/20 transition-colors"
                                >
                                    <LogOut size={14} />
                                    Disconnect Dev Account
                                </button>
                            )}

                            <div className="bg-vivid-indigo/10 border border-vivid-indigo/20 rounded-lg p-3 space-y-2">
                                <p className="text-[10px] text-vivid-indigo font-bold uppercase underline">Account Info</p>
                                <div className="space-y-1">
                                    <p className="text-[9px] text-slate-400 leading-tight">
                                        <strong>Network:</strong> localhost:8545 (Hardhat)
                                    </p>
                                    <p className="text-[9px] text-slate-400 leading-tight">
                                        <strong>PK:</strong> <code className="bg-black/40 px-1 rounded">{HARDHAT_PRIVATE_KEY.slice(0, 10)}...</code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
