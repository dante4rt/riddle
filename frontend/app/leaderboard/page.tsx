"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Player {
  user: string;
  totalWins: number;
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/leaderboard`);
        const data = await res.json();
        setPlayers(data.data.slice(0, 10));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-24 relative overflow-hidden">
      <Card className="z-10 w-full max-w-md bg-white border border-gray-300 shadow-xl rounded-3xl p-6 sm:p-10">
        <CardContent className="flex flex-col items-center w-full px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-2">
            🏆 Riddle Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
            Congrats to the top players! Solve riddles, earn your spot, and claim your glory.
          </p>

          <div className="flex flex-col w-full gap-3 overflow-y-auto max-h-64 pr-2">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-4 border-pink-300 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : players.length > 0 ? (
              players.map((player, index) => (
                <div
                  key={player.user}
                  className={`flex items-center justify-between w-full bg-white border ${
                    index === 0
                      ? "border-yellow-400"
                      : index === 1
                      ? "border-gray-400"
                      : index === 2
                      ? "border-orange-400"
                      : "border-gray-200"
                  } shadow-sm rounded-xl px-4 py-3 ${
                    index === 0
                      ? "text-yellow-600 font-bold text-lg"
                      : index === 1
                      ? "text-gray-600 font-semibold text-base"
                      : index === 2
                      ? "text-orange-500 font-semibold text-base"
                      : "text-gray-700 font-medium text-sm"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>#{index + 1}</span>
                    {index === 0 && "👑"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    <span className="ml-2">
                      {player.user.slice(0, 6)}...{player.user.slice(-4)}
                    </span>
                  </div>
                  <div className="text-right">{player.totalWins} Wins</div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 w-full">No players yet...</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-8 w-full max-w-[16rem] sm:max-w-[20rem] md:max-w-[24rem] flex-wrap">
            <Button
              onClick={() => router.push("/game")}
              className="w-full bg-pink-200 hover:bg-pink-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
