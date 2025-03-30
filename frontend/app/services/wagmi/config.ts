import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
    baseSepolia,
    sepolia,
} from 'wagmi/chains';
import { http } from 'viem';

export const config = getDefaultConfig({
    appName: 'Riddle',
    projectId: "PROJECT_ID",
    chains: [baseSepolia, sepolia],
    transports: {
        [baseSepolia.id]: http(),
        [sepolia.id]: http()
    },
});