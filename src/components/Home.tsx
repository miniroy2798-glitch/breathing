import React from 'react';
import { motion } from 'motion/react';
import { Moon, Star, Sun } from 'lucide-react';

export function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <header className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black flex items-center gap-3">
          Milen's Vault <Moon className="w-8 h-8 text-amber-500 fill-amber-500/20" />
        </h2>
        <p className="text-xl text-stone-600">Mooncore aesthetic dreamer & storyteller.</p>
        <div className="w-16 h-1 bg-amber-500 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
      </header>
      
      <div className="prose  max-w-none text-stone-800">
        <p className="text-lg leading-relaxed">
          Hi, I'm Milen (also known as Rava, Rizva, Meemu). I'm a creative, aesthetic-driven, 
          story-loving person who enjoys building imaginary worlds, analyzing characters, and 
          getting emotionally attached to dramas and anime.
        </p>
        <p className="text-lg leading-relaxed mt-4">
          This is my digital sanctuary. I love mixing soft aesthetics, fantasy worlds, 
          powerful characters, emotional romance, and chaotic friend energy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-stone-100 bg-white drop-shadow-sm backdrop-blur-sm shadow-inner group hover:bg-pink-200/20 transition-all">
          <h3 className="text-amber-500 font-medium mb-4 gap-2 flex items-center">
            <span className="text-xl">💄</span> Beauty & Creativity
          </h3>
          <ul className="space-y-2 text-stone-600 text-sm">
            <li>✨ Makeup & Skincare</li>
            <li>🎀 Soft fashion vibes</li>
            <li>🧶 Crochet projects</li>
            <li>🎨 Website / Carrd design</li>
            <li>🌙 Character lore creation</li>
          </ul>
        </div>
        
        <div className="p-6 rounded-xl border border-stone-100 bg-white drop-shadow-sm backdrop-blur-sm shadow-inner group hover:bg-pink-200/20 transition-all">
          <h3 className="text-amber-500 font-medium mb-4 flex items-center gap-2">
            🌙 The Triplets
          </h3>
          <p className="text-stone-800 text-sm mb-4 italic">"Three minds. One brain cell."</p>
          <ul className="space-y-3 text-stone-600 text-sm">
            <li className="flex items-center gap-2"><Moon className="w-4 h-4 text-amber-400 fill-amber-400/20"/> <strong>Coco</strong> (Milen)</li>
            <li className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-300 fill-amber-300/20"/> <strong>Loco</strong> (Diya Maryam)</li>
            <li className="flex items-center gap-2"><Sun className="w-4 h-4 text-yellow-500 fill-yellow-500/20"/> <strong>Poco</strong> (Shreya Soorej)</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
