import { useReadContract, useReadContracts } from 'wagmi';
import { useContractConfig } from '../contracts/useContractConfig';
import { formatUnits } from 'viem';

export function useProtocolStats() {
    const { getContract } = useContractConfig();
    const loanFactory = getContract('LoanFactory');
    const usdc = getContract('USDC');

    // 1. Fetch Loan Count
    const { data: loanCount } = useReadContract({
        address: loanFactory?.address,
        abi: loanFactory?.abi,
        functionName: 'getLoanCount',
        query: {
            enabled: !!loanFactory,
            refetchInterval: 5000
        }
    });

    // 2. Fetch TVL (USDC Balance of LoanFactory + maybe outstanding principals?)
    // For simplicity, we'll check USDC balance of LoanFactory as "Available Liquidity" 
    // and maybe we can sum up total owed if we want exact TVL.
    // Let's start with Available Liquidity.
    const { data: liquidity } = useReadContract({
        address: usdc?.address,
        abi: usdc?.abi,
        functionName: 'balanceOf',
        args: [loanFactory?.address],
        query: {
            enabled: !!usdc && !!loanFactory,
            refetchInterval: 5000
        }
    });

    const formattedLiquidity = liquidity
        ? `$${Number(formatUnits(liquidity as bigint, 6)).toLocaleString()}`
        : '$0.00';

    return {
        activeLoans: loanCount ? Number(loanCount) : 0,
        tvl: formattedLiquidity,
        riskHealth: "98.5/100" // Hardcoded for now, requires complex calculation
    };
}
