import { useReadContract, useAccount } from 'wagmi';
import { useContractConfig } from '../contracts/useContractConfig';

export function useUserLoans() {
    const { address } = useAccount();
    const { getContract } = useContractConfig();
    const loanFactory = getContract('LoanFactory'); // 1. Get List of Loans with Details
    const { data: loans, isLoading, refetch } = useReadContract({
        address: loanFactory?.address,
        abi: loanFactory?.abi,
        functionName: 'getUserLoanDetails',
        args: [address],
        query: {
            enabled: !!loanFactory && !!address,
        }
    });

    return {
        loans: loans as any[] || [],
        isLoading,
        refetch
    };
}
