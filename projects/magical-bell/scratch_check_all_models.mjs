import fs from 'fs';

const files = fs.readdirSync('./public/models').filter(f => f.endsWith('.glb'));
for (const f of files) {
  const buf = fs.readFileSync(`./public/models/${f}`);
  const str = buf.toString('utf8');
  const hasKTX = str.includes('KHR_texture_basisu');
  console.log(`${f}: hasKTX=${hasKTX}`);
}
