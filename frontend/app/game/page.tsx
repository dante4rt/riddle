"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import GameBoard from "./GameBoard";

export default function GamePage() {
  const { address } = useAccount();
  const router = useRouter();

  useEffect(() => {
    const savedVerification = localStorage.getItem("walletAuth");

    if (!savedVerification) {
      router.push("/");
      return;
    }

    const parsed = JSON.parse(savedVerification);
    if (!parsed || parsed.address !== address || !parsed.verified) {
      router.push("/");
    }
  }, [address, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 py-24 md:px-24 h-dvh overflow-x-hidden">
      <GameBoard />
    </main>
  );
}
