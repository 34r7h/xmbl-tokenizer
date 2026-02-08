import { useState, useEffect } from 'react';
import { useAccount, useDeployContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { Loader2, CheckCircle2, AlertCircle, Rocket, Layers, Play, SkipForward } from 'lucide-react';
import { keccak256, encodePacked, getAddress } from 'viem';
import { CONTRACT_DEPENDENCIES, DEPLOYMENT_ORDER } from '../utils/deployDependencies';

// Dynamic import of artifacts
const artifactModules = import.meta.glob('../artifacts/*.json', { eager: true });

interface ContractArtifact {
    contractName: string;
    abi: any[];
    bytecode: string;
}

interface DeployedContract {
    address: string;
    bytecodeHash: string;
    timestamp: number;
}

// Load all artifacts into a map
const ARTIFACTS: Record<string, ContractArtifact> = {};
Object.values(artifactModules).forEach((mod: any) => {
    if (mod.contractName && mod.abi && mod.bytecode) {
        ARTIFACTS[mod.contractName] = {
            contractName: mod.contractName,
            abi: mod.abi,
            bytecode: mod.bytecode,
        };
    }
});

export function Deployer() {
    const { isConnected, chain } = useAccount();
    const publicClient = usePublicClient();
    const { deployContractAsync } = useDeployContract();

    const [selectedContractName, setSelectedContractName] = useState<string>(Object.keys(ARTIFACTS)[0] || '');
    const [constructorArgs, setConstructorArgs] = useState<Record<string, string>>({});

    // Deployment State
    const [isDeployingAll, setIsDeployingAll] = useState(false);
    const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
    const [deployedContracts, setDeployedContracts] = useState<Record<string, DeployedContract>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        if (!chain?.id) return;
        const stored = localStorage.getItem(`deployments_${chain.id}`);
        if (stored) {
            try {
                setDeployedContracts(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse deployments", e);
            }
        }
        setIsLoaded(true);
    }, [chain?.id]);

    // Save to local storage whenever deployedContracts changes
    // Only save if we have loaded the initial state to prevent overwriting with empty object on mount
    useEffect(() => {
        if (!chain?.id || !isLoaded) return;
        localStorage.setItem(`deployments_${chain.id}`, JSON.stringify(deployedContracts));
    }, [deployedContracts, chain?.id, isLoaded]);


    const handleArgChange = (name: string, value: string) => {
        setConstructorArgs(prev => ({ ...prev, [name]: value }));
    };

    const getConstructorInputs = (abi: any[]) => {
        const constructor = abi.find(item => item.type === 'constructor');
        return constructor ? constructor.inputs : [];
    };

    const log = (msg: string) => {
        setDeploymentLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
    };

    const deploySingleContract = async (name: string, args: any[] = [], manual = false) => {
        const artifact = ARTIFACTS[name];
        if (!artifact) {
            log(`Error: Artifact not found for ${name}`);
            return null;
        }

        const currentBytecodeHash = keccak256(encodePacked(['bytes'], [artifact.bytecode as `0x${string}`]));
        const existing = deployedContracts[name];

        if (!manual && existing && existing.bytecodeHash === currentBytecodeHash) {
            log(`Skipping ${name} - Already deployed at ${existing.address} (Hash match)`);
            return existing.address;
        }

        try {
            log(`Deploying ${name}...`);
            const hash = await deployContractAsync({
                abi: artifact.abi,
                bytecode: artifact.bytecode as `0x${string}`,
                args: args,
            });
            log(`Tx sent: ${hash}`);

            if (!publicClient) throw new Error("Public client not available");

            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            if (receipt.contractAddress) {
                log(`Success: ${name} deployed at ${receipt.contractAddress}`);

                const newDeployment = {
                    address: receipt.contractAddress,
                    bytecodeHash: currentBytecodeHash,
                    timestamp: Date.now()
                };

                setDeployedContracts(prev => ({
                    ...prev,
                    [name]: newDeployment
                }));

                return receipt.contractAddress;
            }
        } catch (error: any) {
            log(`Failed to deploy ${name}: ${error.message || error}`);
            return null;
        }
    };

    const handleDeployManual = async () => {
        const artifact = ARTIFACTS[selectedContractName];
        const inputs = getConstructorInputs(artifact.abi);
        const args = inputs.map(input => constructorArgs[input.name]);

        await deploySingleContract(selectedContractName, args, true);
    };

    const handleDeployAll = async () => {
        setIsDeployingAll(true);
        setDeploymentLogs([]);
        log("Starting Batch Deployment...");

        // Temporary map for this run to handle dependencies deployed in this session
        // Initialize with what we already have in state
        const currentSessionDeployments: Record<string, string> = {};
        Object.entries(deployedContracts).forEach(([name, data]) => {
            currentSessionDeployments[name] = data.address;
        });


        for (const contractName of DEPLOYMENT_ORDER) {
            if (!ARTIFACTS[contractName]) {
                log(`Skipping ${contractName} - Artifact not found`);
                continue;
            }

            // Resolve Args
            let args: any[] = [];

            // Check dependency config
            const depConfig = CONTRACT_DEPENDENCIES[contractName as keyof typeof CONTRACT_DEPENDENCIES]; // Cast for strict typing check if needed
            // Or access directly if user definied types are loose
            const specificConfig = (CONTRACT_DEPENDENCIES as any)[contractName];


            if (specificConfig && specificConfig.args) {
                // Try to resolve args from current session deployments
                const resolvedArgs = specificConfig.args(currentSessionDeployments);
                if (resolvedArgs === null) {
                    log(`Skipping ${contractName} - Missing dependencies`);
                    continue;
                }
                args = resolvedArgs;
            } else {
                // Check if it has constructor args that we can't resolve automatically
                const inputs = getConstructorInputs(ARTIFACTS[contractName].abi);
                if (inputs.length > 0) {
                    log(`Skipping ${contractName} - Cannot resolve constructor arguments automatically`);
                    continue;
                }
            }

            const address = await deploySingleContract(contractName, args);
            if (address) {
                currentSessionDeployments[contractName] = address;
            }
        }

        setIsDeployingAll(false);
        log("Batch Deployment Complete.");
    };

    const selectedInputs = ARTIFACTS[selectedContractName] ? getConstructorInputs(ARTIFACTS[selectedContractName].abi) : [];

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Deploy Contracts
                    </h2>
                    <p className="text-slate-400 mt-2">
                        Deploy smart contracts directly from your browser to the connected network.
                    </p>
                </div>
            </header>

            {!isConnected ? (
                <div className="p-8 border border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-obsidian/50">
                    <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                    <p>Please connect your wallet to deploy contracts.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT PANEL: Manual Deployment */}
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Rocket className="text-cyber-cyan" size={20} />
                                Manual Deploy
                            </h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Select Contract</label>
                            <select
                                className="w-full bg-obsidian/50 border border-white/10 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyber-cyan/50"
                                value={selectedContractName}
                                onChange={(e) => {
                                    setSelectedContractName(e.target.value);
                                    setConstructorArgs({}); // Reset args on change
                                }}
                            >
                                {Object.keys(ARTIFACTS).sort().map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dynamic Form */}
                        {selectedInputs.length > 0 && (
                            <div className="space-y-4 border-t border-white/5 pt-4">
                                <h4 className="text-sm font-bold text-slate-300">Constructor Arguments</h4>
                                {selectedInputs.map((input: any, idx: number) => (
                                    <div key={idx}>
                                        <label className="block text-xs text-slate-500 mb-1">
                                            {input.name || `Arg ${idx}`} <span className="text-slate-600">({input.type})</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-obsidian/30 border border-white/10 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyber-cyan/50 focus:outline-none"
                                            placeholder={`${input.type}`}
                                            value={constructorArgs[input.name] || ''}
                                            onChange={(e) => handleArgChange(input.name, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-4 bg-vivid-indigo/5 rounded-lg border border-vivid-indigo/10">
                            <div className="space-y-2 text-xs text-slate-400">
                                <div className="flex justify-between">
                                    <span>Network:</span>
                                    <span className="text-slate-200">{chain?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Contract Name:</span>
                                    <span className="text-slate-200">{selectedContractName}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleDeployManual}
                            disabled={isDeployingAll}
                            className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Rocket size={20} />
                            Deploy Single
                        </button>
                    </div>

                    {/* RIGHT PANEL: Deploy All & Logs */}
                    <div className="space-y-6">
                        {/* Batch Action Card */}
                        <div className="glass-card p-6 border-cyber-cyan/20 bg-cyber-cyan/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Layers size={100} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">Batch Deployment</h3>
                            <p className="text-sm text-slate-400 mb-6 max-w-[80%]">
                                automatically deploy all system contracts in the correct order. Skips contracts that are already deployed and haven't changed.
                            </p>

                            <button
                                onClick={handleDeployAll}
                                disabled={isDeployingAll}
                                className="w-full bg-cyber-cyan text-obsidian py-3 rounded-lg font-bold hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeployingAll ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Processing Queue...
                                    </>
                                ) : (
                                    <>
                                        <Play size={18} fill="currentColor" />
                                        Deploy All Contracts
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Logs */}
                        <div className="glass-card p-4 h-[400px] overflow-y-auto font-mono text-xs space-y-2 flex flex-col-reverse">
                            {deploymentLogs.length === 0 && (
                                <div className="text-center text-slate-600 italic py-10">
                                    Activity logs will appear here...
                                </div>
                            )}
                            {[...deploymentLogs].reverse().map((log, i) => (
                                <div key={i} className={`p-2 rounded ${log.includes('Success') ? 'bg-emerald-500/10 text-emerald-300' : log.includes('Error') || log.includes('Failed') ? 'bg-rose-500/10 text-rose-300' : log.includes('Skipping') ? 'bg-yellow-500/10 text-yellow-300' : 'text-slate-300'}`}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Deployed Contracts List */
                <div className="text-xs text-slate-500 font-mono mt-4">
                    DEBUG: ChainID: {chain?.id} |
                    Storage Key: deployments_{chain?.id} |
                    Found in Storage: {localStorage.getItem(`deployments_${chain?.id}`) ? 'YES' : 'NO'} |
                    State Count: {Object.keys(deployedContracts).length}
                </div>
            }
            {isConnected && Object.keys(deployedContracts).length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-400" />
                        Active Deployments ({chain?.name})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(deployedContracts).sort((a, b) => b[1].timestamp - a[1].timestamp).map(([name, data]) => (
                            <div key={name} className="p-4 bg-obsidian/40 border border-white/5 rounded-xl hover:border-cyber-cyan/30 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-200">{name}</h4>
                                    <span className="text-[10px] text-slate-500 bg-black/40 px-2 py-0.5 rounded-full">
                                        {new Date(data.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="font-mono text-xs text-slate-400">
                                        {data.address.slice(0, 6)}...{data.address.slice(-4)}
                                    </span>
                                    <a
                                        href={`${chain?.blockExplorers?.default.url}/address/${data.address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-cyber-cyan hover:text-cyan-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        View <SkipForward size={10} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Add type safety for deployments
declare global {
    interface Window {
        ethereum?: any;
    }
}

