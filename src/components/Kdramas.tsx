import React from 'react';
import { motion } from 'motion/react';
import { kdramas } from '../data';
import { Tv, Heart } from 'lucide-react';

export function Kdramas() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="space-y-4">
        <div className="flex items-center space-x-3">
          <Tv className="w-8 h-8 text-amber-500" />
          <h2 className="text-3xl font-bold tracking-tight text-black">K-Drama Archive</h2>
        </div>
        <p className="text-stone-600">Shows that ruined my sleep schedule and raised my standards.</p>
        <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
      </header>

      <div className="space-y-4">
        {kdramas.map((drama, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={drama.id} 
            className="p-5 rounded-xl border border-stone-100 bg-white drop-shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4 group hover:bg-pink-200/40 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-medium text-stone-900">{drama.title}</h3>
                {drama.status && (
                  <span className={`text-xs px-2 py-1 rounded font-medium bg-pink-200 text-stone-800`}>
                    {drama.status}
                  </span>
                )}
              </div>
              {drama.note && <p className="text-sm text-stone-600 italic">"{drama.note}"</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
