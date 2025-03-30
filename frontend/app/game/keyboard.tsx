import { Button } from "@/components/ui/button";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  guesses: string[];
  targetWord: string;
}

export default function Keyboard({ onKeyPress, guesses, targetWord }: KeyboardProps) {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ];

  const getLetterStatus = (letter: string) => {
    if (letter === "ENTER" || letter === "BACKSPACE") return "bg-gray-100 hover:bg-gray-200";

    let correct = false;
    let present = false;
    let absent = false;

    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === letter) {
          if (targetWord[i] === letter) {
            correct = true;
          } else if (targetWord.includes(letter)) {
            present = true;
          } else {
            absent = true;
          }
        }
      }
    }

    if (correct) return "bg-green-200";
    if (present) return "bg-yellow-200";
    if (absent) return "bg-gray-300";
    return "bg-gray-100 hover:bg-gray-200";
  };

  return (
    <div className="w-full max-w-md px-2 sm:px-0 mb-0">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-1 sm:mb-2 gap-1">
          {row.map((key) => {
            const status = getLetterStatus(key);
            const isSpecialKey = key === "ENTER" || key === "BACKSPACE";
            return (
              <Button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`px-1 py-3 sm:px-2 sm:py-4 rounded font-medium text-xs sm:text-sm ${
                  isSpecialKey ? "w-12 sm:w-16" : "w-6 sm:w-8"
                } ${status}`}
                variant="ghost"
              >
                {key === "BACKSPACE" ? "⌫" : key}
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
