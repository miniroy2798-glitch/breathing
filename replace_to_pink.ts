import fs from 'fs';
import path from 'path';

function walk(dir: string) {
    for (const f of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/rose/g, 'pink');
            content = content.replace(/indigo/g, 'pink');
            fs.writeFileSync(fullPath, content);
        }
    }
}
walk('./src');
