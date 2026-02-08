import { YellowTrader } from '../components/YellowTrader';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Activity, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export function Trading() {
    return (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[800px]">
            {/* ORDER BOOK (Left) */}
            <div className="col-span-12 lg:col-span-3 glass-card flex flex-col overflow-hidden border-yellow-500/20">
                <div className="p-3 border-b border-white/5 bg-yellow-500/5 flex justify-between items-center">
                    <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Order Book</span>
                    <span className="text-[10px] text-slate-500">SYF / USDC</span>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-xs relative">
                    {/* Header */}
                    <div className="grid grid-cols-3 px-3 py-2 text-slate-500 border-b border-white/5">
                        <span>Price</span>
                        <span className="text-right">Amount</span>
                        <span className="text-right">Total</span>
                    </div>

                    {/* Asks (Sell Orders) */}
                    <div className="flex flex-col-reverse justify-end pb-2">
                        {[...Array(10)].map((_, i) => {
                            const price = (1.05 + (i * 0.005)).toFixed(3);
                            const amount = (Math.random() * 1000).toFixed(0);
                            return (
                                <div key={`ask-${i}`} className="grid grid-cols-3 px-3 py-0.5 hover:bg-rose-500/10 cursor-pointer transition-colors relative group">
                                    <span className="text-rose-400">{price}</span>
                                    <span className="text-right text-slate-300">{amount}</span>
                                    <span className="text-right text-slate-400">{(Number(price) * Number(amount)).toFixed(0)}</span>
                                    <div className="absolute right-0 top-0 bottom-0 bg-rose-500/10 z-0" style={{ width: `${Math.random() * 80}%` }}></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Current Price */}
                    <div className="sticky border-y border-white/10 bg-obsidian py-2 px-3 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-emerald-400">1.045</span>
                            <TrendingUp size={14} className="text-emerald-400" />
                        </div>
                        <span className="text-xs text-slate-500">Spread: 0.1%</span>
                    </div>

                    {/* Bids (Buy Orders) */}
                    <div className="pt-2">
                        {[...Array(10)].map((_, i) => {
                            const price = (1.04 - (i * 0.005)).toFixed(3);
                            const amount = (Math.random() * 1000).toFixed(0);
                            return (
                                <div key={`bid-${i}`} className="grid grid-cols-3 px-3 py-0.5 hover:bg-emerald-500/10 cursor-pointer transition-colors relative">
                                    <span className="text-emerald-400">{price}</span>
                                    <span className="text-right text-slate-300">{amount}</span>
                                    <span className="text-right text-slate-400">{(Number(price) * Number(amount)).toFixed(0)}</span>
                                    <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 z-0" style={{ width: `${Math.random() * 80}%` }}></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CHART & TRADING FORM (Middle) */}
            <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
                {/* Chart Area */}
                <div className="glass-card flex-1 min-h-[400px] border-yellow-500/20 relative overflow-hidden group">
                    <div className="absolute top-4 left-4 z-10 flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold border border-yellow-500/30">Y</div>
                            <div>
                                <h3 className="text-sm font-bold text-white">SYF / USDC</h3>
                                <p className="text-[10px] text-yellow-500 font-mono">Yellow Network Execution</p>
                            </div>
                        </div>
                    </div>
                    {/* Mock Chart Visual */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Activity size={48} className="mx-auto text-yellow-500" />
                            <p className="text-sm font-mono text-yellow-200">Processing Real-Time Data Stream...</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
                </div>

                {/* History / Open Orders */}
                <div className="glass-card flex-1 min-h-[200px] border-white/5">
                    <div className="flex border-b border-white/5">
                        <button className="px-4 py-3 text-sm font-bold text-white border-b-2 border-yellow-500 bg-white/5">Open Orders (2)</button>
                        <button className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white">Trade History</button>
                        <button className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white">Funds</button>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-left text-xs text-slate-400">
                            <thead>
                                <tr className="uppercase tracking-wider border-b border-white/5 text-[10px]">
                                    <th className="pb-2">Time</th>
                                    <th className="pb-2">Type</th>
                                    <th className="pb-2">Price</th>
                                    <th className="pb-2">Amount</th>
                                    <th className="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono">
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3">12:45:02</td>
                                    <td className="py-3 text-emerald-400">BUY</td>
                                    <td className="py-3">1.020</td>
                                    <td className="py-3">500 SYF</td>
                                    <td className="py-3"><span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px]">OPEN</span></td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="py-3">10:12:44</td>
                                    <td className="py-3 text-rose-400">SELL</td>
                                    <td className="py-3">1.080</td>
                                    <td className="py-3">250 SYF</td>
                                    <td className="py-3"><span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px]">OPEN</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* TRADING FORM (Right) */}
            <div className="col-span-12 lg:col-span-3 glass-card p-0 overflow-hidden border-yellow-500/20 flex flex-col">
                <div className="p-4 bg-yellow-500/5 border-b border-white/5">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <ArrowLeftRight size={16} className="text-yellow-400" />
                        Place Order
                    </h3>
                </div>

                {/* Reusing existing YellowTrader logic/component logic here but wrapper in nicer UI */}
                <div className="p-4 flex-1">
                    <YellowTrader standalone={false} />
                </div>

                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                    <div className="flex items-start gap-2">
                        <AlertCircle size={14} className="text-slate-400 mt-0.5" />
                        <p className="text-[10px] text-slate-500 leading-tight">
                            Trades properly routed via Yellow Network State Channels. Execution depends on counter-party availability.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
