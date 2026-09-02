import { chromium } from 'playwright';

async function inspectGlbStructure() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2000);

  const heroIds = ['arthur', 'raiden', 'akainu', 'ace', 'lumina', 'tesla', 'boreas', 'sera'];
  const glbNodes = await page.evaluate(async (hids) => {
    const results = {};
    for (const hid of hids) {
      await window.app.selectHero(hid);
      const model = window.app.character.model;
      const meshNames = [];
      if (model) {
        model.traverse((c) => {
          if (c.isMesh || c.isSkinnedMesh) {
            meshNames.push({ name: c.name, visible: c.visible });
          }
        });
      }
      results[hid] = meshNames;
    }
    return results;
  }, heroIds);

  console.log(JSON.stringify(glbNodes, null, 2));
  await browser.close();
}

inspectGlbStructure();
