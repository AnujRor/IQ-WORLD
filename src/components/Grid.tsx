import React from "react";
import { motion } from "motion/react";
import { cn } from "../utils";

interface GridProps {
  guesses: string[];
  currentGuess: string;
  solution: string;
  status: "playing" | "won" | "lost";
  maxGuesses: number;
}

export function Grid({ guesses, currentGuess, solution, status, maxGuesses }: GridProps) {
  const empties =
    guesses.length < maxGuesses - 1 ? Array.from(Array(maxGuesses - 1 - guesses.length)) : [];

  return (
    <div className="flex flex-col gap-2 mb-8">
      {guesses.map((guess, i) => (
        <CompletedRow key={i} guess={guess} solution={solution} />
      ))}
      {status === "playing" && guesses.length < maxGuesses && (
        <CurrentRow guess={currentGuess} solutionLength={solution.length} />
      )}
      {status === "playing" &&
        empties.map((_, i) => <EmptyRow key={i} solutionLength={solution.length} />)}
      {status !== "playing" &&
        guesses.length < maxGuesses &&
        Array.from(Array(maxGuesses - guesses.length)).map((_, i) => (
          <EmptyRow key={i} solutionLength={solution.length} />
        ))}
    </div>
  );
}

function CompletedRow({
  guess,
  solution,
}: {
  guess: string;
  solution: string;
  key?: React.Key;
}) {
  // We need accurate coloring for duplicates.
  const getColors = (guess: string, solution: string) => {
    const solutionChars = solution.split("");
    const guessChars = guess.split("");
    const colors = Array(solution.length).fill("bg-red-500 border-red-500 text-white");

    // First pass, find perfect matches
    guessChars.forEach((letter, i) => {
      if (solutionChars[i] === letter) {
        colors[i] = "bg-emerald-500 border-emerald-500 text-white";
        solutionChars[i] = ""; // nullify used letters
      }
    });

    // Second pass, find present
    guessChars.forEach((letter, i) => {
      if (colors[i] !== "bg-emerald-500 border-emerald-500 text-white" && solutionChars.includes(letter)) {
        colors[i] = "bg-amber-500 border-amber-500 text-zinc-950";
        solutionChars[solutionChars.indexOf(letter)] = "";
      }
    });

    return colors;
  };

  const colors = getColors(guess, solution);

  return (
    <div className="flex justify-center gap-1.5 sm:gap-2">
      {guess.split("").map((letter, i) => (
        <motion.div
          key={i}
          initial={{ rotateX: 90 }}
          animate={{ rotateX: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3, type: "spring" }}
          className={cn(
            "w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl font-display font-bold uppercase border-2",
            colors[i]
          )}
        >
          {letter}
        </motion.div>
      ))}
    </div>
  );
}

function CurrentRow({ guess, solutionLength }: { guess: string; solutionLength: number; key?: React.Key; }) {
  const letters = guess.split("");
  const emptyCells = Array.from(Array(solutionLength - letters.length));

  return (
    <div className="flex justify-center gap-1.5 sm:gap-2">
      {letters.map((letter, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl font-display font-bold uppercase border-2 border-zinc-500 text-zinc-100"
        >
          {letter}
        </motion.div>
      ))}
      {emptyCells.map((_, i) => (
        <div
          key={i}
          className="w-10 h-10 sm:w-14 sm:h-14 border-2 border-zinc-800 bg-zinc-950"
        />
      ))}
    </div>
  );
}

function EmptyRow({ solutionLength }: { solutionLength: number; key?: React.Key; }) {
  const emptyCells = Array.from(Array(solutionLength));
  return (
    <div className="flex justify-center gap-1.5 sm:gap-2">
      {emptyCells.map((_, i) => (
        <div
          key={i}
          className="w-10 h-10 sm:w-14 sm:h-14 border-2 border-zinc-800 bg-zinc-950"
        />
      ))}
    </div>
  );
}
