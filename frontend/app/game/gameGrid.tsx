import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GameState } from "../constants/types";
import Keyboard from "./keyboard";

interface GameGridProps {
  gameState: GameState;
}

export function GameGrid({ gameState }: GameGridProps) {
  const { guesses, currentGuess, guessStatuses, wordHash, animationStates, handleKeyPress } =
    gameState;

  const getLetterStatus = (rowIndex: number, colIndex: number) => {
    return guessStatuses[rowIndex]?.[colIndex] || "default";
  };

  return (
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
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          <div
                            className={`absolute w-full h-full backface-hidden bg-gray-100 flex items-center justify-center text-base sm:text-lg md:text-xl font-bold rounded border-2 border-gray-200 ${
                              !isFlipping ? "" : "invisible"
                            }`}
                            style={{ backfaceVisibility: "hidden" }}
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
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Game Rules</h3>
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
    </>
  );
}
