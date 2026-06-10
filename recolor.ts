import fs from 'fs';
import path from 'path';

function walk(dir: string) {
    for (const f of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.tsx') && !fullPath.includes('DistractionApp.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Text color logic
            content = content.replace(/text-pink-900/g, 'text-black');
            content = content.replace(/text-pink-800/g, 'text-stone-900');
            content = content.replace(/text-pink-700/g, 'text-stone-800');
            content = content.replace(/text-pink-600/g, 'text-stone-600');
            
            // Golden accents (replacing mid/light pinks)
            content = content.replace(/text-pink-500/g, 'text-amber-600');
            content = content.replace(/text-pink-400/g, 'text-amber-500');
            content = content.replace(/text-pink-300/g, 'text-amber-400');
            
            // Background and borders
            content = content.replace(/bg-pink-500/g, 'bg-amber-500');
            content = content.replace(/bg-pink-400/g, 'bg-amber-400');
            content = content.replace(/bg-pink-300/g, 'bg-amber-300');
            content = content.replace(/border-pink-500/g, 'border-amber-500');
            content = content.replace(/border-pink-300/g, 'border-amber-300');
            
            // Make cards white instead of white/30 for cleaner contrast
            content = content.replace(/bg-white\/30/g, 'bg-white');
            content = content.replace(/bg-white\/40/g, 'bg-white');
            content = content.replace(/border-pink-200/g, 'border-white');
            
            // Shadows and highlights
            content = content.replace(/shadow-\[0_0_10px_rgba\(244,114,182,0\.5\)\]/g, 'shadow-[0_0_10px_rgba(245,158,11,0.3)]');
            
            // Adjust white backgrounds with a slight shadow instead of pink border
            content = content.replace(/border-white bg-white/g, 'border-stone-100 bg-white drop-shadow-sm');

            // Text white for specific contrast if needed
            content = content.replace(/fill-pink-400/g, 'fill-amber-500');
            content = content.replace(/fill-pink-300/g, 'fill-amber-400');

            fs.writeFileSync(fullPath, content);
        }
    }
}
walk('./src/components');
