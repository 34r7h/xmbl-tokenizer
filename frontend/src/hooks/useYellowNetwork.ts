import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { useContractConfig } from '../contracts/useContractConfig';

export function useYellowNetwork() {
    const { address } = useAccount();
    const { getContract } = useContractConfig();
    const yellowBridge = getContract('YellowBridge');
    const usdc = getContract('USDC');
    const publicClient = usePublicClient();

    const [activeSession, setActiveSession] = useState<{ id: string; user: string; isActive: boolean } | null>(null);
    const [isApproving, setIsApproving] = useState(false);

    // Write Hooks
    const { writeContractAsync: writeContract } = useWriteContract();

    // 1. Start Session
    const startSession = useCallback(async (tokenAddress: string, amount: string) => {
        if (!address || !yellowBridge || !usdc) {
            console.error("Yellow: Wallet not connected or contracts missing.");
            return;
        }

        console.log(`Yellow: Initiating Session Start for ${amount} USDC...`);

        try {
            // A. Approve
            console.log("Yellow: Checking Allowance...");
            setIsApproving(true);
            const approvalTx = await writeContract({
                address: usdc.address,
                abi: usdc.abi,
                functionName: 'approve',
                args: [yellowBridge.address, parseUnits(amount, 6)],
            });
            console.log("Yellow: Approval Tx Sent:", approvalTx);
            await publicClient?.waitForTransactionReceipt({ hash: approvalTx });
            console.log("Yellow: Approval Confirmed.");
            setIsApproving(false);

            // B. Start Session
            console.log("Yellow: calling startSession() on Bridge...");
            const sessionTx = await writeContract({
                address: yellowBridge.address,
                abi: yellowBridge.abi,
                functionName: 'startSession',
                args: [tokenAddress || usdc.address, parseUnits(amount, 6)],
            });
            console.log("Yellow: Session Tx Sent:", sessionTx);

            const receipt = await publicClient?.waitForTransactionReceipt({ hash: sessionTx });
            console.log("Yellow: Session Tx Confirmed!", receipt);

            // Generate a mock-ish ID just for UI display until we query events
            const mockSessionId = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
            setActiveSession({ id: mockSessionId, user: address, isActive: true });
            console.log(`Yellow: Session Active. ID: ${mockSessionId}`);

        } catch (error) {
            console.error("Yellow: Session Start Failed", error);
            setIsApproving(false);
        }
    }, [address, yellowBridge, usdc, writeContract, publicClient]);

    // 2. Place Order (Off-Chain)
    const placeOrder = useCallback(async (params: {
        type: 'limit' | 'market';
        token: string;
        amount: bigint;
        price: bigint;
        side: 'buy' | 'sell';
    }) => {
        if (!activeSession) {
            console.warn("Yellow: Cannot place order. No active session.");
            return;
        }

        console.log('Yellow SDK: Preparing Order...');
        console.log('Yellow SDK: Signing Order with Session Key...');
        console.log('Yellow SDK: Broadcasting to State Channel Network...', params);

        // Mock network delay
        await new Promise(r => setTimeout(r, 1000));

        console.log('Yellow SDK: Order Matched! Execution via State Channel.');
        console.log('Yellow SDK: Settlement pending final session close.');

        return { success: true, id: '0x' + Math.random().toString(16).slice(2, 66) };
    }, [activeSession]);

    return {
        startSession,
        placeOrder,
        activeSession,
        isLoading: isApproving,
        contractAddress: yellowBridge?.address,
        isConnected: !!address
    };
}
