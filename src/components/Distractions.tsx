import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, RotateCcw, Trophy, Play } from 'lucide-react';

// --- SNAKE GAME ---
const GRID_SIZE = 15;
const INITIAL_SNAKE = [{ x: 7, y: 7 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 150;

function SnakeGame() {
  const [snake, setSnake] = useState<{x: number, y: number}[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const spawnFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  }, []);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    spawnFood(INITIAL_SNAKE);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPlaying, isGameOver]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const moveSnake = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true);
          setIsPlaying(false);
          setHighScore(Math.max(highScore, score));
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setIsGameOver(true);
          setIsPlaying(false);
          setHighScore(Math.max(highScore, score));
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          spawnFood(newSnake);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, Math.max(50, BASE_SPEED - Math.floor(score / 50) * 10)); // Speed up as you eat

    return () => clearInterval(moveSnake);
  }, [direction, food, isPlaying, isGameOver, score, highScore, spawnFood]);

  return (
    <div className="flex flex-col items-center select-none outline-none focus:outline-none bg-stone-900 rounded-xl p-4 drop-shadow-sm h-full w-full" tabIndex={0}>
      <div className="flex justify-between items-center w-full mb-4 text-amber-500 font-mono">
        <div className="flex items-center gap-2">
          <span>SCORE:</span>
          <span className="text-white">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          <span className="text-white">{highScore}</span>
        </div>
      </div>

      <div 
        className="relative bg-stone-950 border-2 border-stone-800 rounded-lg overflow-hidden"
        style={{ width: '100%', aspectRatio: '1/1', maxWidth: '300px' }}
      >
        {!isPlaying && (
          <div className="absolute inset-0 z-10 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
            {isGameOver && <div className="text-amber-500 font-bold text-xl mb-4 text-center">GAME OVER<br/><span className="text-sm text-stone-300">Score: {score}</span></div>}
            <button 
              onClick={startGame}
              className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold flex items-center gap-2 px-6 py-3 rounded-full transition-transform active:scale-95"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              {isGameOver ? 'PLAY AGAIN' : 'START GAME'}
            </button>
            {!isGameOver && <p className="text-stone-400 mt-4 text-xs">Use arrow keys to move</p>}
          </div>
        )}

        {/* Grid lines (optional, but looks nice) */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(to right, #292524 1px, transparent 1px), linear-gradient(to bottom, #292524 1px, transparent 1px)',
          backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
        }} />

        {/* Food */}
        <div 
          className="absolute bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]"
          style={{
            width: `${100/GRID_SIZE}%`,
            height: `${100/GRID_SIZE}%`,
            left: `${food.x * (100/GRID_SIZE)}%`,
            top: `${food.y * (100/GRID_SIZE)}%`,
          }}
        />

        {/* Snake */}
        {snake.map((segment, i) => (
          <div 
            key={`${segment.x}-${segment.y}-${i}`}
            className={`absolute ${i === 0 ? 'bg-white rounded-md z-10' : 'bg-stone-300 rounded-sm'}`}
            style={{
              width: `${100/GRID_SIZE}%`,
              height: `${100/GRID_SIZE}%`,
              left: `${segment.x * (100/GRID_SIZE)}%`,
              top: `${segment.y * (100/GRID_SIZE)}%`,
              boxShadow: i === 0 ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
              transform: 'scale(0.9)'
            }}
          />
        ))}
      </div>
      
      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-2 mt-6 w-48 md:hidden">
        <div />
        <button onClick={() => { if(direction.y === 0) setDirection({x:0, y:-1}) }} className="bg-stone-800 p-4 rounded-lg active:bg-stone-700 flex justify-center"><div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-transparent border-b-stone-400" /></button>
        <div />
        <button onClick={() => { if(direction.x === 0) setDirection({x:-1, y:0}) }} className="bg-stone-800 p-4 rounded-lg active:bg-stone-700 flex items-center justify-center"><div className="w-0 h-0 border-t-[8px] border-b-[8px] border-r-[12px] border-transparent border-r-stone-400" /></button>
        <button onClick={() => { if(direction.y === 0) setDirection({x:0, y:1}) }} className="bg-stone-800 p-4 rounded-lg active:bg-stone-700 flex justify-center items-end"><div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-transparent border-t-stone-400" /></button>
        <button onClick={() => { if(direction.x === 0) setDirection({x:1, y:0}) }} className="bg-stone-800 p-4 rounded-lg active:bg-stone-700 flex items-center justify-center"><div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[12px] border-transparent border-l-stone-400" /></button>
      </div>
    </div>
  );
}


// --- MEMORY MATCH GAME ---
const SYMBOLS = ['🌸', '🌙', '🦋', '🍵', '🍂', '☁️', '🍓', '✨'];

interface CardProps {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function MemoryGame() {
  const [cards, setCards] = useState<CardProps[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initializeGame = useCallback(() => {
    const shuffled = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (newCards[first].symbol === newCards[second].symbol) {
        // Match
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          
          if (matchedCards.every(c => c.isMatched)) {
            setIsWon(true);
          }
        }, 500);
      } else {
        // No Match
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center bg-white border border-stone-100 drop-shadow-sm rounded-xl p-6 h-full w-full">
      <div className="flex justify-between items-center w-full mb-6">
        <h3 className="font-medium text-stone-900">Memory Match</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono text-stone-500">MOVES: {moves}</span>
          <button 
            onClick={initializeGame}
            className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {isWon ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center gap-4"
        >
          <div className="text-4xl">🎉</div>
          <h4 className="text-xl font-bold text-stone-900">You Won!</h4>
          <p className="text-stone-500">It took you {moves} moves.</p>
          <button 
            onClick={initializeGame}
            className="mt-4 bg-stone-900 hover:bg-stone-800 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-[300px] aspect-square mx-auto">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className="relative aspect-square cursor-pointer perspective-1000"
              onClick={() => handleCardClick(index)}
              whileHover={{ scale: card.isFlipped ? 1 : 1.05 }}
              whileTap={{ scale: card.isFlipped ? 1 : 0.95 }}
            >
              <div 
                className={`w-full h-full rounded-xl transition-all duration-500 flex items-center justify-center text-2xl sm:text-3xl shadow-sm`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front (Hidden) */}
                <div 
                  className={`absolute inset-0 w-full h-full backface-hidden rounded-xl border-2 ${card.isMatched ? 'bg-amber-100 border-amber-200' : 'bg-stone-50 border-stone-200'} flex items-center justify-center`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <Trophy className="w-6 h-6 text-stone-300 opacity-50" />
                </div>
                
                {/* Back (Revealed) */}
                <div 
                  className={`absolute inset-0 w-full h-full backface-hidden rounded-xl flex items-center justify-center bg-white border-2 ${card.isMatched ? 'border-green-200 shadow-[0_0_15px_rgba(220,252,231,0.5)]' : 'border-amber-200'} `}
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)' 
                  }}
                >
                  <span className={card.isMatched ? 'opacity-50 grayscale' : ''}>{card.symbol}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


// --- MAIN DISTRACTIONS VIEW ---
export function Distractions() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 h-full"
    >
      <header className="space-y-4">
        <div className="flex items-center space-x-3">
          <Gamepad2 className="w-8 h-8 text-amber-500" />
          <h2 className="text-3xl font-bold tracking-tight text-black">Games Workspace</h2>
        </div>
        <p className="text-stone-600">The best mini games to take a break and recharge.</p>
        <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[600px]">
        <SnakeGame />
        <MemoryGame />
      </div>
    </motion.div>
  );
}
