import { chromium } from 'playwright';

async function testModelShowcase() {
  console.log('🖼️ Testing Ace 3D Model Options...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('.showcase-hero-card[data-hero-id="ace"]', { timeout: 30000 });
    await page.waitForTimeout(1000);

    const aceCard = await page.$('.showcase-hero-card[data-hero-id="ace"]');
    if (aceCard) {
      await aceCard.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: 'ace_model_current.png' });
    }
  } finally {
    await browser.close();
  }
}

testModelShowcase();
