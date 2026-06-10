import fs from 'fs';
import path from 'path';

function walk(dir: string) {
    for (const f of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('indigo')) {
                fs.writeFileSync(fullPath, content.replace(/indigo/g, 'rose'));
            }
        }
    }
}
walk('./src');
