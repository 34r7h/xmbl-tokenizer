import { useCallback } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { useContractConfig } from '../contracts/useContractConfig';

export function useAgentStrategies() {
    const { address } = useAccount();
    const { getContract } = useContractConfig();
    const agentExecutor = getContract('AgentExecutor');

    const { writeContract: registerInternal } = useWriteContract();

    const registerStrategy = useCallback(async (type: string, data: string) => {
        if (!address || !agentExecutor) return;

        registerInternal({
            address: agentExecutor.address,
            abi: agentExecutor.abi,
            functionName: 'registerStrategy',
            args: [type, data as `0x${string}`],
        });
    }, [address, agentExecutor, registerInternal]);

    const parseIntent = async (intent: string) => {
        // This would call StrategyParser.js via an API or server action
        // Mocking for frontend demo
        console.log('Parsing intent with Ollama:', intent);
        return {
            type: 'rebalancing',
            triggers: [{ condition: 'price < 2000', threshold: 2000 }],
            actions: [{ type: 'swap', params: { from: 'USDC', to: 'ETH' } }]
        };
    };

    return {
        registerStrategy,
        parseIntent
    };
}
