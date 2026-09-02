import { chromium } from 'playwright';

async function testIgnisMagma() {
  console.log('🔥 Testing Ignis Q (5-Second Boiling Magma Field on Ground) on http://127.0.0.1:5173/ ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log(`[IGNIS] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[IGNIS ERR] ${err.message}`));

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.waitForTimeout(1000);

    // Select Ignis (Card index 2)
    const cards = await page.$$('.showcase-hero-card');
    if (cards[2]) {
      await cards[2].click();
      await page.waitForTimeout(600);
    }

    // Start Battle with Ignis
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    // Move forward onto open grass ground (Press KeyS / Down Arrow or move mouse)
    await page.mouse.move(720, 650);
    await page.waitForTimeout(500);

    // Press KeyQ (Magma Eruption)
    console.log('🌋 Pressing KeyQ (Magma Eruption)...');
    await page.keyboard.press('KeyQ');

    // 0.3s: Initial upward burst geyser
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'ignis_03_initial_burst.png' });

    // 1.5s: 6.5m wide boiling ground lava pool in full simmer
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'ignis_04_boiling_ground_pool.png' });

    // 3.5s: Continuous ground simmer with rising steam and heat ripples
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ignis_05_continuous_5s_simmer.png' });

    console.log('✅ Ignis 5-Second Boiling Magma Field test completed successfully!');
  } finally {
    await browser.close();
  }
}

testIgnisMagma();
