"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import Keyboard from "./keyboard";
import { WalletAuth } from "./wallet-auth";

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
  const [message, setMessage] = useState("");

  const startGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess("");
    setGameStarted(true);
    setGameOver(false);
    setMessage("");
  };

  const handleKeyPress = (key: string) => {
    if (gameOver) return;

    if (key === "ENTER") {
      if (currentGuess.length !== 5) {
        setMessage("Word must be 5 letters");
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");

      if (currentGuess === targetWord) {
        setGameOver(true);
        setMessage("You won! 🎉");
      } else if (newGuesses.length >= 6) {
        setGameOver(true);
        setMessage(`Game over! The word was ${targetWord}`);
      }
    } else if (key === "BACKSPACE") {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(currentGuess + key);
    }
  };

  const getLetterStatus = (letter: string, index: number, _: string) => {
    if (targetWord[index] === letter) {
      return "correct";
    } else if (targetWord.includes(letter)) {
      return "present";
    } else {
      return "absent";
    }
  };

  return (
    <>
      {!gameStarted && (
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-purple-400 mb-6 md:mb-8 drop-shadow-lg tracking-wide animated-title">
          Ready to Riddle? Your Web3 Wordle Adventure Awaits!
        </h1>
      )}

      <div className="flex flex-col items-center w-full px-4 md:px-0">
        {isConnected ? (
          <>
            {!gameStarted ? (
              <div className="text-center p-4 md:p-6 bg-purple-50 rounded-lg shadow-md">
                <p className="text-lg md:text-xl text-gray-700 font-medium">
                  Dive into Web3 Wordle – a blockchain twist on the classic game.
                </p>
                <WalletAuth />
                <Button
                  onClick={startGame}
                  className="bg-green-200 hover:bg-green-300 text-gray-800 font-bold py-2 px-6 md:px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 mt-4 md:mt-6 cursor-pointer"
                >
                  Start Game
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-rows-6 gap-1 mb-4 w-full max-w-[20rem] sm:max-w-[24rem]">
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
                              const status = getLetterStatus(
                                guessedLetter,
                                colIndex,
                                guesses[rowIndex]
                              );
                              if (status === "correct") bgColor = "bg-green-200";
                              else if (status === "present") bgColor = "bg-purple-200";
                              else bgColor = "bg-gray-300";
                            }

                            return (
                              <div
                                key={colIndex}
                                className={`${bgColor} w-full aspect-square flex items-center justify-center text-lg md:text-xl font-bold rounded border-2 border-gray-200 hover:scale-105 transition-transform`}
                              >
                                {letter}
                              </div>
                            );
                          })}
                      </div>
                    ))}
                </div>

                {message && (
                  <div className="mb-4 text-center font-medium text-purple-500 text-sm md:text-base">
                    🎉 {message}
                  </div>
                )}

                <Keyboard onKeyPress={handleKeyPress} guesses={guesses} targetWord={targetWord} />

                {gameOver && (
                  <Button
                    onClick={startGame}
                    className="bg-green-200 hover:bg-green-300 text-gray-800 font-bold py-2 px-6 md:px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 mt-4"
                  >
                    Play Again
                  </Button>
                )}

                <Button
                  onClick={() => setGameStarted(false)}
                  className="bg-blue-200 hover:bg-blue-300 text-gray-800 font-bold py-2 px-6 md:px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 mt-4 cursor-pointer"
                >
                  Back
                </Button>
              </>
            )}
          </>
        ) : (
          <div className="text-center p-4 md:p-6 bg-purple-50 rounded-lg shadow-md">
            <p className="text-lg md:text-xl text-gray-700 font-medium">
              Connect your wallet on the homepage to play!
            </p>
            <p className="text-sm md:text-base text-gray-500">Redirecting to authenticate...</p>
          </div>
        )}
      </div>
    </>
  );
}
