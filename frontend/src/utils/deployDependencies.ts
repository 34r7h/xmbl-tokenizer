export const DEPLOYMENT_ORDER = [
    'MockERC20',       // Base token (USDC)
    'AssetTokenizer',  // Core system
    'AgentRegistry',   // Agent System Base
    'AgentExecutor',   // Agent Execution
    'LiquidityPool',   // DeFi Core (needs USDC)
    'StrategyVault',   // Agent Funding (needs Registry + USDC)
    'YellowBridge',    // Cross-chain
    'LiFiBridge',      // Cross-chain
    'LoanFactory',     // RWA (Depends on USDC & AssetTokenizer)
    'InsurancePool',   // Risk (Depends on USDC)
    'OrderBook',       // Independent
];

export interface DependencyConfig {
    [contractName: string]: {
        args: (deployedContracts: Record<string, string>) => any[] | null;
    };
}

export const CONTRACT_DEPENDENCIES: DependencyConfig = {
    'MockERC20': {
        args: () => ["Mock USDC", "USDC", 18] // Fixed: Requires name, symbol, decimals
    },
    'AssetTokenizer': {
        args: () => [] // No args
    },
    'AgentRegistry': {
        args: () => [] // No args
    },
    'AgentExecutor': {
        args: () => [] // No args
    },
    'YellowBridge': {
        args: () => [] // No args
    },
    'LiFiBridge': {
        args: () => [] // No args
    },
    'LiquidityPool': {
        args: (contracts) => {
            const usdc = contracts['MockERC20'];
            if (!usdc) return null;
            return [usdc];
        }
    },
    'StrategyVault': {
        args: (contracts) => {
            const usdc = contracts['MockERC20'];
            const registry = contracts['AgentRegistry'];
            if (!usdc || !registry) return null;
            return [registry, usdc];
        }
    },
    'LoanFactory': {
        args: (contracts) => {
            const usdc = contracts['MockERC20'];
            const assetTokenizer = contracts['AssetTokenizer'];
            // Return null if dependencies are missing
            if (!usdc || !assetTokenizer) return null;
            return [usdc, assetTokenizer];
        }
    },
    'InsurancePool': {
        args: (contracts) => {
            const usdc = contracts['MockERC20'];
            if (!usdc) return null;
            return [usdc];
        }
    },
    'OrderBook': {
        args: () => []
    }
};
