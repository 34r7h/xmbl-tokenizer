import {
    RainbowKitProvider,
    darkTheme,
    connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
    metaMaskWallet,
    coinbaseWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider, createConfig, http } from 'wagmi';
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
    hardhat,
    localhost,
} from 'wagmi/chains';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import type { ReactNode } from 'react';
import { mock } from 'wagmi/connectors';
import { privateKeyToAccount } from 'viem/accounts';

// Private key for Hardhat Account #0
const HARDHAT_ACCOUNT = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

// Define chains
const chains = [localhost, hardhat, mainnet, polygon, optimism, arbitrum, base, sepolia] as const;

// Custom Hardhat Wallet for RainbowKit
const hardhatWallet = () => ({
    id: 'hardhat',
    name: 'Hardhat Dev',
    iconUrl: 'https://avatars.githubusercontent.com/u/9263930?s=200&v=4',
    iconBackground: '#fff',
    createConnector: () => {
        return mock({
            accounts: [HARDHAT_ACCOUNT.address],
            features: {
                reconnect: true,
            },
        });
    },
});

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Development',
            wallets: [hardhatWallet],
        },
        {
            groupName: 'Recommended',
            wallets: [metaMaskWallet, coinbaseWallet, walletConnectWallet],
        },
    ],
    {
        appName: 'XMBL Tokenizer',
        projectId: 'YOUR_PROJECT_ID',
    }
);

const config = createConfig({
    chains: chains,
    transports: {
        [localhost.id]: http(),
        [hardhat.id]: http(),
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [optimism.id]: http(),
        [arbitrum.id]: http(),
        [base.id]: http(),
        [sepolia.id]: http(),
    },
    connectors,
    ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#4f46e5',
                        accentColorForeground: 'white',
                        borderRadius: 'large',
                        fontStack: 'system',
                        overlayBlur: 'small',
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
