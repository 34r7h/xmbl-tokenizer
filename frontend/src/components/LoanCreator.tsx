import { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useContractConfig } from '../contracts/useContractConfig';
import { PlusCircle, Info, ShieldCheck, CheckCircle2, Loader2, X } from 'lucide-react';

export function LoanCreator({ assetTokenId = "1" }: { assetTokenId?: string }) {
    const [principal, setPrincipal] = useState('');
    const [interestRate, setInterestRate] = useState('5');
    const [duration, setDuration] = useState('365');
    const [showSuccess, setShowSuccess] = useState(false);

    const { isConnected, address } = useAccount();
    const { getContract } = useContractConfig();

    const { writeContract: createLoan, isPending } = useWriteContract({
        mutation: {
            onSuccess: (data) => {
                console.log("Arc: Loan Created Successfully!", data);
                setShowSuccess(true);
                setPrincipal('');
            },
            onError: (error) => {
                console.error("Arc: Loan Creation Failed", error);
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) return;

        const loanFactory = getContract('LoanFactory');
        if (!loanFactory) return;

        console.log(`Arc: Initiating Loan Creation for Asset #${assetTokenId}...`);
        console.log(`Arc: Settling Loan in USDC (Principal: ${principal}) on Arc Network...`);

        createLoan({
            address: loanFactory.address,
            abi: loanFactory.abi,
            functionName: 'createLoan',
            args: [
                BigInt(assetTokenId),
                parseUnits(principal, 6), // USDC has 6 decimals
                BigInt(parseInt(interestRate) * 100), // Convert to basis points
                BigInt(parseInt(duration) * 24 * 60 * 60) // Convert days to seconds
            ]
        });
    };

    return (
        <div className="glass-card p-6 flex flex-col gap-6 relative overflow-hidden">
            {/* Background Gradient for Arc Branding */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-vivid-indigo/10 blur-[80px] pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <PlusCircle className="text-cyber-cyan" size={20} />
                    Create Collateralized Loan
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-vivid-indigo/10 border border-vivid-indigo/30 rounded-full">
                    <ShieldCheck size={14} className="text-vivid-indigo" />
                    <span className="text-[10px] font-bold text-vivid-indigo uppercase tracking-wider">Settled on Arc Network</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-400">Principal (USDC)</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border transition-all"
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-400">Interest Rate (%)</label>
                        <input
                            type="number"
                            placeholder="5"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border transition-all"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-400">Duration (Days)</label>
                        <input
                            type="number"
                            placeholder="365"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border transition-all"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 bg-vivid-indigo/10 rounded-xl border border-vivid-indigo/20 flex gap-3 text-sm text-slate-300">
                    <Info size={18} className="text-cyber-cyan shrink-0" />
                    <p>This will tokenize your RWA as collateral and mint tradable loan tokens. Liquidity providers can then fund your loan instantly.</p>
                </div>

                <button
                    type="submit"
                    disabled={!isConnected || !principal || isPending}
                    className="btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin" size={20} /> : null}
                    {isPending ? 'Processing Agreement...' : isConnected ? 'Authorize & Create Loan' : 'Connect Wallet to Continue'}
                </button>
            </form>

            {/* Success Modal Overlay */}
            {showSuccess && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-emerald-500/20 flex flex-col items-center text-center relative">
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} className="text-emerald-400" />
                        </div>

                        <h4 className="text-xl font-bold text-white mb-2">Loan Created!</h4>
                        <p className="text-slate-400 text-sm mb-6">
                            Your RWA has been tokenized and the loan tokens have been minted on the Arc Network.
                        </p>

                        <div className="w-full p-3 bg-white/5 rounded-xl border border-white/10 mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400">Status</span>
                                <span className="text-emerald-400 font-bold">Active</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Network</span>
                                <span className="text-vivid-indigo font-bold">Arc Testnet</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full btn-primary py-2"
                        >
                            View on Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
