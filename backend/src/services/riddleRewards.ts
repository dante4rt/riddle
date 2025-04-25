import { parseAbi } from "viem";
import { baseSepolia, liskSepolia, megaethTestnet, monadTestnet, sepolia } from "viem/chains";
import { CONTRACT_ADDRESSES } from "../constants/config";
import { walletClient } from "../utils/web3";

const ABI = parseAbi(["function markAsWinner(address user) external"]);

const CHAIN_MAP = {
  11155111: sepolia,
  4202: liskSepolia,
  10143: monadTestnet,
  84532: baseSepolia,
  6342: megaethTestnet
};

export async function markWinner(user: string, chainId: number) {
  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  if (!contractAddress) {
    throw new Error(`No contract address found for chain ID ${chainId}`);
  }

  const chain = CHAIN_MAP[chainId as keyof typeof CHAIN_MAP];

  const tx = await walletClient(chainId).writeContract({
    address: contractAddress as `0x${string}`,
    abi: ABI,
    functionName: "markAsWinner",
    args: [user as `0x${string}`],
    chain,
  });

  return tx;
}