import { motion } from 'framer-motion';
import { ShieldCheck, ArrowUpRight, TrendingUp, Loader2 } from 'lucide-react';
import { useUserLoans } from '../hooks/useUserLoans';
import { formatUnits } from 'viem';

export function PositionManager() {
    const { loans, isLoading } = useUserLoans();

    // Process data
    const positions = loans?.map((loan: any) => {
        // loan is the struct
        // Handle both object (if ABI names) and array (if not)
        const id = (loan.id || loan[0])?.toString();
        const principalVal = loan.principalUSDC || loan[3];
        const rateVal = loan.interestRate || loan[4];

        const rate = Number(rateVal) / 100;
        const principal = principalVal ? formatUnits(principalVal, 6) : "0";

        return {
            id: id,
            asset: `Loan #${id}`,
            value: `$${Number(principal).toLocaleString()}`,
            yield: `${rate}%`,
            ltv: '80%', // Hardcoded
            health: 98 // Hardcoded
        };
    }) || [];

    if (isLoading) {
        return (
            <div className="glass-card p-6 flex justify-center items-center h-40">
                <Loader2 className="animate-spin text-cyber-cyan" size={32} />
            </div>
        );
    }

    if (positions.length === 0) {
        return (
            <div className="glass-card p-6 flex flex-col justify-center items-center h-40 gap-2">
                <ShieldCheck className="text-slate-600" size={32} />
                <p className="text-slate-400 font-medium">No active positions found.</p>
                <p className="text-xs text-slate-500">Create a loan in "Mint & Loan" to get started.</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <ShieldCheck size={20} className="text-cyber-cyan" />
                    Active RWA Positions
                </h3>
                <button className="text-xs font-bold text-cyber-cyan hover:underline transition-all">View All Assets</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                            <th className="pb-2 px-4">Asset Identification</th>
                            <th className="pb-2 px-4">Principal Value</th>
                            <th className="pb-2 px-4">APY Interest</th>
                            <th className="pb-2 px-4">LTV Ratio</th>
                            <th className="pb-2 px-6">Risk Health</th>
                            <th className="pb-2 px-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions.map((pos, i) => (
                            <motion.tr
                                key={pos.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 hover:bg-white/10 transition-colors group"
                            >
                                <td className="py-4 px-4 rounded-l-xl">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">{pos.asset}</span>
                                        <span className="text-[10px] text-slate-500 font-mono">ID: #{pos.id}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className="text-sm font-bold text-cyan-200">{pos.value}</span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp size={14} className="text-emerald-400" />
                                        <span className="text-sm font-bold text-emerald-400">{pos.yield}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-sm text-slate-300 font-medium">
                                    {pos.ltv}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pos.health}%` }}
                                            transition={{ duration: 1, delay: i * 0.2 }}
                                            className={`h-full ${pos.health > 90 ? 'bg-cyber-cyan' : pos.health > 80 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                        ></motion.div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 rounded-r-xl text-right">
                                    <button className="p-2 bg-white/5 hover:bg-vivid-indigo/20 rounded-lg text-slate-400 hover:text-white transition-all">
                                        <ArrowUpRight size={16} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
