import { useCallback } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import AgentExecutorABI from '../abis/AgentExecutor.json';

const AGENT_EXECUTOR_ADDRESS = '0x0000000000000000000000000000000000000000'; // Placeholder

export function useAgentStrategies() {
    const { address } = useAccount();
    const { writeContract: registerInternal } = useWriteContract();

    const registerStrategy = useCallback(async (type: string, data: string) => {
        if (!address) return;

        registerInternal({
            address: AGENT_EXECUTOR_ADDRESS,
            abi: AgentExecutorABI,
            functionName: 'registerStrategy',
            args: [type, data as `0x${string}`],
        });
    }, [address, registerInternal]);

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
