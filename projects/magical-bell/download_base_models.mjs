import https from 'https';
import fs from 'fs';
import path from 'path';

const models = [
  { name: 'Soldier.glb', url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb' },
  { name: 'Xbot.glb', url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Xbot.glb' }
];

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        });
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const m of models) {
    const dest = path.resolve('public/models', m.name);
    console.log(`Downloading ${m.name}...`);
    await downloadFile(m.url, dest);
    console.log(`✅ Saved ${m.name} (${fs.statSync(dest).size} bytes)`);
  }
}

run();
