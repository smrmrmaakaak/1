import { chromium } from 'playwright';

async function testFireFist() {
  console.log('👊 Testing Ace Q [불주먹 (Fire Fist - Hiken)] on http://127.0.0.1:5173/ ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log(`[TEST] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[TEST ERR] ${err.message}`));

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.waitForTimeout(1000);

    // 1. Select Ace
    const aceCard = await page.$('.showcase-hero-card[data-hero-id="ace"]');
    if (aceCard) {
      await aceCard.click();
      await page.waitForTimeout(600);
    }

    // 2. Start Battle with Ace
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    // 3. Move mouse forward and press KeyQ (Fire Fist / 불주먹)
    await page.mouse.move(720, 620);
    await page.waitForTimeout(300);
    console.log('👊 Pressing KeyQ [불주먹 (Fire Fist)]...');
    await page.keyboard.press('KeyQ');

    // 0.25s: 3D Giant Fire Fist punching through the air with roaring flames!
    await page.waitForTimeout(250);
    await page.screenshot({ path: 'test_fist_01_flying.png' });

    // 0.65s: Explosive infernal detonation on impact!
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'test_fist_02_impact.png' });

    console.log('✅ Fire Fist test completed successfully!');
  } finally {
    await browser.close();
  }
}

testFireFist();
