import dotenv from "dotenv";
dotenv.config();

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY!}`);

export const walletClient = (chainId: number) => createWalletClient({
  account,
  transport: http(chainId === 11155111 ? process.env.SEPOLIA_RPC_URL! : process.env.BASE_SEPOLIA_RPC_URL!),
});
