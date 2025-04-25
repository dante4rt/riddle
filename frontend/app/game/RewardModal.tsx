import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowDown } from "lucide-react";
import { useState } from "react";

interface RewardModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  reward: number;
  setReward: (reward: number) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  isClaiming: boolean;
  isWaitingForClaim: boolean;
  claimReward: () => void;
  rewards: number[];
}

export function RewardModal({
  isOpen,
  setIsOpen,
  reward,
  setReward,
  isSpinning,
  setIsSpinning,
  isClaiming,
  isWaitingForClaim,
  claimReward,
  rewards = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1],
}: RewardModalProps) {
  const [rotationDegrees, setRotationDegrees] = useState(0);

  const spinWheel = () => {
    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * rewards.length);
    const segmentSize = 360 / rewards.length;
    const segmentRotation = 360 - (randomIndex * segmentSize + segmentSize / 2);
    const fullRotations = 1800 + Math.random() * 360;
    const finalRotation = fullRotations + segmentRotation;

    setRotationDegrees(finalRotation);

    setTimeout(() => {
      const selectedReward = rewards[randomIndex];
      setReward(selectedReward);
      setIsSpinning(false);
    }, 5000);
  };

  const formatEth = (value: number) => {
    if (!value) return "Spin!";
    return `${Number(value)
      .toFixed(6)
      .slice(0, value.toString().indexOf(".") + 5)} ETH`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-gradient-to-b from-indigo-50 to-blue-50 p-6 max-w-md mx-auto rounded-xl shadow-lg">
        <div className="relative">
          <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">Spin the Wheel!</h2>

          <div className="flex flex-col items-center">
            <div className="relative z-10 mb-2">
              <ArrowDown className="text-red-600 w-8 h-8 animate-bounce" />
            </div>

            <div className="relative w-64 h-64 mb-6">
              <div className="absolute top-2 w-60 h-60 rounded-full bg-black/20 blur-md"></div>

              <div
                className={`w-60 h-60 rounded-full border-8 border-yellow-600 flex items-center justify-center text-lg font-bold relative overflow-hidden shadow-inner`}
                style={{
                  background: `conic-gradient(
                    from 0deg,
                    #ff5252 0% 10%,
                    #ff9e40 10% 20%,
                    #ffeb3b 20% 30%,
                    #66bb6a 30% 40%,
                    #26c6da 40% 50%,
                    #42a5f5 50% 60%,
                    #5c6bc0 60% 70%,
                    #ab47bc 70% 80%,
                    #ec407a 80% 90%,
                    #ef5350 90% 100%
                  )`,
                  transform: `rotate(${rotationDegrees}deg)`,
                  transition: isSpinning ? "transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
                }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-0.5 bg-white/70 origin-center"
                    style={{ transform: `rotate(${i * 36}deg)` }}
                  />
                ))}

                <div className="absolute w-16 h-16 rounded-full bg-white border-4 border-yellow-600 z-10 flex items-center justify-center shadow-md">
                  {reward ? (
                    <span className="text-xs font-bold text-center">{formatEth(reward)}</span>
                  ) : (
                    <span className="text-sm font-bold text-center">ETH</span>
                  )}
                </div>
              </div>
            </div>

            {reward ? (
              <div className="flex flex-col items-center">
                <span className="font-bold">Reward: {formatEth(reward)}</span>
                <Button
                  className={`cursor-pointer mt-6 font-bold px-8 py-6 rounded-xl text-lg shadow-lg transform transition-all duration-200 ${
                    isClaiming || isWaitingForClaim
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-green-400 to-green-600 text-white hover:scale-105 hover:shadow-xl"
                  }`}
                  onClick={claimReward}
                  disabled={isClaiming || isWaitingForClaim}
                >
                  {isClaiming || isWaitingForClaim ? "Claiming..." : "Claim Your Prize!"}
                </Button>
              </div>
            ) : (
              <Button
                className={`mt-6 font-bold px-8 py-6 rounded-xl text-lg shadow-lg transform transition-all duration-200 ${
                  isSpinning
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-105 hover:shadow-xl"
                }`}
                onClick={spinWheel}
                disabled={isSpinning}
              >
                {isSpinning ? "Spinning..." : "Spin The Wheel"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
