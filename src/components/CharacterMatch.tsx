import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

const CHARACTERS = ['Akaza', 'Anya', 'Muichiro', 'Rimuru'];

const QUESTIONS = [
  {
    id: 1,
    text: "Someone wakes you up from a really good nap. What's your immediate reaction?",
    options: [
      { text: "Challenge them to a fight! Show them who's boss.", scores: { Akaza: 10, Muichiro: 2, Anya: 0, Rimuru: 0 } },
      { text: "Demand snacks. Specifically peanuts.", scores: { Anya: 10, Rimuru: 2, Muichiro: 0, Akaza: 0 } },
      { text: "Stare blankly. Forget who they are. Go back to sleep.", scores: { Muichiro: 10, Anya: 2, Rimuru: 0, Akaza: 0 } },
      { text: "Smile politely but immediately start organizing my day.", scores: { Rimuru: 10, Anya: 0, Muichiro: 0, Akaza: 0 } }
    ]
  },
  {
    id: 2,
    text: "You have a huge assignment due tomorrow. Your strategy?",
    options: [
      { text: "Train instead! Assignments are for the weak.", scores: { Akaza: 10, Rimuru: 0, Muichiro: 0, Anya: 0 } },
      { text: "Obviously, read the smartest kid's mind for the answers.", scores: { Anya: 10, Rimuru: 0, Muichiro: 0, Akaza: 0 } },
      { text: "What assignment? *stares at clouds*", scores: { Muichiro: 10, Anya: 2, Rimuru: 0, Akaza: 0 } },
      { text: "Delegate the task to my perfectly capable subordinates.", scores: { Rimuru: 10, Akaza: 0, Anya: 0, Muichiro: 0 } }
    ]
  },
  {
    id: 3,
    text: "Pick the aesthetic that speaks to you the most.",
    options: [
      { text: "Martial arts gear, neon tattoos, sheer intensity.", scores: { Akaza: 10, Rimuru: 1, Muichiro: 0, Anya: 0 } },
      { text: "Pastel colors, cute plushies, spy gadgets.", scores: { Anya: 10, Muichiro: 2, Rimuru: 0, Akaza: 0 } },
      { text: "Mist imagery, oversized clothing, cool breeze.", scores: { Muichiro: 10, Rimuru: 2, Akaza: 0, Anya: 0 } },
      { text: "Fantasy vibes, nice capes, clean architecture.", scores: { Rimuru: 10, Muichiro: 0, Akaza: 0, Anya: 0 } }
    ]
  },
  {
    id: 4,
    text: "How do you handle enemies or people who annoy you?",
    options: [
      { text: "Respect their strength, then totally crush them.", scores: { Akaza: 10, Rimuru: 2, Anya: 0, Muichiro: 0 } },
      { text: "Make a funny face and run away!", scores: { Anya: 10, Muichiro: 2, Rimuru: 0, Akaza: 0 } },
      { text: "Forget they exist. Roast them without even meaning to.", scores: { Muichiro: 10, Anya: 2, Rimuru: 0, Akaza: 0 } },
      { text: "Absorb them and steal their skills. Pretty convenient.", scores: { Rimuru: 10, Akaza: 0, Anya: 0, Muichiro: 0 } }
    ]
  }
];

export function CharacterMatch() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    Akaza: 0, Anya: 0, Muichiro: 0, Rimuru: 0
  });
  const [showResults, setShowResults] = useState(false);

  const handleOptionClick = (optionScores: Record<string, number>) => {
    const newScores = { ...scores };
    Object.keys(optionScores).forEach(char => {
      newScores[char] += optionScores[char];
    });
    setScores(newScores);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScores({ Akaza: 0, Anya: 0, Muichiro: 0, Rimuru: 0 });
    setShowResults(false);
  };

  const getPercentageBreakdown = () => {
    const scoresArray = Object.values(scores) as number[];
    const total = scoresArray.reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    
    return Object.keys(scores)
      .map(char => {
        const scoreVal = (scores[char] as number) || 0;
        return {
          character: char,
          percentage: Math.round((scoreVal / total) * 100)
        };
      })
      .filter(item => item.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage);
  };

  const results = getPercentageBreakdown();
  const topCharacter = results.length > 0 ? results[0].character : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="space-y-4">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-8 h-8 text-amber-500" />
          <h2 className="text-3xl font-bold tracking-tight text-black">Character Match Machine</h2>
        </div>
        <p className="text-stone-600">Answer some questions and find out who you are today.</p>
        <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
      </header>

      <div className="bg-white border border-stone-100 drop-shadow-sm rounded-2xl p-6 md:p-10 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div 
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-2xl"
            >
              <div className="text-amber-500 font-mono text-sm mb-4">
                QUESTION {currentQuestion + 1} OF {QUESTIONS.length}
              </div>
              <h3 className="text-2xl font-medium text-stone-900 mb-8 leading-snug">
                {QUESTIONS[currentQuestion].text}
              </h3>
              <div className="space-y-3">
                {QUESTIONS[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option.scores)}
                    className="w-full text-left p-4 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all group flex justify-between items-center"
                  >
                    <span className="text-stone-700 font-medium group-hover:text-amber-700 transition-colors">
                      {option.text}
                    </span>
                    <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl text-center flex flex-col items-center"
            >
              <Sparkles className="w-12 h-12 text-amber-500 mb-6" />
              <h3 className="text-3xl font-bold text-stone-900 mb-2">Quiz Complete!</h3>
              <p className="text-xl text-stone-600 mb-8 max-w-lg">
                Today you are 
                {results.map((r, i) => (
                  <span key={r.character}>
                    <span className="font-bold text-amber-600 ml-2">{r.percentage}% {r.character}</span>
                    {i < results.length - 1 ? ',' : '.'}
                  </span>
                ))}
              </p>

              <div className="w-full bg-stone-50 rounded-2xl p-6 border border-stone-100 mb-8">
                {results.map(r => (
                  <div key={r.character} className="w-full mb-4 last:mb-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-stone-700">{r.character}</span>
                      <span className="text-stone-500 text-sm font-mono">{r.percentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${r.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={resetQuiz}
                className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Retake Quiz
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
