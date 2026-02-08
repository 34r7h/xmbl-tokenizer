import { useReadContract, useAccount } from 'wagmi';
import { useContractConfig } from '../contracts/useContractConfig';

export interface Asset {
    id: string;
    type: string;
    valuation: bigint;
    documentHash: string;
    appraiser: string;
    isActive: boolean;
}

export function useUserAssets() {
    const { address } = useAccount();
    const { getContract } = useContractConfig();
    const assetTokenizer = getContract('AssetTokenizer');

    // 1. Get List of Assets with Details
    const { data: result, error, refetch } = useReadContract({
        address: assetTokenizer?.address,
        abi: assetTokenizer?.abi,
        functionName: 'getUserAssetDetails',
        args: [address],
        query: {
            enabled: !!assetTokenizer && !!address,
        }
    });

    // Logging specific to user request
    if (result) {
        console.log("useUserAssets: Raw Data Fetched:", result);
    }
    if (error) {
        console.error("useUserAssets: Error Fetching Assets:", error);
    }

    const assets = result ? (result as any)[0] : [];
    const ids = result ? (result as any)[1] : [];

    const formattedAssets = assets.map((asset: any, index: number) => ({
        id: ids[index].toString(),
        type: asset.assetType,
        valuation: asset.valuationUSD,
        documentHash: asset.documentHash,
        appraiser: asset.appraiser,
        isActive: asset.isActive
    }));

    if (formattedAssets.length > 0) {
        console.log("useUserAssets: Formatted Assets:", formattedAssets);
    }

    return {
        assets: formattedAssets,
        isLoading: !result && !error,
        refetch
    };
}
