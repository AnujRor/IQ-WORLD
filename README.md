# IQ World

IQ World ek word deduction (unscramble) game hai. Isme player ko jumbled letters diye jaate hain aur unko sahi order me laga kar word guess karna hota hai.

## Game kya hai

- Har level me ek word hota hai jo mix (jumble) kiya hua hota hai, uske saath kuch extra random letters bhi milte hain.
- Player on-screen buttons ya physical keyboard se letters type karke poora word banata hai.
- Sahi word banane par level clear ho jaata hai aur next level unlock hota hai.
- Har level me 3 lifelines (hearts) milti hain. Galat guess par ek lifeline kam ho jaati hai. Saari lifelines khatam hone par game over.
- 3 hints bhi milte hain jo word ka hint text dikhate hain.
- Level badhne ke saath word ki length badhti hai (3 se 6 letters tak).
- Total 200 levels hain. Welcome screen par name aur age maangta hai, phir main menu se Start Game, Levels, Settings aur How to Play option milte hain.
- Settings me Music/Sound aur Vibration on-off kar sakte hain.

## Kaise banaya hai

- **React 19 + TypeScript** par bana hai, build tool **Vite** hai.
- **Tailwind CSS v4** se styling ki gayi hai.
- **motion (framer-motion)** se animations kiye gaye hain (tile flips, screen transitions, toast).
- **lucide-react** ke icons use kiye hain (heart, bulb, settings, etc.).
- Sound Web Audio API aur ek background music file (`public/game.mp3`) se handle hoti hai. Vibration mobile ke `navigator.vibrate` se.
- Saara game logic `src/App.tsx` me hai (screens, lifelines, hints, guesses, level unlock).
- Guess grid aur letter coloring `src/components/Grid.tsx` me hai (green = sahi jagah, amber = word me hai magar galat jagah, red = word me nahi).
- Words aur puzzles ki list `src/words.ts` me hai. `getPuzzleForLevel()` level ke hisaab se word length chunta hai aur `getJumbledLetters()` letters ko shuffle karke extra letters jodta hai.

