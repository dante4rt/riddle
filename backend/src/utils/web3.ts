import dotenv from "dotenv";
import { RPC_URLs } from "../constants/config";

dotenv.config();

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY!}`);

export const walletClient = (chainId: number) => {
  const RPC_URL = chainId in RPC_URLs ? RPC_URLs[chainId as keyof typeof RPC_URLs] : undefined;

  return createWalletClient({
    account,
    transport: http(RPC_URL),
  })
};
