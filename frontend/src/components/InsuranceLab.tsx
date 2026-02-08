import { useState } from 'react';
import { ShieldCheck, Calendar, DollarSign, ArrowRight } from 'lucide-react';

export function InsuranceLab() {
    const [coverage, setCoverage] = useState('10000');

    return (
        <div className="glass-card p-8 bg-gradient-to-br from-emerald-500/10 to-obsidian border-emerald-500/20">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Insurance Lab & CDS</h2>
                    <p className="text-slate-400 text-sm">Hedge your RWA positions with Credit Default Swaps.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Loan Position</label>
                        <select
                            className="w-full glass-card bg-white/5 border-white/10 px-4 py-3 text-white focus:neon-border outline-none appearance-none"
                            defaultValue="Loan #0 - Commercial Real Estate ($100,000)"
                        >
                            <option>Loan #0 - Commercial Real Estate ($100,000)</option>
                            <option>Loan #1 - Asset-Backed Invoice ($25,000)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Coverage Amount (USDC)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="number"
                                value={coverage}
                                onChange={(e) => setCoverage(e.target.value)}
                                className="w-full glass-card bg-white/5 border-white/10 pl-12 pr-4 py-3 text-white focus:neon-border outline-none font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="glass-card bg-white/5 border-white/5 p-4">
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Estimated Premium</p>
                            <p className="text-xl font-bold text-cyber-cyan font-mono">1.5% APY</p>
                        </div>
                        <div className="glass-card bg-white/5 border-white/5 p-4">
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Term</p>
                            <p className="text-xl font-bold text-white flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                90 Days
                            </p>
                        </div>
                    </div>

                    <button className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg font-bold shadow-[0_0_20px_rgba(0,242,255,0.3)]">
                        Establish Protection
                        <ArrowRight size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Active Protection Policies</h3>
                    <div className="flex flex-col gap-4">
                        <PolicyCard
                            id="POL-RX32"
                            target="Loan #0"
                            coverage="$50,000"
                            status="Active"
                            expiry="Expires in 42 days"
                        />
                        <div className="p-8 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-center italic">
                            <p className="text-xs">No other active policies found.</p>
                            <p className="text-[10px] mt-1">Insure more positions to mitigate risk.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PolicyCard({ id, target, coverage, status, expiry }: any) {
    return (
        <div className="glass-card p-4 border-l-4 border-l-emerald-400 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{id}</span>
                    <h4 className="font-bold text-white underline decoration-white/10">{target} Protection</h4>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-[10px] font-bold">
                    {status}
                </div>
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs text-slate-400">{expiry}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Coverage</p>
                    <p className="text-lg font-bold text-white font-mono">{coverage}</p>
                </div>
            </div>
        </div>
    );
}
