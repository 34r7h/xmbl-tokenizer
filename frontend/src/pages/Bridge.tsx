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
            </div>
        </div>
    );
}
