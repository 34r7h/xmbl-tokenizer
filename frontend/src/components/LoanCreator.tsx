import { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useContractConfig } from '../contracts/useContractConfig';
import { PlusCircle, Info } from 'lucide-react';

export function LoanCreator({ assetTokenId = "1" }: { assetTokenId?: string }) {
    const [principal, setPrincipal] = useState('');
    const [interestRate, setInterestRate] = useState('5');
    const [duration, setDuration] = useState('365');
    const { isConnected } = useAccount();
    const { getContract } = useContractConfig();

    const { writeContract: createLoan } = useWriteContract();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) return;

        const loanFactory = getContract('LoanFactory');
        if (!loanFactory) return;

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
        <div className="glass-card p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <PlusCircle className="text-cyber-cyan" size={20} />
                    Create Collateralized Loan
                </h3>
                <span className="text-xs font-mono text-slate-500">ASSET ID: #{assetTokenId}</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    disabled={!isConnected || !principal}
                    className="btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isConnected ? 'Authorize & Create Loan' : 'Connect Wallet to Continue'}
                </button>
            </form>
        </div>
    );
}
