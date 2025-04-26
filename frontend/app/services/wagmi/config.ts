import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { http } from "viem";
import { baseSepolia, liskSepolia, megaethTestnet, monadTestnet, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
    appName: "Riddle",
    projectId: "PROJECT_ID",
    chains: [
        sepolia,
        baseSepolia,
        { ...liskSepolia, iconUrl: "/chains/LiskSepolia.svg" },
        { ...monadTestnet, iconUrl: "/chains/Monad.svg" },
        {
            ...megaethTestnet,
            iconUrl: "/chains/MegaETH.png",
        },
    ],
    transports: {
        [sepolia.id]: http(),
        [baseSepolia.id]: http(),
        [liskSepolia.id]: http(),
        [monadTestnet.id]: http(),
        [megaethTestnet.id]: http(),
    },
});
