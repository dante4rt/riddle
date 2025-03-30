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
    if (letter === "ENTER" || letter === "BACKSPACE") return "";

    let status = "";

    for (let i = 0; i < guesses.length; i++) {
      const guess = guesses[i];

      for (let j = 0; j < guess.length; j++) {
        if (guess[j] === letter) {
          if (targetWord[j] === letter) {
            return "bg-green-200";
          } else if (targetWord.includes(letter) && status !== "bg-green-200") {
            status = "bg-purple-200";
          } else if (!targetWord.includes(letter) && status === "") {
            status = "bg-gray-300";
          }
        }
      }
    }

    return status;
  };

  return (
    <div className="w-full max-w-md">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-2 gap-1">
          {row.map((key) => {
            const status = getLetterStatus(key);
            let buttonClass = "px-2 py-4 rounded font-medium";
            let width = "w-8";

            if (key === "ENTER") {
              width = "w-16";
              buttonClass += " text-xs";
            } else if (key === "BACKSPACE") {
              width = "w-16";
              buttonClass += " text-xs";
            }

            return (
              <Button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`${buttonClass} ${width} ${status || "bg-gray-100 hover:bg-gray-200"}`}
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
