import { ethers } from 'ethers';

const ABI = [
  'function markAsWinner(address user) external',
  'function eligibleToClaim(address user) view returns (bool)',
  'function lastClaimBlock(address user) view returns (uint256)',
];

export const getContractInstance = () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
  return new ethers.Contract(
    process.env.CONTRACT_ADDRESS as string,
    ABI,
    wallet
  );
};
