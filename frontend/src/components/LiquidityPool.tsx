import { useState } from 'react';
import { Droplets, Plus, Minus, Info, BarChart3 } from 'lucide-react';

export function LiquidityPool() {
    const [amount, setAmount] = useState('500');

    return (
        <div className="glass-card p-8 bg-gradient-to-br from-cyber-cyan/10 to-obsidian border-cyber-cyan/20">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-cyber-cyan/20 text-cyber-cyan">
                    <Droplets size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Liquidity Pools</h2>
                    <p className="text-slate-400 text-sm">Provide liquidity to earn yields on loan token trading fees.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex gap-2">
                        <TabButton active label="Add Liquidity" icon={<Plus size={16} />} />
                        <TabButton label="Remove" icon={<Minus size={16} />} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Token Pair</label>
                        <div className="flex items-center gap-3 glass-card bg-white/5 border-white/10 p-4">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-cyber-cyan/20 border-2 border-obsidian flex items-center justify-center text-[10px] font-bold text-cyber-cyan">L</div>
                                <div className="w-8 h-8 rounded-full bg-vivid-indigo/20 border-2 border-obsidian flex items-center justify-center text-[10px] font-bold text-vivid-indigo">U</div>
                            </div>
                            <span className="text-white font-bold ml-2">LOAN#0 / USDC</span>
                            <span className="ml-auto text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">0.3% Fee Rank</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between px-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount to Stake</label>
                            <span className="text-[10px] text-slate-400 font-mono">BAL: 1,240.20 USDC</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full glass-card bg-white/5 border-white/10 px-4 py-4 text-white focus:neon-border outline-none font-mono text-xl"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-cyber-cyan font-bold text-xs hover:underline decoration-cyber-cyan/30">MAX</button>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/10 flex items-start gap-3">
                        <Info size={16} className="text-cyber-cyan mt-0.5" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            By providing liquidity, you receive <strong>LP Tokens</strong> representing your share of the pool.
                            Yield is auto-compounded from trading volume on the Yellow Network.
                        </p>
                    </div>

                    <button className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg font-bold">
                        Fuel the Pool
                        <Droplets size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 border-white/5 bg-white/5">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <BarChart3 size={18} className="text-cyber-cyan" />
                            Pool Statistics
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <PoolStat label="Total TVL" value="$1.2M" />
                            <PoolStat label="Volume (24h)" value="$84.5K" />
                            <PoolStat label="LP APR" value="18.4%" highlight />
                            <PoolStat label="My Stake" value="$420.00" />
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-4">LP Rewards Accrued</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-white font-mono">$12.45</p>
                                    <p className="text-xs text-emerald-400">+2.1% since yesterday</p>
                                </div>
                                <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                                    Claim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ label, icon, active = false }: any) {
    return (
        <button className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${active ? 'bg-cyber-cyan text-obsidian border-cyber-cyan shadow-[0_0_10px_rgba(0,242,255,0.3)]' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
            }`}>
            {icon}
            {label}
        </button>
    );
}

function PoolStat({ label, value, highlight = false }: any) {
    return (
        <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{label}</p>
            <p className={`text-xl font-bold font-mono ${highlight ? 'text-cyber-cyan' : 'text-white'}`}>{value}</p>
        </div>
    );
}
