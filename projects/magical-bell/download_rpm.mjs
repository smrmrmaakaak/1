import https from 'https';
import fs from 'fs';

const rpmUrls = [
  { name: 'rpm_male.glb', url: 'https://models.readyplayer.me/6460d35c03ea3c0205e3f1a5.glb' }
];

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location, (redirectRes) => {
          const file = fs.createWriteStream(dest);
          redirectRes.pipe(file);
          file.on('finish', () => { file.close(); resolve(true); });
        });
      } else if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
      } else {
        reject(new Error(`Failed with status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function run() {
  for (const item of rpmUrls) {
    try {
      console.log(`Downloading ${item.name}...`);
      await download(item.url, `public/models/${item.name}`);
      console.log(`✅ Downloaded ${item.name} (${fs.statSync(`public/models/${item.name}`).size} bytes)!`);
    } catch (e) {
      console.error(`❌ Failed:`, e.message);
    }
  }
}

run();
