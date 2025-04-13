import { getContractInstance } from '../config/contract';

export const markUserAsWinner = async (
  walletAddress: string
): Promise<boolean> => {
  try {
    const contract = getContractInstance();
    const tx = await contract.markAsWinner(walletAddress);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error marking user as winner:', error);
    throw new Error('Failed to mark user as winner on the blockchain');
  }
};

export const checkUserEligibility = async (
  walletAddress: string
): Promise<boolean> => {
  try {
    const contract = getContractInstance();
    return await contract.eligibleToClaim(walletAddress);
  } catch (error) {
    console.error('Error checking user eligibility:', error);
    throw new Error('Failed to check user eligibility on the blockchain');
  }
};

export const getLastClaimBlock = async (
  walletAddress: string
): Promise<number> => {
  try {
    const contract = getContractInstance();
    const lastBlock = await contract.lastClaimBlock(walletAddress);
    return lastBlock.toNumber();
  } catch (error) {
    console.error('Error getting last claim block:', error);
    throw new Error('Failed to get last claim block from the blockchain');
  }
};
