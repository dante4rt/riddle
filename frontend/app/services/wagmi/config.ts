import {
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { http } from 'viem';
import {
    baseSepolia,
    liskSepolia,
    sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Riddle',
    projectId: "PROJECT_ID",
    chains: [sepolia, baseSepolia, liskSepolia],
    transports: {
        [sepolia.id]: http(),
        [baseSepolia.id]: http(),
        [liskSepolia.id]: http(),
    },
});