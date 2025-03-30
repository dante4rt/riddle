"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Keyboard from "./keyboard";
import { WalletAuth } from "../components/wallet-auth";

const WORDS = [
  "REACT",
  "VITEM",
  "WAGMI",
  "BLOCK",
  "CHAIN",
  "TOKEN",
  "SMART",
  "DAPPS",
  "NODES",
  "MINER",
];

export default function GameBoard() {
  const { isConnected } = useAccount();
  const [gameStarted, setGameStarted] = useState(false);
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess("");
    setGameStarted(true);
    setGameOver(false);
  };

  const handleKeyPress = (key: string) => {
    if (gameOver || !gameStarted) return;

    if (key === "Enter") {
      if (currentGuess.length !== 5) {
        toast.error("Word must be 5 letters");
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");

      if (currentGuess === targetWord) {
        setGameOver(true);
        toast.success("You won! 🎉", { duration: 5000 });
      } else if (newGuesses.length >= 6) {
        setGameOver(true);
        toast.error(`Game over! The word was ${targetWord}`, { duration: 5000 });
      }
    } else if (key === "Backspace") {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key.toUpperCase())) {
      setCurrentGuess(currentGuess + key.toUpperCase());
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === "Enter" || key === "Backspace" || /^[a-zA-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, gameStarted, currentGuess, guesses, targetWord]);

  const getLetterStatus = (letter: string, index: number) => {
    if (targetWord[index] === letter) {
      return "correct";
    } else if (targetWord.includes(letter)) {
      return "present";
    } else {
      return "absent";
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen px-4 py-6 sm:px-6 md:px-8">
      {!gameStarted && (
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-purple-400 mb-4 sm:mb-6 md:mb-8 drop-shadow-lg tracking-wide animated-title pt-12 md:pt-16 lg:pt-24">
          Ready to Riddle? Your Web3 Wordle Awaits!
        </h1>
      )}

      <div className="flex flex-col items-center w-full max-w-md space-y-4 sm:space-y-6">
        {isConnected ? (
          <>
            {!gameStarted ? (
              <Card className="w-full bg-purple-50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium text-center">
                    Web3 Wordle – Blockchain Edition
                  </CardTitle>
                  <WalletAuth />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-3 rounded-md shadow-inner">
                    <p className="text-sm sm:text-base text-gray-800 font-semibold mb-2">
                      How to Play 👇
                    </p>
                    <ul className="text-xs sm:text-sm text-gray-600 list-inside space-y-1 list-none">
                      <li>
                        <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-green-200 rounded mr-1"></span>
                        Green: Right letter, right spot
                      </li>
                      <li>
                        <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-yellow-200 rounded mr-1"></span>
                        Yellow: Right letter, wrong spot
                      </li>
                      <li>
                        <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-gray-300 rounded mr-1"></span>
                        Gray: Letter not in word
                      </li>
                      <li>Goal: Guess the 5-letter word in 6 tries</li>
                      <li>Lose: 6 wrong guesses – find it fast!</li>
                    </ul>
                  </div>
                  <Button
                    onClick={startGame}
                    className="w-full bg-green-200 hover:bg-green-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Start Game
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-rows-6 gap-1 mb-4 w-full max-w-[16rem] sm:max-w-[20rem] md:max-w-[24rem]">
                  {Array(6)
                    .fill(0)
                    .map((_, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-5 gap-1">
                        {Array(5)
                          .fill(0)
                          .map((_, colIndex) => {
                            const guessedLetter = guesses[rowIndex]?.[colIndex] || "";
                            const currentLetter =
                              rowIndex === guesses.length && colIndex < currentGuess.length
                                ? currentGuess[colIndex]
                                : "";
                            const letter = guessedLetter || currentLetter;

                            let bgColor = "bg-gray-100";
                            if (guessedLetter) {
                              const status = getLetterStatus(guessedLetter, colIndex);
                              if (status === "correct") bgColor = "bg-green-200";
                              else if (status === "present") bgColor = "bg-yellow-200";
                              else bgColor = "bg-gray-300";
                            }

                            return (
                              <div
                                key={colIndex}
                                className={`${bgColor} w-full aspect-square flex items-center justify-center text-base sm:text-lg md:text-xl font-bold rounded border-2 border-gray-200 hover:scale-105 transition-transform`}
                              >
                                {letter}
                              </div>
                            );
                          })}
                      </div>
                    ))}
                </div>

                <Keyboard onKeyPress={handleKeyPress} guesses={guesses} targetWord={targetWord} />

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 w-full flex-wrap">
                  {gameOver && (
                    <Button
                      onClick={startGame}
                      className="w-full bg-green-200 hover:bg-green-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Play Again
                    </Button>
                  )}
                  <Button
                    onClick={() => setGameStarted(false)}
                    className="w-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <Card className="w-full bg-purple-50 shadow-md">
            <CardContent className="pt-6 text-center">
              <p className="text-lg sm:text-xl text-gray-700 font-medium">
                Connect your wallet on the homepage to play!
              </p>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Redirecting to authenticate...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
