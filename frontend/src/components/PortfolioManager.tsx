import { useState } from 'react';
import { Package, Plus, Trash2, Zap, Info, Loader2 } from 'lucide-react';
import { useUserAssets } from '../hooks/useUserAssets';
import { formatUnits } from 'viem';

export function PortfolioManager() {
    const { assets, isLoading } = useUserAssets();

    // Logic to select assets for portfolio (mocked state for now, but using real list)
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

    const toggleAsset = (id: string) => {
        if (selectedAssetIds.includes(id)) {
            setSelectedAssetIds(selectedAssetIds.filter(a => a !== id));
        } else {
            setSelectedAssetIds([...selectedAssetIds, id]);
        }
    };

    const activeAssets = assets.filter((a: any) => a.isActive);

    return (
        <div className="glass-card p-8 bg-gradient-to-br from-vivid-indigo/20 to-obsidian border-vivid-indigo/30">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-vivid-indigo/20 text-vivid-indigo">
                        <Package size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Recursive Portfolio Manager</h2>
                        <p className="text-slate-400 text-sm">Wrap multiple assets into a single meta-token.</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Available Assets</p>
                    <p className="text-2xl font-bold text-white">{activeAssets.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>Your Real-World Assets</span>
                        <span>Valuation</span>
                    </div>

                    <div className="space-y-3 min-h-[200px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="animate-spin text-cyber-cyan" size={32} />
                            </div>
                        ) : activeAssets.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <p>No assets found. Mint some in the "Mint & Loan" tab!</p>
                            </div>
                        ) : (
                            activeAssets.map((asset: any) => {
                                const isSelected = selectedAssetIds.includes(asset.id);
                                return (
                                    <div
                                        key={asset.id}
                                        onClick={() => toggleAsset(asset.id)}
                                        className={`glass-card p-4 flex items-center gap-4 group cursor-pointer transition-all ${isSelected ? 'border-cyber-cyan/50 bg-cyber-cyan/5' : 'hover:bg-white/5 border-white/5'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${isSelected ? 'bg-cyber-cyan text-obsidian' : 'bg-vivid-indigo/10 text-vivid-indigo'}`}>
                                            {asset.type === 'real_estate' ? '🏠' : asset.type === 'invoice' ? '📄' : '💎'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white flex items-center gap-2">
                                                {asset.type.toUpperCase()} #{asset.id}
                                                {isSelected && <span className="text-[10px] bg-cyber-cyan/20 text-cyber-cyan px-1.5 py-0.5 rounded">SELECTED</span>}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-mono truncate w-48">{asset.documentHash}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-white">${Number(asset.valuation).toLocaleString()}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-cyber-cyan bg-cyber-cyan text-obsidian' : 'border-slate-600'}`}>
                                            {isSelected && <Plus size={12} />}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-vivid-indigo/5 border border-vivid-indigo/10 flex items-start gap-3">
                        <Info size={16} className="text-vivid-indigo mt-0.5" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Meta-tokens are recursive. You can wrap existing Portfolio Tokens into new ones,
                            enabling complex nested financial structures.
                        </p>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="glass-card p-6 border-white/10 relative overflow-hidden">
                        {/* Selected Assets Summary */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Package size={120} />
                        </div>

                        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest relative z-10">Portfolio Composer</h3>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected Value</label>
                                <div className="text-3xl font-bold text-white font-mono">
                                    ${activeAssets.filter((a: any) => selectedAssetIds.includes(a.id)).reduce((acc: number, curr: any) => acc + Number(curr.valuation), 0).toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portfolio Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. High Yield RE Fund"
                                    className="w-full glass-card bg-white/5 border-white/10 px-4 py-3 text-white focus:neon-border outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Symbol</label>
                                <input
                                    type="text"
                                    placeholder="e.g. HYRE"
                                    className="w-full glass-card bg-white/5 border-white/10 px-4 py-3 text-white focus:neon-border outline-none font-mono"
                                />
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <button disabled={selectedAssetIds.length === 0} className="btn-primary w-full py-4 flex items-center justify-center gap-2 font-bold group disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Zap size={18} className="group-hover:animate-bounce" />
                                    Mint Meta-Token
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
