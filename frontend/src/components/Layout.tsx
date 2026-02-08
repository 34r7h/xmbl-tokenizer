import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
    LayoutDashboard,
    PlusCircle,
    ArrowLeftRight,
    Sparkles,
    Globe,
    ShieldCheck,
    Package,
    Droplets,
    Search,
    Menu,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    // Responsive: Auto-collapse on smaller screens (but larger than mobile)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
                setIsCollapsed(true);
            } else if (window.innerWidth >= 1280) {
                setIsCollapsed(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const getPageTitle = (path: string) => {
        switch (path) {
            case '/': return 'Command Center';
            case '/mint': return 'Mint & Loan Assets';
            case '/trading': return 'Yellow Network Trading';
            case '/strategies': return 'AI Strategy Lab';
            case '/bridge': return 'Cross-Chain Bridge';
            case '/insurance': return 'Insurance Lab';
            case '/portfolios': return 'Portfolio Manager';
            case '/liquidity': return 'Liquidity Pools';
            default: return 'XMB Protocol';
        }
    };

    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

    return (
        <div className="min-h-screen bg-obsidian text-slate-100 flex overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 glass-card rounded-none border-y-0 border-l-0 
                transform transition-all duration-300 lg:translate-x-0 flex flex-col
                ${isMobileOpen ? 'translate-x-0 w-64' : `-translate-x-full lg:translate-x-0 ${sidebarWidth}`}
                `}
            >
                {/* Brand Header */}
                <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="w-10 h-10 flex-shrink-0">
                            <img src="/xmbl_logo.svg" alt="XMBL" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]" />
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="text-xl font-bold tracking-tight text-white leading-none">XMBL</span>
                                <span className="text-[10px] font-mono text-cyber-cyan tracking-widest uppercase opacity-80">Tokenizer</span>
                            </div>
                        )}
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === '/'} collapsed={isCollapsed} />
                    <NavItem to="/mint" icon={<PlusCircle size={20} />} label="Mint & Loan" active={location.pathname === '/mint'} collapsed={isCollapsed} />
                    <NavItem to="/trading" icon={<ArrowLeftRight size={20} />} label="Trading" active={location.pathname === '/trading'} collapsed={isCollapsed} />
                    <NavItem to="/strategies" icon={<Sparkles size={20} />} label="AI Strategy" active={location.pathname === '/strategies'} collapsed={isCollapsed} />
                    <NavItem to="/bridge" icon={<Globe size={20} />} label="Bridge" active={location.pathname === '/bridge'} collapsed={isCollapsed} />
                    <NavItem to="/insurance" icon={<ShieldCheck size={20} />} label="Insurance" active={location.pathname === '/insurance'} collapsed={isCollapsed} />
                    <NavItem to="/portfolios" icon={<Package size={20} />} label="Portfolios" active={location.pathname === '/portfolios'} collapsed={isCollapsed} />
                    <NavItem to="/liquidity" icon={<Droplets size={20} />} label="Liquidity" active={location.pathname === '/liquidity'} collapsed={isCollapsed} />
                </nav>

                {/* Toggle Collapse Button (Desktop Only) */}
                <div className="p-4 hidden lg:flex justify-end border-t border-white/5">
                    <button
                        onClick={toggleCollapse}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Protocol Status (Hidden if collapsed) */}
                {!isCollapsed && (
                    <div className="p-4 pt-0">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-vivid-indigo/10 to-cyber-cyan/5 border border-white/5">
                            <p className="text-xs text-slate-400 mb-2">Protocol Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <span className="text-sm font-medium text-emerald-400">Operational</span>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isMobileOpen ? 'ml-0' : 'lg:ml-0'}`}>
                {/* 
                    Note: The sidebar is fixed, so main content needs margin-left on large screens.
                    We handle this by wrapping main content in a div that checks sidebar width state?
                    No, easier to just let flexbox handle it if sidebar wasn't fixed, but since it IS fixed...
                    Wait, my previous code had `lg:static`.
                    Let's utilize that. Sidebar is `lg:static`, so it takes up space in the flex container.
                    Perfect.
                 */}

                {/* Header */}
                <header className="h-20 glass-card rounded-none border-x-0 border-t-0 flex items-center justify-between px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                            <Menu size={24} />
                        </button>
                        <h1 className="text-2xl font-bold text-white hidden md:block">
                            {getPageTitle(location.pathname)}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar */}
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-cyan transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search assets..."
                                className="bg-obsidian/50 border border-white/10 rounded-full pl-10 pr-4 py-2 w-64 text-sm focus:outline-none focus:border-cyber-cyan/50 hover:border-white/20 transition-all text-slate-200"
                            />
                        </div>

                        {/* Custom Connect Button */}
                        <ConnectButton.Custom>
                            {({
                                account,
                                chain,
                                openAccountModal,
                                openChainModal,
                                openConnectModal,
                                authenticationStatus,
                                mounted,
                            }) => {
                                const ready = mounted && authenticationStatus !== 'loading';
                                const connected =
                                    ready &&
                                    account &&
                                    chain &&
                                    (!authenticationStatus ||
                                        authenticationStatus === 'authenticated');

                                return (
                                    <div
                                        {...(!ready && {
                                            'aria-hidden': true,
                                            'style': {
                                                opacity: 0,
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                            },
                                        })}
                                    >
                                        {(() => {
                                            if (!connected) {
                                                return (
                                                    <button onClick={openConnectModal} className="btn-primary py-2 px-4 text-xs font-bold rounded-lg flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                                        Connect Wallet
                                                    </button>
                                                );
                                            }

                                            if (chain.unsupported) {
                                                return (
                                                    <button onClick={openChainModal} className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all">
                                                        Wrong network
                                                    </button>
                                                );
                                            }

                                            return (
                                                <div style={{ display: 'flex', gap: 12 }}>
                                                    <button
                                                        onClick={openChainModal}
                                                        style={{ display: 'flex', alignItems: 'center' }}
                                                        type="button"
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all"
                                                    >
                                                        {chain.hasIcon && (
                                                            <div
                                                                style={{
                                                                    background: chain.iconBackground,
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: 999,
                                                                    overflow: 'hidden',
                                                                    marginRight: 4,
                                                                }}
                                                            >
                                                                {chain.iconUrl && (
                                                                    <img
                                                                        alt={chain.name ?? 'Chain icon'}
                                                                        src={chain.iconUrl}
                                                                        style={{ width: 20, height: 20 }}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        <span className="hidden md:block text-xs font-bold text-slate-300 ml-1">{chain.name}</span>
                                                    </button>

                                                    <button onClick={openAccountModal} type="button" className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-vivid-indigo/10 to-cyber-cyan/10 border border-vivid-indigo/20 rounded-lg hover:border-cyber-cyan/30 transition-all group">
                                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-vivid-indigo to-cyber-cyan flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-cyber-cyan/20">
                                                            {account.displayName ? account.displayName[0] : 'U'}
                                                        </div>
                                                        <span className="text-xs font-mono font-bold text-cyber-cyan group-hover:text-white transition-colors">
                                                            {account.displayName}
                                                        </span>
                                                    </button>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}

function NavItem({ to, icon, label, active, collapsed }: { to: string, icon: React.ReactNode, label: string, active: boolean, collapsed: boolean }) {
    return (
        <Link
            to={to}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden 
                ${active
                    ? 'bg-vivid-indigo/10 text-cyber-cyan shadow-[0_0_15px_-3px_rgba(79,70,229,0.3)] border border-vivid-indigo/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'}
                ${collapsed ? 'justify-center' : ''}
            `}
        >
            <div className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </div>

            {!collapsed && (
                <span className="relative z-10 font-medium tracking-wide whitespace-nowrap">{label}</span>
            )}

            {active && (
                <motion.div
                    layoutId="activeNav"
                    className={`absolute left-0 h-full bg-cyber-cyan shadow-[0_0_10px_#00f2ff] ${collapsed ? 'w-1 bottom-0 rounded-full' : 'w-1 rounded-r-full'}`}
                />
            )}
        </Link>
    );
}
