import { motion } from 'framer-motion';
import { Cpu, Zap, Pause, Play, Settings2 } from 'lucide-react';

const STRATEGIES = [
    { id: 1, name: 'Meta-Yield Rebalancer', type: 'Recursive', profit: '+$1,240', status: 'Active', load: 12 },
    { id: 2, name: 'Hedge-Bot Alpha', type: 'Delta Neutral', profit: '-$42', status: 'Sensing', load: 8 },
    { id: 3, name: 'LI.FI Arbitrageur', type: 'Cross-Chain', profit: '+$892', status: 'Active', load: 24 },
];

export function ActiveStrategies() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Live Strategies</h3>
                <Settings2 size={16} className="text-slate-600 hover:text-white cursor-pointer transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STRATEGIES.map((strat, i) => (
                    <motion.div
                        key={strat.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-5 relative group border-white/5 hover:border-vivid-indigo/30 transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${strat.id === 2 ? 'bg-amber-500/10 text-amber-400' : 'bg-vivid-indigo/10 text-vivid-indigo'}`}>
                                <Cpu size={20} />
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                <div className={`w-1.5 h-1.5 rounded-full ${strat.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{strat.status}</span>
                            </div>
                        </div>

                        <h4 className="font-bold text-white mb-1">{strat.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mb-4">{strat.type}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 uppercase font-bold">Net Yield</span>
                                <span className={`text-sm font-bold ${strat.profit.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {strat.profit}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 transition-all">
                                    {strat.status === 'Active' ? <Pause size={14} /> : <Play size={14} />}
                                </button>
                                <button className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 transition-all">
                                    <Zap size={14} className="text-cyber-cyan" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
