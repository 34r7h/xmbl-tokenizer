import { useAccount } from 'wagmi';
import deployments from './deployments.json';

// Exclude 'network' and 'chainId' from the contract names
export type DeploymentKey = keyof typeof deployments;
export type ContractName = Exclude<DeploymentKey, 'network' | 'chainId'>;

export const useContractConfig = () => {
    const { chain } = useAccount();

    const getContract = (name: ContractName) => {
        // 1. Try to get from Local Storage (Dev/Deployer state)
        if (chain?.id) {
            const localDeployments = localStorage.getItem(`deployments_${chain.id}`);
            if (localDeployments) {
                try {
                    const parsed = JSON.parse(localDeployments);
                    if (parsed[name] && parsed[name].address) {
                        return {
                            address: parsed[name].address as `0x${string}`,
                            // Fallback to static ABI if not in local storage (though Deployer saves artifact usually, 
                            // here we just use the address from local and ABI from static if needed, 
                            // but ideally we want the ABI to match. 
                            // For this fix, let's assume we want the ADDRESS to be dynamic. 
                            // The static ABI is likely fine if the interface hasn't changed.)
                            abi: (deployments as any)[name]?.abi ? (typeof (deployments as any)[name].abi === 'string' ? JSON.parse((deployments as any)[name].abi) : (deployments as any)[name].abi) : []
                        };
                    }
                } catch (e) {
                    console.error("Failed to parse local deployments", e);
                }
            }
        }

        // 2. Fallback to Static config (deployments.json)
        // @ts-ignore
        const contractData = deployments[name];

        // Type guard to ensure we have a contract object, not a string/number
        if (!contractData || typeof contractData !== 'object' || !('address' in contractData)) {
            console.warn(`Contract ${name} not found or invalid in deployments`);
            return null;
        }

        return {
            address: contractData.address as `0x${string}`,
            abi: typeof contractData.abi === 'string' ? JSON.parse(contractData.abi) : contractData.abi
        };
    };

    return {
        deployments,
        getContract
    };
};
