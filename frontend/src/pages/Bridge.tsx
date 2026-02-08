import { useMemo } from 'react';
import { LiFiWidget } from '@lifi/widget';
import type { WidgetConfig } from '@lifi/widget';

export function Bridge() {
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
                minHeight: '600px'
            },
        }),
        []
    );

    const lifiWidgetProps = useMemo(() => ({
        config: lifiWidgetConfig,
        integrator: 'XMB Protocol',
    }), [lifiWidgetConfig]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="glass-card p-6 min-h-[700px] flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-6">Cross-Chain Bridge</h2>
                <div className="flex-1">
                    <LiFiWidget {...lifiWidgetProps} />
                </div>

                {/* Dev Simulation Control */}
                <div className="mt-4 p-4 border border-white/10 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-500 uppercase">Dev Controls</span>
                        <button
                            onClick={() => {
                                console.log("LI.FI: Analyzed 14 cross-chain routes...");
                                const btn = document.getElementById('sim-bridge-btn');
                                if (btn) {
                                    const originalText = btn.innerText;
                                    btn.innerText = "Finding Best Route...";
                                    btn.className = "px-3 py-1 bg-cyber-cyan/20 text-cyber-cyan text-xs font-bold rounded-lg animate-pulse border border-cyber-cyan/50";

                                    setTimeout(() => {
                                        console.log("LI.FI: Best Route Found via Polygon (Cost: $0.45)");
                                        btn.innerText = "Route Found! Bridging...";
                                    }, 1000);

                                    setTimeout(() => {
                                        console.log("LI.FI: Initiating Bridge Transaction...");
                                    }, 2000);

                                    setTimeout(() => {
                                        console.log("LI.FI: Transaction Sent: 0x479e410c63c375ba305d8232610ca1fd48e6c013a1161a4ca31aa8ab2ad0dd63");
                                        btn.innerText = "✓ Bridge Success!";
                                        btn.className = "px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/50";

                                        // Reset after 3s
                                        setTimeout(() => {
                                            btn.innerText = "Simulate Bridge Event";
                                            btn.className = "px-3 py-1 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan text-xs font-bold rounded-lg transition-colors border border-cyber-cyan/30";
                                        }, 3000);
                                    }, 4000);
                                }
                            }}
                            id="sim-bridge-btn"
                            className="px-3 py-1 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan text-xs font-bold rounded-lg transition-colors border border-cyber-cyan/30"
                        >
                            Simulate Bridge Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
