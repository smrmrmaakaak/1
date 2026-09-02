import { chromium } from 'playwright';

async function inspectHeadMesh() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const aceCard = await page.$('.showcase-hero-card[data-hero-id="ace"]');
  if (aceCard) await aceCard.click();
  await page.waitForTimeout(1000);

  const info = await page.evaluate(() => {
    const headMesh = window.app.character.model.getObjectByName('Rogue_Head');
    if (!headMesh) return null;
    const geo = headMesh.geometry;
    return {
      posCount: geo.attributes.position.count,
      bounds: {
        min: geo.boundingBox?.min,
        max: geo.boundingBox?.max
      },
      hasSkin: !!headMesh.isSkinnedMesh
    };
  });

  console.log('Rogue_Head info:', info);
  await browser.close();
}

inspectHeadMesh();
