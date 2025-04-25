import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

type Balance = { decimals: number; formatted: string; symbol: string; value: bigint };

interface DonationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  donationAmount: string;
  setDonationAmount: (amount: string) => void;
  balance: Balance | undefined;
  isDonating: boolean;
  isWaitingForDonate: boolean;
  handleDonation: () => void;
}

export function DonationModal({
  isOpen,
  setIsOpen,
  donationAmount,
  setDonationAmount,
  balance,
  isDonating,
  isWaitingForDonate,
  handleDonation,
}: DonationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            Your donation will go directly to the prize pool. Thanks for supporting the players! ❤️
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
            {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : "Loading..."}
          </div>
        </div>
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
