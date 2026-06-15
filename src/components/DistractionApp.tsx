import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Star, Play, Pause, RotateCcw, Brain } from 'lucide-react';

interface Props {
  onUnlock: () => void;
}

export function DistractionApp({ onUnlock }: Props) {
  const [clickCount, setClickCount] = useState(0);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  // Brain dump state
  const [thought, setThought] = useState('');
  const [fadingThought, setFadingThought] = useState('');

  const handleStarClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      onUnlock();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };
  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleThoughtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim()) return;
    setFadingThought(thought);
    setThought('');
    setTimeout(() => setFadingThought(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-stone-950 text-stone-300 font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* Hidden Star */}
      <div className="absolute bottom-8 left-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleStarClick}
          className="text-stone-900 hover:text-amber-300 transition-all duration-700 opacity-50 hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(252,211,77,0.4)]"
          title="Just a star..."
        >
          <Star className="w-8 h-8" />
        </motion.button>
      </div>

      <div className="z-10 flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 w-full max-w-6xl px-8">
        
        {/* Breathing Circle */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-light text-stone-500 mb-12 tracking-widest uppercase">Breathe</h2>
          
          <div className="relative flex items-center justify-center w-64 h-64">
            <motion.div
              animate={{ 
                scale: [1, 2, 1],
                opacity: [0.1, 0.3, 0.1] 
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-48 h-48 rounded-full border border-stone-500 flex items-center justify-center"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.8, 1],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 rounded-full bg-stone-800/50 backdrop-blur-md"
            />
          </div>
          
          <p className="mt-12 text-stone-600 font-mono text-sm tracking-widest uppercase">
            Inhale... Exhale...
          </p>
        </div>

        {/* Utilities Area */}
        <div className="flex flex-col gap-12 w-full max-w-md">
          
          {/* Focus Timer */}
          <div className="bg-stone-900/40 p-8 rounded-2xl border border-stone-800 flex flex-col items-center">
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => switchMode('focus')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === 'focus' ? 'bg-stone-200 text-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Focus
              </button>
              <button 
                onClick={() => switchMode('break')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === 'break' ? 'bg-stone-200 text-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Break
              </button>
            </div>
            
            <div className="text-6xl font-light tracking-tight text-white mb-8 font-mono">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={toggleTimer}
                className="w-12 h-12 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition-colors text-white"
              >
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              <button 
                onClick={resetTimer}
                className="w-12 h-12 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 flex items-center justify-center transition-colors text-stone-400"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Brain Dump */}
          <div className="bg-stone-900/40 p-6 rounded-2xl border border-stone-800">
            <div className="flex items-center gap-2 mb-4 text-stone-400">
              <Brain className="w-5 h-5" />
              <h3 className="font-medium">Brain Dump</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">Type a distracting thought and press enter to let it go.</p>
            <form onSubmit={handleThoughtSubmit} className="relative">
              <input 
                type="text" 
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-stone-950/50 border border-stone-800 rounded-lg px-4 py-3 text-stone-300 focus:outline-none focus:border-stone-600 transition-colors"
              />
            </form>
            <div className="h-8 flex items-center mt-2 px-2">
              <AnimatePresence>
                {fadingThought && (
                  <motion.p 
                    initial={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    animate={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                    className="text-stone-500 italic text-sm truncate"
                  >
                    "{fadingThought}"
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
