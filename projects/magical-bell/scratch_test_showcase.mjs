import { chromium } from 'playwright';

async function testAllHeroVisuals() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const heroes = ['ace', 'akainu', 'arthur', 'raiden', 'lumina', 'boreas', 'sera'];
  for (const h of heroes) {
    const card = await page.$(`.showcase-hero-card[data-hero-id="${h}"]`);
    if (card) {
      await card.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `showcase_${h}.png` });
    }
  }

  await browser.close();
  console.log('✅ All hero visual showcases captured!');
}

testAllHeroVisuals();
