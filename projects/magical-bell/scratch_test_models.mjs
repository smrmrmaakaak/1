import { chromium } from 'playwright';

async function testAllModels() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const models = ['Barbarian', 'Druid', 'Knight', 'Mage', 'Mage_Classic', 'Paladin', 'Ranger', 'Rogue', 'Rogue_Hooded'];
  console.log('Inspecting available models...');
  
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const report = await page.evaluate(async (modelList) => {
    const results = {};
    for (const m of modelList) {
      try {
        const gltf = await new Promise((res, rej) => {
          new window.THREE_GLTFLoader().load(`./models/${m}.glb`, res, undefined, rej);
        });
        const meshes = [];
        gltf.scene.traverse(node => {
          if (node.isMesh || node.isSkinnedMesh) meshes.push(node.name);
        });
        results[m] = { meshes };
      } catch (e) {
        results[m] = { error: e.message };
      }
    }
    return results;
  }, models);

  console.log('Model details:', JSON.stringify(report, null, 2));
  await browser.close();
}

testAllModels();
