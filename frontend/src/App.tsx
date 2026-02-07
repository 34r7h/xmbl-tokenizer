import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LoanCreator } from './components/LoanCreator';
import { YellowTrader } from './components/YellowTrader';
import { StrategyBuilder } from './components/StrategyBuilder';
import { PositionManager } from './components/PositionManager';
import { ActiveStrategies } from './components/ActiveStrategies';
import { LiFiWidget } from '@lifi/widget';
import type { WidgetConfig } from '@lifi/widget';
import {
  PlusCircle,
  ArrowLeftRight,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Sparkles,
  Search,
  LayoutDashboard,
  BarChart3,
  Globe
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const lifiWidgetConfig = useMemo<WidgetConfig>(
    () => ({
      integrator: 'XMB Protocol',
      theme: {
        palette: {
          primary: { main: '#00f2ff' },
          secondary: { main: '#6366f1' },
          background: {
            paper: '#0a0a0b',
            default: '#0a0a0b',
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
        },
      },
      container: {
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
      },
      // Note: integrator is actually a top-level property of config, not theme/container
    }),
    []
  );

  const lifiWidgetProps = useMemo(() => ({
    config: lifiWidgetConfig,
    integrator: 'XMB Protocol', // Required by WidgetConfig type
  }), [lifiWidgetConfig]);

  return (
    <div className="min-h-screen font-sans">
      {/* Navigation */}
      <nav className="fixed left-0 top-0 h-full w-64 glass-card rounded-none border-y-0 border-l-0 p-6 flex flex-col gap-8 z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-vivid-indigo to-cyber-cyan rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">XMB Protocol</span>
        </div>

        <div className="flex flex-col gap-2">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem
            icon={<PlusCircle size={20} />}
            label="Mint & Loan"
            active={activeTab === 'mint'}
            onClick={() => setActiveTab('mint')}
          />
          <NavItem
            icon={<ArrowLeftRight size={20} />}
            label="Trading"
            active={activeTab === 'trading'}
            onClick={() => setActiveTab('trading')}
          />
          <NavItem
            icon={<Sparkles size={20} />}
            label="AI Strategy"
            active={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
          />
          <NavItem
            icon={<Globe size={20} />}
            label="Bridge"
            active={activeTab === 'bridge'}
            onClick={() => setActiveTab('bridge')}
          />
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 flex justify-center">
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-72 pr-8 pt-8 pb-8 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 underline decoration-cyber-cyan/30">
                  {activeTab === 'dashboard' ? 'Welcome back, Commander' :
                    activeTab === 'mint' ? 'Mint & Loan Assets' :
                      activeTab === 'trading' ? 'Yellow Network Trading' :
                        activeTab === 'ai' ? 'AI Strategy Lab' : 'Cross-Chain Bridge'}
                </h1>
                <p className="text-slate-400">Your recursive DeFi positions are performing +12.5% above benchmark.</p>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-cyan transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search assets, loans, strategies..."
                  className="glass-card bg-white/5 border-white/10 pl-10 pr-4 py-2 w-80 focus:outline-none focus:neon-border transition-all"
                />
              </div>
            </header>

            {activeTab === 'dashboard' && (
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
                    value="$1,284,500.00"
                    change="+2.4%"
                    positive={true}
                    icon={<Wallet size={24} className="text-vivid-indigo" />}
                  />
                  <StatsCard
                    label="Active Loans"
                    value="12 Positions"
                    change="$240,000 Utilized"
                    positive={true}
                    icon={<ArrowLeftRight size={24} className="text-cyber-cyan" />}
                  />
                  <StatsCard
                    label="Risk Health Score"
                    value="94.2/100"
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
                    <button className="btn-primary flex items-center gap-2 whitespace-nowrap" onClick={() => setActiveTab('ai')}>
                      Execute Rebalance
                      <ArrowLeftRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Position Manager */}
                <div className="col-span-12 mt-2">
                  <PositionManager />
                </div>
              </div>
            )}

            {activeTab === 'mint' && (
              <div className="max-w-4xl">
                <LoanCreator />
              </div>
            )}

            {activeTab === 'trading' && (
              <div className="max-w-4xl">
                <YellowTrader />
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="max-w-4xl flex flex-col gap-8">
                <StrategyBuilder />
                <ActiveStrategies />
              </div>
            )}

            {activeTab === 'bridge' && (
              <div className="max-w-4xl">
                <div className="glass-card p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Cross-Chain Bridge</h2>
                  <div className="w-full h-[700px]">
                    <LiFiWidget {...lifiWidgetProps} />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
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


function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${active
        ? 'bg-vivid-indigo/20 text-cyber-cyan neon-border'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <div className={active ? 'text-cyber-cyan' : 'text-slate-500 group-hover:text-white transition-colors'}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-[0_0_8px_rgba(0,242,255,0.8)]"></div>}
    </button>
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

export default App;
