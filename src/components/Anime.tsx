import React from 'react';
import { motion } from 'motion/react';
import { animes, watchedAnimes } from '../data';
import { Star, CheckCircle } from 'lucide-react';

export function Anime() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <section className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-amber-500" />
            <h2 className="text-3xl font-bold tracking-tight text-black">Anime Rankings</h2>
          </div>
          <p className="text-stone-600">My personal favorites. Ranked.</p>
          <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
        </header>

        <div className="space-y-3">
          {animes.sort((a, b) => a.rank - b.rank).map((anime, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={anime.id} 
              className="p-4 rounded-xl border border-stone-100 bg-white drop-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-amber-50/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-amber-600/50 min-w-[2rem] text-center">#{anime.rank}</span>
                <div>
                  <h3 className="text-lg font-medium text-stone-900">{anime.title}</h3>
                  {anime.note && <p className="text-sm text-stone-600 mt-1">{anime.note}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-amber-500" />
            <h2 className="text-2xl font-bold tracking-tight text-black">Watched Animes</h2>
          </div>
          <p className="text-stone-600">Animes I have completed.</p>
          <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {watchedAnimes.map((anime, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={anime.id} 
              className="p-4 rounded-xl border border-stone-100 bg-white drop-shadow-sm flex justify-between items-center group hover:bg-amber-50/50 transition-colors"
            >
              <div>
                <h3 className="font-medium text-stone-900">{anime.title}</h3>
                {anime.note && <p className="text-xs text-stone-500 mt-1">{anime.note}</p>}
              </div>
              {anime.status && (
                <span className={`px-2 py-1 text-xs rounded-full font-medium tracking-wide ${
                  anime.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                  anime.status === 'Watching' ? 'bg-blue-100 text-blue-700' :
                  anime.status === 'Incompleted' ? 'bg-amber-100 text-amber-800' :
                  'bg-stone-100 text-stone-700'
                }`}>
                  {anime.status}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
