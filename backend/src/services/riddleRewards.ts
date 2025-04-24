import { parseAbi } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { CONTRACT_ADDRESSES } from "../constants/config";
import { walletClient } from "../utils/web3";

const ABI = parseAbi(["function markAsWinner(address user) external"]);

export async function markWinner(user: string, chainId: number) {
  const CONTRACT_ADDRESS =
    chainId in CONTRACT_ADDRESSES
      ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
      : undefined;

  const tx = await walletClient(chainId).writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ABI,
    functionName: "markAsWinner",
    args: [user as `0x${string}`],
    chain: chainId === 11155111 ? sepolia : baseSepolia,
  });

  return tx;
}
