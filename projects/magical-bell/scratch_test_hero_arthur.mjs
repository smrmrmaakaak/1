import { chromium } from 'playwright';

async function testHeroArthur() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(2000);

    const info = await page.evaluate(async () => {
      const loader = window.app?.assets?.gltf;
      if (!loader) return 'No GLTF Loader';
      return new Promise((resolve) => {
        loader.load('./models/hero_arthur.glb', (gltf) => {
          const names = [];
          gltf.scene.traverse(c => names.push({ name: c.name, type: c.type }));
          resolve({
            animations: gltf.animations.map(a => a.name),
            children: names
          });
        }, undefined, (err) => resolve({ error: err.message }));
      });
    });

    console.log('hero_arthur.glb details:', JSON.stringify(info, null, 2));
  } finally {
    await browser.close();
  }
}

testHeroArthur();
