import { useState } from 'react';
import { Package, Plus, Trash2, Zap, Info } from 'lucide-react';

export function PortfolioManager() {
    const [tokens] = useState([
        { name: 'Loan #0 - CRE', weight: 40, address: '0x123...' },
        { name: 'Loan #1 - Invoice', weight: 30, address: '0x456...' },
        { name: 'USDC', weight: 30, address: '0x789...' },
    ]);

    return (
        <div className="glass-card p-8 bg-gradient-to-br from-vivid-indigo/20 to-obsidian border-vivid-indigo/30">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-vivid-indigo/20 text-vivid-indigo">
                        <Package size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Recursive Portfolio Manager</h2>
                        <p className="text-slate-400 text-sm">Wrap multiple tokens into a single meta-asset.</p>
                    </div>
                </div>
                <button className="btn-secondary py-2 flex items-center gap-2 text-xs font-bold">
                    <Plus size={16} />
                    Add Asset
                </button>
            </div>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>Asset Composition</span>
                        <span>Weight (%)</span>
                    </div>

                    <div className="space-y-3">
                        {tokens.map((token, i) => (
                            <div key={i} className="glass-card bg-white/5 border-white/5 p-4 flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-lg bg-vivid-indigo/10 flex items-center justify-center font-bold text-vivid-indigo">
                                    {token.name[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-white">{token.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">{token.address}</p>
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        value={token.weight}
                                        className="w-full bg-transparent border-b border-white/10 text-right font-mono font-bold text-cyber-cyan focus:outline-none focus:border-cyber-cyan"
                                    />
                                </div>
                                <button className="p-2 text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-xl bg-vivid-indigo/5 border border-vivid-indigo/10 flex items-start gap-3">
                        <Info size={16} className="text-vivid-indigo mt-0.5" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Meta-tokens are recursive. You can wrap existing Portfolio Tokens into new ones,
                            enabling complex nested financial structures.
                        </p>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="glass-card p-6 border-white/10">
                        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Portfolio Preview</h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portfolio Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Meta-Growth Fund"
                                    className="w-full glass-card bg-white/5 border-white/10 px-4 py-3 text-white focus:neon-border outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Symbol</label>
                                <input
                                    type="text"
                                    placeholder="e.g. MGF"
                                    className="w-full glass-card bg-white/5 border-white/10 px-4 py-3 text-white focus:neon-border outline-none font-mono"
                                />
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between mb-4">
                                    <span className="text-slate-400 text-sm italic">Total Weight</span>
                                    <span className="text-emerald-400 font-bold font-mono">100.00%</span>
                                </div>
                                <button className="btn-primary w-full py-4 flex items-center justify-center gap-2 font-bold group">
                                    <Zap size={18} className="group-hover:animate-bounce" />
                                    Mint Meta-Token
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
