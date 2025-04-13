import { walletClient } from "../utils/web3";
import { parseAbi } from "viem";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}`;

const ABI = parseAbi(["function markAsWinner(address user) external"]);

export async function markWinner(user: string) {
  const tx = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "markAsWinner",
    args: [user as `0x${string}`],
  });

  return tx;
}
