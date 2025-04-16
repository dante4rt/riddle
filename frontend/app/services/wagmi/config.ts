import {
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { http } from 'viem';
import {
    baseSepolia,
    sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Riddle',
    projectId: "PROJECT_ID",
    chains: [baseSepolia, sepolia],
    transports: {
        [baseSepolia.id]: http(),
        [sepolia.id]: http()
    },
});