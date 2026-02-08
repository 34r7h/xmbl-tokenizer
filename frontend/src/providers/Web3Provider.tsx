import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
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

// For the hackathon, we'll define a custom Arc chain if we have details, 
// otherwise we use Sepolia as the default testnet.
const config = getDefaultConfig({
    appName: 'XMB Protocol',
    projectId: 'YOUR_PROJECT_ID', // Placeholder for now
    chains: [mainnet, polygon, optimism, arbitrum, base, sepolia, hardhat, localhost],
    ssr: true, // If your environment supports SSR
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#4f46e5', // vivid-indigo
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
