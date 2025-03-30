import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
    mainnet,
    sepolia,
} from 'wagmi/chains';
import { http } from 'viem';

export const config = getDefaultConfig({
    appName: 'Riddle',
    projectId: 'YOUR_PROJECT_ID',
    chains: [mainnet, sepolia],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http()
    },
});