import { chromium } from 'playwright';

async function testFireFistAim() {
  console.log('👊 Testing Ace Q [불주먹 (Fire Fist - Hiken)] on http://127.0.0.1:5173/ ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log(`[TEST] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[TEST ERR] ${err.message}`));

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.waitForTimeout(1000);

    const aceCard = await page.$('.showcase-hero-card[data-hero-id="ace"]');
    if (aceCard) await aceCard.click();
    await page.waitForTimeout(400);

    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    // Aim forward into the field
    await page.mouse.move(920, 320);
    await page.waitForTimeout(300);
    console.log('👊 Casting Fire Fist forward...');
    await page.keyboard.press('KeyQ');

    // 0.25s: Capture mid-flight giant fire fist!
    await page.waitForTimeout(250);
    await page.screenshot({ path: 'test_fist_mid_flight.png' });

    console.log('✅ Done capturing mid-flight fire fist!');
  } finally {
    await browser.close();
  }
}

testFireFistAim();
