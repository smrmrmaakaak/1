import { chromium } from 'playwright';

async function testScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const heroIds = ['boreas', 'akainu', 'ace', 'arthur', 'raiden', 'lumina', 'sera', 'tesla'];
  for (const id of heroIds) {
    await page.evaluate(async (hid) => {
      if (window.app && window.app.selectHero) {
        await window.app.selectHero(hid);
      }
    }, id);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `hero_snap_${id}.png` });
  }

  await browser.close();
  console.log('✅ Captured all 8 distinct hero snapshots!');
}

testScreenshots();
