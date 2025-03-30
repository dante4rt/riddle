"use client";

import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
  useBlockNumber,
  useConfig,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { parseEther } from "viem";
import Keyboard from "./keyboard";
import { WalletAuth } from "../../components/wallet-auth";
import { ABI } from "../constants/ABI";
import { CONTRACT_ADDRESSES } from "../constants/config";

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
  const { isConnected, address } = useAccount();
  const [gameStarted, setGameStarted] = useState(false);
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reward, setReward] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { chains } = useConfig();
  const CONTRACT_ADDRESS = (() => {
    interface Chain {
      id: number;
    }

    const activeChain: Chain | undefined = chains.find(
      (chain: Chain): boolean => chain.id in CONTRACT_ADDRESSES
    );
    return activeChain
      ? CONTRACT_ADDRESSES[activeChain.id as keyof typeof CONTRACT_ADDRESSES]
      : undefined;
  })() as `0x${string}` | undefined;

  const { data: lastClaimBlock, refetch: refetchLastClaim } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ABI,
    functionName: "lastClaimBlock",
    args: [address],
  });
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const startGame = () => {
    if (!canPlay()) return;
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess("");
    setGameStarted(true);
    setGameOver(false);
    setReward(0);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyPress = (key: string) => {
    if (gameOver || !gameStarted) return;

    const normalizedKey = key.toUpperCase();
    if (normalizedKey === "ENTER") {
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
    } else if (normalizedKey === "BACKSPACE") {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(normalizedKey)) {
      setCurrentGuess(currentGuess + normalizedKey);
    }
  };

  const { writeContract: claim, isPending: isClaiming, data: claimHash } = useWriteContract();
  const { data: claimReceipt, isLoading: isWaitingForClaim } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const rewards = Array.from({ length: 10 }, (_, i) => 0.005 + i * 0.0005); // 0.005 to 0.01 ETH
  const spinWheel = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * 10);
      const selectedReward = rewards[randomIndex];
      setReward(selectedReward);
      setIsSpinning(false);
    }, 3000);
  };

  const canPlay = () => {
    if (!lastClaimBlock || lastClaimBlock === BigInt(0) || !blockNumber) return true;
    const blocksSinceClaim = Number(blockNumber) - Number(lastClaimBlock);
    return blocksSinceClaim >= 7200;
  };

  const getCooldownTime = () => {
    if (!lastClaimBlock || lastClaimBlock === BigInt(0) || !blockNumber || canPlay()) return null;
    const blocksRemaining = 7200 - (Number(blockNumber) - Number(lastClaimBlock));
    const secondsRemaining = blocksRemaining * 12;
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    if (claimReceipt?.status === "success") {
      toast.success(`Claimed ${reward} ETH!`);
      setIsModalOpen(false);
      refetchLastClaim();
    }
  }, [claimReceipt]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === "Enter" || key === "Backspace" || /^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
        handleKeyPress(key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, gameStarted, currentGuess, guesses, targetWord]);

  useEffect(() => {
    if (gameStarted && inputRef.current) inputRef.current.focus();
  }, [gameStarted, currentGuess]);

  const getLetterStatus = (letter: string, index: number) => {
    if (targetWord[index] === letter) return "correct";
    if (targetWord.includes(letter)) return "present";
    return "absent";
  };

  return (
    <div className="flex flex-col items-center w-full py-4 md:py-6 lg:py-0 px-6 md:px-8 lg:px-4">
      <input
        ref={inputRef}
        type="text"
        value={currentGuess}
        onChange={(e) => {
          const value = e.target.value.toUpperCase();
          if (/^[A-Z]*$/.test(value) && value.length <= 5) setCurrentGuess(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Backspace") {
            e.preventDefault();
            handleKeyPress(e.key);
          }
        }}
        className="absolute opacity-0 pointer-events-none"
        autoCapitalize="characters"
        autoComplete="off"
      />

      {!gameStarted && (
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-purple-400 mb-4 sm:mb-6 md:mb-8 drop-shadow-lg tracking-wide">
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
                    <p className="text-sm sm:text-base text-gray-800 font-semibold">How to Play:</p>
                    <ul className="text-xs sm:text-sm text-gray-600 list-disc list-inside space-y-1">
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
                  {canPlay() ? (
                    <Button
                      onClick={startGame}
                      className="w-full bg-green-200 hover:bg-green-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      Start Game
                    </Button>
                  ) : (
                    <div className="text-center">
                      <Button
                        disabled
                        className="w-full bg-gray-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md cursor-not-allowed"
                      >
                        Can play again in {getCooldownTime()}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="relative w-full max-w-[16rem] sm:max-w-[20rem] md:max-w-[20rem] mb-4">
                  <div className="grid grid-rows-6 gap-1 w-full">
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
                                bgColor =
                                  status === "correct"
                                    ? "bg-green-200"
                                    : status === "present"
                                    ? "bg-yellow-200"
                                    : "bg-gray-300";
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
                  <div className="absolute -top-2 right-0 -translate-y-full pt-2 sm:pt-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full text-xs sm:text-sm cursor-pointer"
                        >
                          ?
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 sm:w-72 p-4 bg-white shadow-lg rounded-md">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">
                          Game Rules
                        </h3>
                        <ul className="text-xs sm:text-sm text-gray-600 list-disc list-inside space-y-1">
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
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Keyboard onKeyPress={handleKeyPress} guesses={guesses} targetWord={targetWord} />

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 w-full max-w-[16rem] sm:max-w-[20rem] md:max-w-[24rem] flex-wrap">
                  {gameOver && (
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full bg-yellow-200 hover:bg-yellow-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                          onClick={() => setIsModalOpen(true)}
                          disabled={isClaiming || isWaitingForClaim || !canPlay()}
                        >
                          {isClaiming || isWaitingForClaim
                            ? "Loading..."
                            : !canPlay()
                            ? "Claimed"
                            : "Claim Reward"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white">
                        <h2 className="text-xl text-center">Spin the Wheel!</h2>
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-40 h-40 rounded-full border-8 border-gray-300 flex items-center justify-center text-lg font-bold transition-all duration-3000 ease-out ${
                              isSpinning ? "animate-spin" : ""
                            }`}
                            style={{
                              background: `conic-gradient(
                                from 0deg,
                                #ff9999 0% 10%,
                                #ffcc99 10% 20%,
                                #ffff99 20% 30%,
                                #ccff99 30% 40%,
                                #99ff99 40% 50%,
                                #99ffcc 50% 60%,
                                #99ffff 60% 70%,
                                #99ccff 70% 80%,
                                #9999ff 80% 90%,
                                #cc99ff 90% 100%
                              )`,
                            }}
                          >
                            {reward ? `${reward} ETH` : "Spin!"}
                          </div>
                          {reward ? (
                            <Button
                              className="mt-4 bg-green-200 hover:bg-green-300 cursor-pointer"
                              onClick={() =>
                                claim({
                                  address: CONTRACT_ADDRESS as `0x${string}`,
                                  abi: ABI,
                                  functionName: "claimReward",
                                  args: [parseEther(reward.toString())],
                                })
                              }
                              disabled={isClaiming || isWaitingForClaim}
                            >
                              {isClaiming || isWaitingForClaim ? "Claiming..." : "Claim Now"}
                            </Button>
                          ) : (
                            <Button
                              className="mt-4 bg-green-200 hover:bg-green-300 cursor-pointer"
                              onClick={spinWheel}
                              disabled={isSpinning}
                            >
                              {isSpinning ? "Spinning..." : "Spin"}
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {gameOver && (
                    <Button
                      onClick={startGame}
                      className="w-full bg-green-200 hover:bg-green-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                      disabled={!canPlay()}
                    >
                      {canPlay() ? "Play Again" : `Play Again in ${getCooldownTime()}`}
                    </Button>
                  )}
                  <Button
                    onClick={() => setGameStarted(false)}
                    className="w-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
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
