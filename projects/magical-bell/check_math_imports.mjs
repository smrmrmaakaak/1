import fs from 'fs';
import path from 'path';

function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) scan(full);
    else if (f.name.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('saturate(') && !content.match(/import\s*\{[^}]*saturate[^}]*\}\s*from/)) {
        console.log('MISSING saturate import in:', full);
      }
      if (content.includes('randRange(') && !content.match(/import\s*\{[^}]*randRange[^}]*\}\s*from/)) {
        console.log('MISSING randRange import in:', full);
      }
      if (content.includes('lerp(') && !content.match(/import\s*\{[^}]*lerp[^}]*\}\s*from/)) {
        console.log('MISSING lerp import in:', full);
      }
      if (content.includes('getColor(') && !content.match(/import\s*\{[^}]*getColor[^}]*\}\s*from/)) {
        console.log('MISSING getColor import in:', full);
      }
    }
  }
}

scan('src/abilities');
console.log('Done scanning abilities.');
