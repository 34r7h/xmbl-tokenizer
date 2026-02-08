import deployments from './deployments.json';

// Exclude 'network' and 'chainId' from the contract names
export type DeploymentKey = keyof typeof deployments;
export type ContractName = Exclude<DeploymentKey, 'network' | 'chainId'>;

export const useContractConfig = () => {
    const getContract = (name: ContractName) => {
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
