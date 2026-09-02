import fs from 'fs';

const models = ['Druid.glb', 'Soldier.glb', 'hero_ignis.glb', 'Ranger.glb'];
for (const m of models) {
  if (fs.existsSync(`./public/models/${m}`)) {
    const buf = fs.readFileSync(`./public/models/${m}`);
    const str = buf.toString('utf8');
    const hasKTX = str.includes('KHR_texture_basisu') || str.includes('KHR_texture_transform');
    console.log(`${m}: size=${buf.length}, hasKTX=${hasKTX}`);
  }
}
