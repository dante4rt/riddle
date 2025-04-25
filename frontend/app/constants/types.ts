export type GuessStatus = string[];

export interface GameState {
  gameStarted: boolean;
  guessStatuses: GuessStatus[];
  wordHash: string;
  guesses: string[];
  currentGuess: string;
  gameOver: boolean;
  gameWon: boolean;
  isModalOpen: boolean;
  reward: number;
  isSpinning: boolean;
  donationAmount: string;
  isDonationModalOpen: boolean;
  flippingRow: number | null;
  animationStates: boolean[][];
  setCurrentGuess: (guess: string) => void;
  setIsModalOpen: (open: boolean) => void;
  setReward: (reward: number) => void;
  setIsSpinning: (spinning: boolean) => void;
  setDonationAmount: (amount: string) => void;
  setIsDonationModalOpen: (open: boolean) => void;
  handleKeyPress: (key: string) => void;
  resetGameState: () => void;
  startGame: () => Promise<void>;
  canPlay: () => boolean;
  getCooldownTime: () => string | null;
  claimReward: () => Promise<void>;
}
