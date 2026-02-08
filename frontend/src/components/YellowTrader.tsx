import { useState } from 'react';
import { useYellowNetwork } from '../hooks/useYellowNetwork';
import { parseEther, parseUnits } from 'viem';
import { ArrowLeftRight, Zap, TrendingUp, TrendingDown } from 'lucide-react';

export function YellowTrader({ loanToken = "0x..." }: { loanToken?: string }) {
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const { placeOrder, activeSession, startSession } = useYellowNetwork();

    const handleLimitOrder = async (side: 'buy' | 'sell') => {
        if (!amount || !price) return;

        await placeOrder({
            type: 'limit',
            token: loanToken,
            amount: parseEther(amount),
            price: parseUnits(price, 6),
            side
        });

        setAmount('');
        setPrice('');
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyber-cyan/10 blur-[100px] pointer-events-none"></div>

            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ArrowLeftRight className="text-cyber-cyan" size={20} />
                    Gas-Free Trading
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-full">
                    <Zap size={14} className="text-cyber-cyan animate-pulse" />
                    <span className="text-[10px] font-bold text-cyber-cyan uppercase tracking-wider">Yellow Network ACTIVE</span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-400">Order Amount</label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="0.00"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border transition-all"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">LTK</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-400">Price per Token (USDC)</label>
                    <input
                        type="number"
                        placeholder="1.00"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border transition-all"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>

                {!activeSession ? (
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
                            <p className="text-yellow-200 text-sm mb-3">
                                To trade gas-free on Yellow Network, you must first start a session and deposit collateral.
                            </p>
                            <button
                                onClick={() => startSession("", "1000")} // Empty string triggers default USDC usage in hook
                                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-obsidian font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                            >
                                <Zap size={18} />
                                Start Trading Session (1000 USDC)
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <button
                            onClick={() => handleLimitOrder('buy')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl transition-all active:scale-95 group"
                        >
                            <TrendingUp size={18} className="group-hover:-translate-y-1 transition-transform" />
                            Buy LTK
                        </button>
                        <button
                            onClick={() => handleLimitOrder('sell')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-xl transition-all active:scale-95 group"
                        >
                            <TrendingDown size={18} className="group-hover:translate-y-1 transition-transform" />
                            Sell LTK
                        </button>
                    </div>
                )}
            </div>

            {activeSession && (
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Trading Session</span>
                        <span className="text-xs font-mono text-cyan-200">{activeSession.id.slice(0, 16)}...</span>
                    </div>
                    <button className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider underline underline-offset-4">
                        End Session & Settle
                    </button>
                </div>
            )}
        </div>
    );
}
