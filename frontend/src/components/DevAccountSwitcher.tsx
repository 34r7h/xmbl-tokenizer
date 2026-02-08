import { useState } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { User, LogOut, ChevronDown } from 'lucide-react';

/**
 * @title DevAccountSwitcher
 * @dev Quick switcher for Hardhat accounts during development
 */
export function DevAccountSwitcher() {
    useConnect();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [isOpen, setIsOpen] = useState(false);

    // In a real hackathon dev environment, we'd maybe auto-detect or have a static list
    // For now, we'll let RainbowKit handle the actual connection, 
    // but this UI helps remind the dev which account type they are using.

    if (!import.meta.env.DEV) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <div className={`glass-card p-2 flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'w-64' : 'w-12 h-12 overflow-hidden'}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-cyber-cyan"
                >
                    <User size={20} />
                    {isOpen && <span className="ml-2 font-bold text-xs">DEV TOOLS</span>}
                    {isOpen && <ChevronDown size={16} className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                </button>

                {isOpen && (
                    <div className="p-4 flex flex-col gap-4 border-t border-white/10 mt-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Current Status</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                <span className="text-xs text-white truncate font-mono">{address || 'Disconnected'}</span>
                            </div>
                        </div>

                        {isConnected && (
                            <button
                                onClick={() => disconnect()}
                                className="btn-secondary py-2 flex items-center justify-center gap-2 text-rose-400 hover:text-rose-300"
                            >
                                <LogOut size={14} />
                                Disconnect
                            </button>
                        )}

                        <div className="bg-vivid-indigo/10 border border-vivid-indigo/20 rounded-lg p-3">
                            <p className="text-[10px] text-vivid-indigo font-bold uppercase mb-1 underline">Dev Note</p>
                            <p className="text-[10px] text-slate-400 leading-tight">
                                Use MetaMask or Coinbase Wallet to connect to <strong>localhost:8545</strong>.
                                Import Hardhat Private Keys for full E2E testing.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
