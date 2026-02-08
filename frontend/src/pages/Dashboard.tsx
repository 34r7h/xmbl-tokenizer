import {
    BarChart3,
    Wallet,
    ArrowLeftRight,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useProtocolStats } from '../hooks/useProtocolStats';
import { PositionManager } from '../components/PositionManager';
import { Link } from 'react-router-dom';

export function Dashboard() {
    const { tvl, activeLoans, riskHealth } = useProtocolStats();

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Portfolio Summary */}
            <div className="col-span-12 lg:col-span-8 glass-card p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <BarChart3 size={20} className="text-cyber-cyan" />
                        Portfolio Performance
                    </h3>
                    <div className="flex gap-2">
                        <TimeFilter label="1H" />
                        <TimeFilter label="1D" active />
                        <TimeFilter label="1W" />
                        <TimeFilter label="1M" />
                    </div>
                </div>
                <div className="w-full h-72">
                    <PortfolioChart />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <StatsCard
                    label="Total Value Locked"
                    value={tvl}
                    change="+2.4%"
                    positive={true}
                    icon={<Wallet size={24} className="text-vivid-indigo" />}
                />
                <StatsCard
                    label="Active Loans"
                    value={`${activeLoans} Positions`}
                    change="$240,000 Utilized"
                    positive={true}
                    icon={<ArrowLeftRight size={24} className="text-cyber-cyan" />}
                />
                <StatsCard
                    label="Risk Health Score"
                    value={riskHealth}
                    change="Optimal Range"
                    positive={true}
                    icon={<ShieldCheck size={24} className="text-emerald-400" />}
                />
            </div>

            {/* AI Insights Section */}
            <div className="col-span-12 glass-card p-1 mt-2 bg-gradient-to-r from-vivid-indigo/20 via-cyber-cyan/20 to-vivid-indigo/20">
                <div className="bg-obsidian rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-vivid-indigo/20 flex items-center justify-center animate-pulse">
                        <Sparkles size={32} className="text-cyber-cyan" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-1">AI Agent Insight: Rebalancing Opportunity</h4>
                        <p className="text-slate-400">Current loan token concentration on Ethereum is suboptimal. Slippage via LI.FI is currently at a 24h low (-0.02% from median).</p>
                    </div>
                    <Link to="/strategies" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                        Execute Rebalance
                        <ArrowLeftRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Position Manager */}
            <div className="col-span-12 mt-2">
                <PositionManager />
            </div>
        </div>
    );
}

function PortfolioChart() {
    const data = [
        { name: '00:00', value: 400 },
        { name: '04:00', value: 300 },
        { name: '08:00', value: 600 },
        { name: '12:00', value: 800 },
        { name: '16:00', value: 500 },
        { name: '20:00', value: 900 },
        { name: '23:59', value: 1200 },
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00f2ff" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0b', borderColor: '#ffffff20', borderRadius: '12px' }}
                    itemStyle={{ color: '#00f2ff' }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00f2ff"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={3}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

function StatsCard({ label, value, change, positive, icon }: { label: string, value: string, change: string, positive: boolean, icon: React.ReactNode }) {
    return (
        <div className="glass-card p-6 group hover:neon-border transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                    {icon}
                </div>
                <span className={`text-sm font-bold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {change}
                </span>
            </div>
            <p className="text-slate-400 text-sm mb-1">{label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        </div>
    );
}

function TimeFilter({ label, active = false }: { label: string, active?: boolean }) {
    return (
        <button className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${active
            ? 'bg-cyber-cyan text-obsidian'
            : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
            }`}>
            {label}
        </button>
    );
}
