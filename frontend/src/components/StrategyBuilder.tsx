import { useState } from 'react';
import { useAgentStrategies } from '../hooks/useAgentStrategies';
import { Sparkles, Terminal, Save, ChevronRight, PlusCircle } from 'lucide-react';

export function StrategyBuilder() {
    const [intent, setIntent] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [parsedStrategy, setParsedStrategy] = useState<any>(null);
    const { parseIntent, registerStrategy } = useAgentStrategies();

    const handleParse = async () => {
        if (!intent) return;
        setIsParsing(true);
        try {
            const result = await parseIntent(intent);
            setParsedStrategy(result);
        } catch (error) {
            console.error('Failed to parse intent:', error);
        } finally {
            setIsParsing(false);
        }
    };

    const handleSave = async () => {
        if (!parsedStrategy) return;
        await registerStrategy(parsedStrategy.type, '0x...');
        setParsedStrategy(null);
        setIntent('');
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-6 border-vivid-indigo/30 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-vivid-indigo" size={20} />
                    AI Strategy Command
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-vivid-indigo animate-pulse"></div>
                    OLLAMA: Llama-2 Ready
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-400 italic">"What would you like the XMB Agent to do?"</label>
                    <div className="relative">
                        <textarea
                            placeholder="e.g., Rebalance my loan portfolio if Ethereum volatility exceeds 40% and APY on Arc is above 8%."
                            className="w-full bg-obsidian border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:neon-border transition-all min-h-[100px] resize-none"
                            value={intent}
                            onChange={(e) => setIntent(e.target.value)}
                        />
                        <button
                            onClick={handleParse}
                            disabled={isParsing || !intent}
                            className="absolute right-3 bottom-3 p-2 bg-vivid-indigo hover:bg-indigo-500 rounded-lg text-white disabled:opacity-50 transition-colors shadow-lg"
                        >
                            {isParsing ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Terminal size={20} />
                            )}
                        </button>
                    </div>
                </div>

                {parsedStrategy && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-4 bg-obsidian border border-cyber-cyan/30 rounded-xl relative">
                            <div className="flex items-center gap-2 text-cyber-cyan text-xs font-bold mb-3 uppercase tracking-widest">
                                <ChevronRight size={14} />
                                Draft Strategy Detected
                            </div>
                            <pre className="text-[10px] font-mono text-cyan-100 overflow-x-auto">
                                {JSON.stringify(parsedStrategy, null, 2)}
                            </pre>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleSave}
                                className="flex-1 btn-primary flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Deploy Strategy
                            </button>
                            <button
                                onClick={() => setParsedStrategy(null)}
                                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-lg transition-all"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                )}

                {!parsedStrategy && (
                    <div className="grid grid-cols-2 gap-3">
                        <QuickIntent label="Rebalance Portfolio" onClick={setIntent} />
                        <QuickIntent label="Hedge Debt Exposure" onClick={setIntent} />
                    </div>
                )}
            </div>
        </div>
    );
}

function QuickIntent({ label, onClick }: { label: string, onClick: (val: string) => void }) {
    return (
        <button
            onClick={() => onClick(label + " if...")}
            className="p-3 bg-white/5 border border-white/10 hover:border-vivid-indigo/40 rounded-xl text-left transition-all group"
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white">{label}</span>
                <PlusCircle size={14} className="text-slate-600 group-hover:text-vivid-indigo transition-colors" />
            </div>
        </button>
    );
}
