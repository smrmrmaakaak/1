import fs from 'fs';
import path from 'path';

function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) scan(full);
    else if (f.name.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('Vector3') && !content.match(/Vector3/)) {
        // unreachable
      }
      if (content.includes('Vector3') && !content.match(/import\s*\{[^}]*Vector3[^}]*\}\s*from/)) {
        console.log('MISSING Vector3 import:', full);
      }
      if (content.includes('Color') && !content.match(/import\s*\{[^}]*Color[^}]*\}\s*from/)) {
        console.log('MISSING Color import:', full);
      }
      if (content.includes('Group') && !content.match(/import\s*\{[^}]*Group[^}]*\}\s*from/)) {
        console.log('MISSING Group import:', full);
      }
      if (content.includes('Quaternion') && !content.match(/import\s*\{[^}]*Quaternion[^}]*\}\s*from/)) {
        console.log('MISSING Quaternion import:', full);
      }
    }
  }
}

scan('src');
console.log('Done scanning.');
