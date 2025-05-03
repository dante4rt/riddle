import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/animated.modal";
import { Button } from "@/components/ui/button";
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
      <ModalTrigger>Support With Donation</ModalTrigger>

      <ModalBody>
        <ModalContent className="relative px-6 py-8">
          <div className="flex justify-center items-center mb-4">
            <DotLottieReact
              src="dance.lottie"
              loop
              autoplay
              className="w-full h-full object-contain cursor-pointer"
            />
          </div>

          <h2 className="text-center font-bold text-xl">Contribute to the Prize Pool</h2>
          <p className="text-justify text-sm mt-2">
            Your donation will go directly to the prize pool. Thanks for supporting the players! ❤️
          </p>

          <div className="grid gap-4 py-6">
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
              {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : "Loading..."}
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            type="submit"
            onClick={handleDonation}
            disabled={
              isDonating || !donationAmount || Number(donationAmount) <= 0 || isWaitingForDonate
            }
            className="bg-green-200 hover:bg-green-300 text-gray-800 cursor-pointer"
          >
            {isWaitingForDonate || isDonating ? "Processing..." : "Donate"}
          </Button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
}
