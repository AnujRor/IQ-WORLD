import { useState, useEffect, useCallback, useRef } from "react";
import { Grid } from "./components/Grid";
import { getPuzzleForLevel, getJumbledLetters } from "./words";
import { RotateCcw, Delete as DeleteIcon, CornerDownLeft, Heart, List, X, Settings, Volume2, VolumeX, Vibrate, Smartphone, Home, HelpCircle, Lock, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import thumbnailImg from "./assets/images/iq_world_background_top_text_1782114810027.jpg";
import menuBgImg from "./assets/images/iq_main_menu_background_1782192132435.jpg";
import gameplayBgImg from "./assets/images/gameplay_bg_1781857818498.jpg";
import levelsBgImg from "./assets/images/iq_levels_background_1782118401715.jpg";

const MAX_LIFELINES = 3;

export default function App() {
  const [appState, setAppState] = useState<"welcome" | "menu" | "game">("welcome");
  const [playerName, setPlayerName] = useState("");
  const [playerAge, setPlayerAge] = useState("");
  const [level, setLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [showLevels, setShowLevels] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const [showHintText, setShowHintText] = useState(false);

  const [{ solution, jumbled, hintText }, setPuzzleState] = useState(() => {
    const p = getPuzzleForLevel(1);
    return { solution: p.word, jumbled: getJumbledLetters(p.word), hintText: p.hint };
  });

  const [lifelines, setLifelines] = useState(MAX_LIFELINES);
  const [hints, setHints] = useState(3);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [toast, setToast] = useState<string | null>(null);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!bgMusicRef.current) {
      const audio = new Audio("/game.mp3");
      audio.loop = true;
      bgMusicRef.current = audio;
    }
  }, []);

  useEffect(() => {
    const audio = bgMusicRef.current;
    if (!audio) return;
    
    const applySoundState = () => {
      if (soundEnabled) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    };

    applySoundState();

    const handleInteraction = () => {
      applySoundState();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [soundEnabled]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const playLevel = useCallback((selectedLevel: number) => {
    const p = getPuzzleForLevel(selectedLevel);
    setPuzzleState({ solution: p.word, jumbled: getJumbledLetters(p.word), hintText: p.hint });
    setGuesses([]);
    setCurrentGuess("");
    setLifelines(MAX_LIFELINES);
    setHints(3);
    setShowHintText(false);
    setGameStatus("playing");
    setToast(null);
    setLevel(selectedLevel);
  }, []);

  const playFeedback = useCallback(
    (isSuccess: boolean) => {
      if (vibrationEnabled && navigator.vibrate && isSuccess) {
        navigator.vibrate([100, 50, 100]);
      }
    },
    [vibrationEnabled]
  );

  const playGameStartSound = useCallback(() => {
    if (soundEnabled) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      try {
        const ctx = new AudioContext();
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.type = "sine";
        osc2.type = "triangle";
        osc3.type = "sine";
        
        // A nice pleasant major chord arpeggio
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc3.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
        
        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime + 0.1);
        osc3.start(ctx.currentTime + 0.2);
        
        osc1.stop(ctx.currentTime + 1.0);
        osc2.stop(ctx.currentTime + 1.0);
        osc3.stop(ctx.currentTime + 1.0);
      } catch (e) {
        // ignore audio context errors
      }
    }
  }, [soundEnabled]);

  const useHint = useCallback(() => {
    if (hints > 0 && gameStatus === "playing" && !showHintText) {
      setHints(hints - 1);
      setShowHintText(true);
    }
  }, [hints, gameStatus, showHintText]);

  const onChar = useCallback(
    (value: string) => {
      if (
        currentGuess.length < solution.length &&
        gameStatus === "playing"
      ) {
        const newGuess = `${currentGuess}${value}`;
        
        if (newGuess.length === solution.length) {
          const newGuesses = [...guesses, newGuess];
          setGuesses(newGuesses);
          setCurrentGuess("");
          
          if (newGuess === solution) {
            setGameStatus("won");
            showToast("Splendid!");
            playFeedback(true);
          } else {
            const remainingLifelines = lifelines - 1;
            setLifelines(remainingLifelines);
            playFeedback(false);
            if (remainingLifelines <= 0) {
              setGameStatus("lost");
              showToast(solution);
            }
          }
        } else {
          setCurrentGuess(newGuess);
        }
      }
    },
    [currentGuess, gameStatus, solution, guesses, lifelines, playFeedback]
  );

  const onDelete = useCallback(() => {
    setCurrentGuess(currentGuess.slice(0, -1));
  }, [currentGuess]);

  useEffect(() => {
    if (appState !== "game") return;
    const listener = (e: KeyboardEvent) => {
      if (e.code === "Backspace") {
        onDelete();
      } else {
        const key = e.key.toUpperCase();
        if (key.length === 1 && key >= "A" && key <= "Z") {
          onChar(key);
        }
      }
    };

    window.addEventListener("keyup", listener);
    return () => {
      window.removeEventListener("keyup", listener);
    };
  }, [onDelete, onChar, appState]);

  const nextLevel = () => {
    const next = Math.min(level + 1, 200);
    if (next > unlockedLevel) {
      setUnlockedLevel(next);
    }
    playLevel(next);
  };

  const restartGame = () => {
    playLevel(level);
  };

  return (
    <div className="min-h-screen flex flex-col pt-8 pb-4 px-4 sm:px-6 relative text-zinc-50 overflow-hidden bg-zinc-950">
      {/* Background IQ World Theme */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-amber-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col h-full w-full max-w-lg mx-auto">
        {appState === "welcome" && (
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="fixed inset-0 z-[-1] pointer-events-none flex items-center justify-center">
              <img src={thumbnailImg} alt="IQ WORLD Background" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/20" />
            </div>
            
            <div className="w-full max-w-sm bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 p-6 rounded-2xl shadow-2xl">
              <label htmlFor="playerName" className="block text-zinc-300 font-medium mb-2 uppercase tracking-wider text-xs">
                Enter your name
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Player Name"
                className="w-full bg-zinc-950/50 border border-zinc-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
              />

              <label htmlFor="playerAge" className="block text-zinc-300 font-medium mb-2 uppercase tracking-wider text-xs">
                Enter your age
              </label>
              <input
                id="playerAge"
                type="number"
                value={playerAge}
                min="1"
                max="100"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setPlayerAge("");
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setPlayerAge(num.toString());
                    } else if (num > 100) {
                      setPlayerAge("100");
                    }
                  }
                }}
                placeholder="10"
                className="w-full bg-zinc-950/50 border border-zinc-700 rounded-lg px-4 py-3 text-white mb-6 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && playerName.trim() && playerAge.trim()) {
                    playGameStartSound();
                    setAppState("menu");
                  }
                }}
              />

              <button
                disabled={!playerName.trim() || !playerAge.trim()}
                onClick={() => {
                  playGameStartSound();
                  setAppState("menu");
                }}
                className="w-full bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-lg py-3 rounded-lg flex items-center justify-center transition-all hover:enabled:bg-emerald-500 shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {appState === "menu" && (
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="fixed inset-0 z-[-1] pointer-events-none flex items-center justify-center">
              <img src={menuBgImg} alt="Menu Background" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-zinc-950/70" />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative mb-16 text-center z-10 flex flex-col items-center"
            >
              <div className="relative flex items-center justify-center w-20 h-20 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-2xl rotate-45 blur-xl opacity-60 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-2xl rotate-45 border border-white/30 shadow-[0_0_40px_rgba(34,211,238,0.4)] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
                </div>
                <Lightbulb className="w-10 h-10 text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,1)]" />
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-display font-black tracking-[0.2em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] uppercase ml-3 flex flex-col gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-zinc-400 drop-shadow-md">IQ</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 tracking-[0.3em] ml-2 text-4xl sm:text-5xl drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">WORLD</span>
              </h1>
              
              <div className="mt-8 flex gap-3 items-center opacity-80">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-cyan-500 to-cyan-500"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-ping"></div>
                <div className="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,1)]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-ping"></div>
                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent via-cyan-500 to-cyan-500"></div>
              </div>
            </motion.div>
            
            <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
              <button
                onClick={() => {
                  playGameStartSound();
                  setAppState("game");
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl py-4 rounded-xl shadow-lg transition-all hover:scale-105"
              >
                START GAME
              </button>
              
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => setShowLevels(true)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <List className="w-5 h-5" /> Levels
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Settings className="w-5 h-5" /> Settings
                </button>
              </div>

              <button
                onClick={() => setShowHowToPlay(true)}
                className="w-full bg-indigo-600/80 hover:bg-indigo-500/80 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-2"
              >
                <HelpCircle className="w-5 h-5" /> How to Play
              </button>
            </div>
          </div>
        )}

        {appState === "game" && (
          <div className="flex-1 flex flex-col w-full h-full relative z-10">
            <div className="absolute inset-[-50vh] z-[-1] pointer-events-none flex items-center justify-center opacity-20 mix-blend-screen">
              <img src={gameplayBgImg} alt="Gameplay Background" className="w-[150%] max-w-none h-auto object-cover mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] blur-[2px]" style={{ WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 20%, transparent 100%)' }} />
            </div>
            <header className="flex items-center justify-between w-full mb-6 relative">
              <div className="flex flex-col">
                <h1 className="text-3xl font-display font-bold tracking-tight text-white drop-shadow-md">IQ WORLD</h1>
                <span className="text-amber-400 font-bold text-sm tracking-widest uppercase mt-1">Level {level}</span>
                <span className="text-zinc-400 text-xs mt-1">{playerName || "Player"} {playerAge ? `(${playerAge})` : ""}</span>
              </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-1 items-center">
              {Array.from(Array(MAX_LIFELINES)).map((_, i) => (
                <Heart 
                  key={i} 
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${i < lifelines ? "fill-red-500 text-red-500" : "fill-zinc-800 text-zinc-800"}`} 
                />
              ))}
              
              <button 
                title="Hint"
                aria-label="Hint"
                onClick={useHint} 
                className="ml-2 flex items-center justify-center p-1.5 rounded-full hover:bg-zinc-800/50 transition-colors relative group"
              >
                <Lightbulb className={`w-5 h-5 sm:w-6 sm:h-6 ${hints > 0 ? "fill-amber-400 text-amber-400" : "text-zinc-600 fill-transparent"}`} />
                {hints > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full leading-none">
                    {hints}
                  </span>
                )}
              </button>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => setAppState("menu")}
                className="p-2 hover:bg-zinc-800/50 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Home"
              >
                <Home className="w-5 h-5 text-zinc-300" />
              </button>
              <button
                onClick={restartGame}
                className="p-2 hover:bg-zinc-800/50 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Restart game"
              >
                <RotateCcw className="w-5 h-5 text-zinc-300" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center -mt-4">
          <Grid
            guesses={guesses}
            currentGuess={currentGuess}
            solution={solution}
            status={gameStatus}
            maxGuesses={MAX_LIFELINES}
          />
          
          <AnimatePresence>
            {showHintText && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 w-full max-w-sm px-4"
              >
                <div className="bg-amber-900/40 border border-amber-500/50 rounded-xl p-4 text-center shadow-lg backdrop-blur-md">
                  <div className="flex items-center justify-center gap-2 text-amber-400 mb-1">
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Hint</span>
                  </div>
                  <p className="text-amber-100 text-sm md:text-base font-medium font-sans">
                    {hintText}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-8 w-full max-w-sm">
            <p className="text-zinc-300 drop-shadow flex justify-center text-xs mb-3 uppercase tracking-widest text-center">Available Letters</p>
            <div className="flex justify-center gap-2 flex-wrap items-center">
              {jumbled.split("").map((char, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onChar(char);
                  }}
                  className="w-10 h-12 sm:w-12 sm:h-14 bg-zinc-800/80 backdrop-blur hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-700 text-white font-display font-bold text-xl rounded flex items-center justify-center transition-colors shadow-lg"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed top-24 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-950 px-4 py-3 rounded shadow-xl font-medium text-sm z-50 pointer-events-none"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {(gameStatus === "won" || gameStatus === "lost") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
          >
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
              <h2 className="text-2xl font-display font-bold mb-2">
                {gameStatus === "won" ? "Level Cleared!" : "Game Over"}
              </h2>
              <p className="text-zinc-400 mb-6">
                The word was <strong className="text-zinc-100 tracking-widest">{solution}</strong>
              </p>
              {gameStatus === "won" ? (
                <button
                  onClick={nextLevel}
                  className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-400 transition-colors shadow-lg"
                >
                  {level === 200 ? "Finish Game" : "Next Level"}
                </button>
              ) : (
                <button
                  onClick={restartGame}
                  className="w-full bg-zinc-100 text-zinc-950 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  Play Again
                </button>
              )}
            </div>
          </motion.div>
        )}
          </div>
        )}

        {showLevels && (
          <div className="fixed inset-0 z-50 flex flex-col p-6 overflow-y-auto">
            <div className="fixed inset-0 z-[-1] pointer-events-none flex items-center justify-center">
              <img src={levelsBgImg} alt="Levels Background" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
              <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />
            </div>
            
            <div className="flex items-center justify-between mb-8 max-w-lg mx-auto w-full relative z-10">
              <h2 className="text-2xl font-bold font-display tracking-tight text-white drop-shadow-md">Select Level</h2>
              <button onClick={() => setShowLevels(false)} className="text-zinc-400 hover:text-white p-2 bg-zinc-900/50 rounded-full backdrop-blur-md">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 max-w-lg mx-auto w-full pb-12 relative z-10">
              {Array.from({ length: 200 }).map((_, i) => {
                const lvl = i + 1;
                const isUnlocked = lvl <= unlockedLevel;
                return (
                  <button
                    key={lvl}
                    disabled={!isUnlocked}
                    onClick={() => {
                      setShowLevels(false);
                      playLevel(lvl);
                    }}
                    className={`
                      h-14 rounded-lg font-bold text-lg flex items-center justify-center transition-all relative
                      ${isUnlocked 
                        ? lvl === level 
                          ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20" 
                          : "bg-zinc-800 text-white hover:bg-zinc-700 hover:scale-105" 
                        : "bg-zinc-900/50 text-zinc-600 cursor-not-allowed"}
                    `}
                  >
                    {isUnlocked ? lvl : (
                      <div className="flex flex-col items-center justify-center">
                        <Lock className="w-4 h-4 opacity-40 mb-0.5" />
                        <span className="text-[10px] opacity-60 leading-none">{lvl}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-2xl max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${soundEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-100">Music & Sound</p>
                      <p className="text-xs text-zinc-400">Play music & effects on action</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${soundEnabled ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${vibrationEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      <Smartphone className={`w-5 h-5 ${vibrationEnabled ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-100">Vibration</p>
                      <p className="text-xs text-zinc-400">Haptic feedback on correct answer</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVibrationEnabled(!vibrationEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${vibrationEnabled ? 'bg-amber-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${vibrationEnabled ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showHowToPlay && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-2xl max-w-sm w-full shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">How to Play</h2>
                <button onClick={() => setShowHowToPlay(false)} className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4 text-zinc-300 text-sm">
                <p>Welcome to <strong>IQ World</strong>! Your goal is to unscramble the letters to find the correct word.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Guess the word using the provided jumbled letters.</li>
                  <li>Type your guess using the physical keyboard or the on-screen buttons.</li>
                  <li>Hit <strong>ENTER</strong> (or the enter button) to submit your guess when you've filled all the boxes.</li>
                  <li>Use <strong>DEL</strong> (or backspace) to remove the last letter you typed.</li>
                  <li>You have a total of <strong>3 lifelines</strong> (hearts) per level. Make a wrong guess, and you lose a lifeline!</li>
                  <li>Lose all your lifelines, and the game is over.</li>
                </ul>
                <p className="mt-4 pt-4 border-t border-zinc-800 text-center font-medium">
                  Complete levels to unlock harder challenges. Good luck!
                </p>
              </div>
              
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-md"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
