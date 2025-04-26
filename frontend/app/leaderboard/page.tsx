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
  const router = useRouter();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaderboard`);
        const data = await res.json();
        setPlayers(data.data.slice(0, 10));
      } catch (error) {
        console.error(error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-24 relative overflow-hidden">
      <Card className="z-10 w-full max-w-md bg-white border border-gray-300 shadow-xl rounded-3xl p-6 sm:p-10">
        <CardContent className="flex flex-col items-center">
          <h1
            id="leaderboard-title"
            className="text-lg sm:text-xl md:text-2xl font-medium mb-8 text-gray-800 text-center"
          >
            🏆 Top Riddlers
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {players.length > 0 ? (
              players.map((player, index) => (
                <Card
                  key={player.user}
                  className="bg-white border border-gray-200 shadow-md hover:scale-[1.03] transition-transform rounded-2xl text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="text-2xl font-bold text-pink-500 dark:text-pink-400 flex items-center gap-2 mb-2">
                      #{index + 1} {index === 0 && "👑"}
                      {index === 1 && "🥈"}
                      {index === 2 && "🥉"}
                    </div>
                    <div className="text-base font-semibold break-words">
                      {player.user.slice(0, 6)}...{player.user.slice(-4)}
                    </div>
                    <div className="mt-1 text-sm text-purple-500 dark:text-purple-300">
                      {player.totalWins} Wins
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center col-span-full">
                No players yet...
              </p>
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
