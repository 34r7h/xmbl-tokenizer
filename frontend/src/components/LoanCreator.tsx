import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useReadContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseUnits } from 'viem';
import { useContractConfig } from '../contracts/useContractConfig';
import { PlusCircle, Info, ShieldCheck, CheckCircle2, Loader2, X, Lock } from 'lucide-react';

export function LoanCreator({ assetTokenId = "1" }: { assetTokenId?: string }) {
    console.log("LoanCreator: Component Rendering...");
    const [principal, setPrincipal] = useState('');
    const [interestRate, setInterestRate] = useState('5');
    const [duration, setDuration] = useState('365');
    const [showSuccess, setShowSuccess] = useState(false);

    const { isConnected, address, chainId } = useAccount();
    const { switchChain } = useSwitchChain();
    const { getContract } = useContractConfig();

    // Allow Localhost (31337) or Sepolia (11155111)
    const isWrongNetwork = isConnected && chainId !== 31337 && chainId !== 11155111;

    // Debug
    useEffect(() => {
        if (isConnected) {
            const at = getContract('AssetTokenizer');
            const lf = getContract('LoanFactory');
            console.log("LoanCreator Debug:", {
                chainId,
                AssetTokenizer: at?.address,
                LoanFactory: lf?.address,
                User: address
            });
        }
    }, [isConnected, chainId]);

    const { writeContract: createLoan, isPending: isCreating } = useWriteContract({
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

    // 1. Check Ownership
    const assetTokenizer = getContract('AssetTokenizer');
    const loanFactory = getContract('LoanFactory');

    const { data: ownerOfAsset } = useReadContract({
        address: assetTokenizer?.address,
        abi: assetTokenizer?.abi,
        functionName: 'ownerOf',
        args: [BigInt(assetTokenId)],
        query: {
            enabled: !!assetTokenizer && isConnected,
            refetchInterval: 2000
        }
    });

    // 2. Check Approval
    const { data: isApprovedForAll, refetch: refetchApproval } = useReadContract({
        address: assetTokenizer?.address,
        abi: assetTokenizer?.abi,
        functionName: 'isApprovedForAll',
        args: [address, loanFactory?.address],
        query: {
            enabled: !!assetTokenizer && !!loanFactory && isConnected,
            refetchInterval: 2000
        }
    });

    const isOwner = ownerOfAsset === address;
    const isApproved = isApprovedForAll === true;

    // 3. Approve Action
    const { writeContract: approveAsset, data: approveTxHash, isPending: isApproving } = useWriteContract();

    const { isLoading: isWaitingApproval } = useWaitForTransactionReceipt({
        hash: approveTxHash,
        query: {
            enabled: !!approveTxHash,
        }
    });

    useEffect(() => {
        if (approveTxHash && !isWaitingApproval) {
            refetchApproval();
        }
    }, [approveTxHash, isWaitingApproval, refetchApproval]);

    const handleApprove = () => {
        if (!assetTokenizer || !loanFactory) return;
        approveAsset({
            address: assetTokenizer.address,
            abi: assetTokenizer.abi,
            functionName: 'setApprovalForAll',
            args: [loanFactory.address, true]
        });
    };

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

                {!isConnected ? (
                    <button disabled className="btn-primary mt-2 opacity-50 cursor-not-allowed">
                        Connect Wallet to Continue
                    </button>
                ) : isWrongNetwork ? (
                    <button
                        type="button"
                        onClick={() => switchChain({ chainId: 11155111 })}
                        className="btn-primary mt-2 bg-amber-500 hover:bg-amber-600 border-amber-500/50 text-white"
                    >
                        Switch to Sepolia
                    </button>
                ) : !isOwner && ownerOfAsset ? (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                        <p className="text-rose-400 text-sm font-bold">You do not own Asset #{assetTokenId}.</p>
                        <p className="text-slate-400 text-xs mt-1">Acquire the asset or tokenize a new one.</p>
                    </div>
                ) : !isApproved ? (
                    <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isApproving || isWaitingApproval}
                        className="w-full py-3 bg-cyber-indigo hover:bg-cyber-indigo/80 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyber-indigo/20 flex items-center justify-center gap-2"
                    >
                        {isApproving || isWaitingApproval ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                        {isApproving ? 'Approving...' : isWaitingApproval ? 'Confirming Approval...' : 'Approve Collateral Transfer'}
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!principal || isCreating}
                        className="btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isCreating ? <Loader2 className="animate-spin" size={20} /> : null}
                        {isCreating ? 'Processing Agreement...' : 'Authorize & Create Loan'}
                    </button>
                )}
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
