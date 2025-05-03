import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/animated.modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type Balance = { decimals: number; formatted: string; symbol: string; value: bigint };

interface DonationModalProps {
  donationAmount: string;
  setDonationAmount: (amount: string) => void;
  balance: Balance | undefined;
  isDonating: boolean;
  isWaitingForDonate: boolean;
  handleDonation: () => void;
}

export function DonationModal({
  donationAmount,
  setDonationAmount,
  balance,
  isDonating,
  isWaitingForDonate,
  handleDonation,
}: DonationModalProps) {
  return (
    <Modal>
      <ModalTrigger>
        <button className="btn w-full bg-blue-600 hover:bg-blue-700 text-gray-800 font-bold  rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
          <span className="animation absolute left-4"></span>
          <span>Support With Donation</span>
          <span className="animation absolute right-4"></span>
        </button>
      </ModalTrigger>

      <ModalBody>
        <ModalContent className="relative px-6 py-6 max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-5">
              <DotLottieReact
                src="dance.lottie"
                loop
                autoplay
                className="w-28 h-28 object-contain"
              />
              <h2 className="font-bold text-2xl text-gray-900 dark:text-white mt-2">
                Contribute to the Prize Pool
              </h2>
              <div className="h-1 w-16 bg-purple-400 rounded-full my-3"></div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                Your donation will go directly to the prize pool. Thanks for supporting the players!
                ❤️
              </p>
            </div>

            <div className="w-full max-w-xs mt-4">
              <Label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Donation Amount
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="0.01"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="pl-3 pr-16 py-3 text-gray-900 dark:text-white bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 rounded-lg w-full focus:ring-2 focus:ring-purple-400"
                />
                <div className="absolute inset-y-0 right-3 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {balance?.symbol || "ETH"}
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400 px-1">
                <span>Available:</span>
                <span className="font-medium">
                  {balance
                    ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
                    : "Loading..."}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-5 w-full max-w-xs">
              {["0.01", "0.05", "0.1"].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDonationAmount(amount)}
                  className={`px-4 py-2 rounded-md text-sm transition-all cursor-pointer ${
                    donationAmount === amount
                      ? "bg-purple-100 text-purple-700 font-medium border-2 border-purple-400 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {amount} {balance?.symbol || "ETH"}
                </button>
              ))}
            </div>
          </div>
        </ModalContent>
        <ModalFooter className="bg-gray-50 dark:bg-neutral-900 py-4">
          <button
            type="submit"
            onClick={handleDonation}
            disabled={
              isDonating || !donationAmount || Number(donationAmount) <= 0 || isWaitingForDonate
            }
            className="btn w-full mx-auto min-w-[220px]"
            style={{
              background:
                isDonating || !donationAmount || Number(donationAmount) <= 0 || isWaitingForDonate
                  ? "#a0aec0"
                  : "#8E44AD",
            }}
          >
            <span className="animation absolute left-4"></span>
            <span>{isWaitingForDonate || isDonating ? "Processing..." : "Donate Now"}</span>
            <span className="animation absolute right-4"></span>
            {!(
              isDonating ||
              !donationAmount ||
              Number(donationAmount) <= 0 ||
              isWaitingForDonate
            ) && <span className="animation absolute right-4"></span>}
          </button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
}
