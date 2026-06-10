import React from 'react';
import { motion } from 'motion/react';
import { webtoons } from '../data';
import { BookMarked } from 'lucide-react';

export function Webtoons() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="space-y-4">
        <div className="flex items-center space-x-3">
          <BookMarked className="w-8 h-8 text-amber-500" />
          <h2 className="text-3xl font-bold tracking-tight text-black">Webtoons / Manhwa</h2>
        </div>
        <p className="text-stone-600">Current obsessions passing the time.</p>
        <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {webtoons.map((webtoon, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={webtoon.id} 
            className="p-5 rounded-xl border border-stone-100 bg-white drop-shadow-sm hover:bg-pink-200/40 transition-colors"
          >
            <h3 className="text-stone-900 font-medium">{webtoon.title}</h3>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
