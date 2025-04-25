import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useBlockNumber,
  useChainId,
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { WalletAuth } from "../../components/wallet-auth";
import { ABI } from "../constants/ABI";
import { CONTRACT_ADDRESSES } from "../constants/config";
import Keyboard from "./keyboard";

export default function GameBoard() {
  const { isConnected, address } = useAccount();
  const [gameStarted, setGameStarted] = useState(false);
  const [guessStatuses, setGuessStatuses] = useState<string[][]>([]);
  const [wordHash, setWordHash] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reward, setReward] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [flippingRow, setFlippingRow] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chainId = useChainId();
  const rewards = Array.from({ length: 10 }, (_, i) => 0.005 + i * 0.0005); // 0.005 to 0.01 ETH

  const [animationStates, setAnimationStates] = useState<boolean[][]>(
    Array(6)
      .fill(0)
      .map(() => Array(5).fill(false))
  );

  const CONTRACT_ADDRESS =
    chainId in CONTRACT_ADDRESSES
      ? CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
      : undefined;

  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: lastClaimBlock, refetch: refetchLastClaim } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ABI,
    functionName: "lastClaimBlock",
    args: [address],
    chainId,
  });
  const { writeContract: claim, isPending: isClaiming, data: claimHash } = useWriteContract();
  const { data: claimReceipt, isLoading: isWaitingForClaim } = useWaitForTransactionReceipt({
    hash: claimHash,
    chainId,
  });
  const {
    sendTransaction: sendDonation,
    isPending: isDonating,
    data: donateHash,
  } = useSendTransaction();
  const { data: donateReceipt, isLoading: isWaitingForDonate } = useWaitForTransactionReceipt({
    hash: donateHash,
    chainId,
  });
  const { data: balance } = useBalance({
    address,
  });

  const resetGameState = () => {
    setWordHash("");
    setGuesses([]);
    setGuessStatuses([]);
    setCurrentGuess("");
    setGameOver(false);
    setGameWon(false);
    setReward(0);
    setIsModalOpen(false);
    setIsSpinning(false);
    setFlippingRow(null);
    setAnimationStates(
      Array(6)
        .fill(0)
        .map(() => Array(5).fill(false))
    );
  };

  const startGame = async () => {
    if (!canPlay() || !address) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/words/random?user=${address}`);
      const data = await res.json();

      resetGameState();
      setWordHash(data.hash);
      setGameStarted(true);

      if (inputRef.current) inputRef.current.focus();
    } catch (err) {
      console.error("Failed to start game:", err);
      toast.error("Error starting game");
    }
  };

  const handleKeyPress = async (key: string) => {
    if (gameOver || !gameStarted || flippingRow !== null) return;

    const normalizedKey = key.toUpperCase();
    if (normalizedKey === "ENTER") {
      if (currentGuess.length !== 5) {
        toast.error("Word must be 5 letters");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/words/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: address,
            guess: currentGuess,
          }),
        });

        const { correct, status } = await res.json();

        const newGuesses = [...guesses, currentGuess];
        const rowIndex = newGuesses.length - 1;

        setGuesses(newGuesses);
        setGuessStatuses([...guessStatuses, status]);
        setCurrentGuess("");

        setFlippingRow(rowIndex);

        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            setAnimationStates((prevStates) => {
              const newStates = [...prevStates];
              newStates[rowIndex][i] = true;
              return newStates;
            });
          }, i * 200);
        }

        setTimeout(() => {
          setFlippingRow(null);

          if (correct) {
            setGameWon(true);
            setGameOver(true);
            toast.success("You won! 🎉", { duration: 5000 });
          } else if (newGuesses.length >= 6) {
            setGameOver(true);
            toast.error("Game over!", { duration: 5000 });
          }
        }, 5 * 200 + 300);
      } catch (err) {
        console.error("Guess check failed:", err);
        toast.error("Error checking guess");
      }
    } else if (normalizedKey === "BACKSPACE") {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(normalizedKey)) {
      setCurrentGuess(currentGuess + normalizedKey);
    }
  };
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

  const getLetterStatus = (rowIndex: number, colIndex: number) => {
    return guessStatuses[rowIndex]?.[colIndex] || "default";
  };

  const claimReward = async () => {
    if (!address || !reward) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: address, chainId }),
      });

      if (res.ok) {
        const { success, txHash } = await res.json();

        if (txHash && success) {
          claim({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ABI,
            functionName: "claimReward",
            args: [parseEther(reward.toString())],
            chainId,
          });
        }
      } else {
        const { error } = await res.json();
        toast.error(`Error: ${error}`);
      }
    } catch (error) {
      console.error("Guess claim rewards:", error);
      toast.error("Error claiming rewards");
    }
  };

  const handleDonation = () => {
    if (!address || !CONTRACT_ADDRESS || !donationAmount) return;

    try {
      const amountInWei = parseEther(donationAmount);

      sendDonation({
        to: CONTRACT_ADDRESS as `0x${string}`,
        value: amountInWei,
      });

      toast.info("Processing donation...");
      setDonationAmount("");
    } catch (error) {
      console.error("Donation failed:", error);
      toast.error("Failed to process donation");
    }
  };

  useEffect(() => {
    if (donateReceipt?.status === "success") {
      toast.success("Donation has been sent!");
      setIsDonationModalOpen(false);
    }
  }, [donateReceipt]);

  useEffect(() => {
    if (claimReceipt?.status === "success") {
      toast.success(`Claimed ${reward} ETH!`);

      setIsModalOpen(false);
      refetchLastClaim();
      resetGameState();
      setGameStarted(false);
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
  }, [gameOver, gameStarted, currentGuess, guesses, wordHash, flippingRow]);

  useEffect(() => {
    if (gameStarted && inputRef.current) inputRef.current.focus();
  }, [gameStarted, currentGuess]);

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
                  <div>
                    <Dialog open={isDonationModalOpen} onOpenChange={setIsDonationModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-100 hover:bg-blue-200 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                          Support With Donation
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%]">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-20 w-24 h-24 z-10">
                          <DotLottieReact
                            src="dance.lottie"
                            loop
                            autoplay
                            className="w-full h-full object-contain cursor-pointer"
                          />
                        </div>
                        <DialogHeader>
                          <DialogTitle className="text-center font-bold text-xl">
                            Contribute to the Prize Pool
                          </DialogTitle>
                          <DialogDescription className="text-justify">
                            Your donation will go directly to the prize pool. Thanks for supporting
                            the players! ❤️
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                              Amount
                            </Label>
                            <div className="col-span-3 relative">
                              <Input
                                id="amount"
                                type="number"
                                step="0.001"
                                min="0.001"
                                placeholder="0.01"
                                value={donationAmount}
                                onChange={(e) => setDonationAmount(e.target.value)}
                                className="pl-2 pr-16"
                              />
                              <div className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-500">
                                {balance?.symbol || "ETH"}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            Balance:{" "}
                            {balance
                              ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
                              : "Loading..."}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={handleDonation}
                            disabled={
                              isDonating ||
                              !donationAmount ||
                              Number(donationAmount) <= 0 ||
                              isWaitingForDonate
                            }
                            className="bg-green-200 hover:bg-green-300 text-gray-800 cursor-pointer"
                          >
                            {isWaitingForDonate || isDonating ? "Processing..." : "Donate"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
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
                                const status = getLetterStatus(rowIndex, colIndex);
                                bgColor =
                                  status === "correct"
                                    ? "bg-green-200"
                                    : status === "present"
                                    ? "bg-yellow-200"
                                    : status === "absent"
                                    ? "bg-gray-300"
                                    : "bg-gray-100";
                              }

                              const isFlipping = animationStates[rowIndex]?.[colIndex];

                              return (
                                <div key={colIndex} className="relative w-full aspect-square">
                                  <div
                                    className={`w-full h-full transition-transform duration-500 transform-gpu ${
                                      isFlipping ? "rotate-y-180" : ""
                                    }`}
                                    style={{
                                      transformStyle: "preserve-3d",
                                    }}
                                  >
                                    <div
                                      className={`absolute w-full h-full backface-hidden bg-gray-100 flex items-center justify-center text-base sm:text-lg md:text-xl font-bold rounded border-2 border-gray-200 ${
                                        !isFlipping ? "" : "invisible"
                                      }`}
                                      style={{
                                        backfaceVisibility: "hidden",
                                      }}
                                    >
                                      {letter}
                                    </div>

                                    <div
                                      className={`absolute w-full h-full backface-hidden ${bgColor} flex items-center justify-center text-base sm:text-lg md:text-xl font-bold rounded border-2 border-gray-200 ${
                                        isFlipping ? "" : "invisible"
                                      }`}
                                      style={{
                                        backfaceVisibility: "hidden",
                                        transform: "rotateY(180deg)",
                                      }}
                                    >
                                      {letter}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ))}
                  </div>
                  <div className="absolute -top-2 right-0 -translate-y-full pt-2 sm:pt-3">
                    <Popover>
                      <PopoverTrigger asChild className="dark:bg-white">
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

                <Keyboard onKeyPress={handleKeyPress} guesses={guesses} targetWord={wordHash} />

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 w-full max-w-[16rem] sm:max-w-[20rem] md:max-w-[24rem] flex-wrap">
                  {gameWon && (
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
                              onClick={claimReward}
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
                      onClick={async () => {
                        resetGameState();
                        await startGame();
                      }}
                      className="w-full bg-purple-200 hover:bg-purple-300 text-gray-800 font-bold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                      disabled={!canPlay()}
                    >
                      {canPlay() ? "Play Again" : `Play Again in ${getCooldownTime()}`}
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      resetGameState();
                      setGameStarted(false);
                    }}
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
