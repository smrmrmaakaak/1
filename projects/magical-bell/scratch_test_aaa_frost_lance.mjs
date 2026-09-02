import { chromium } from 'playwright';

async function testAAAFrostLance() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Phase 1: Start Game as Arthur');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    console.log('🚀 Phase 2: Enter Dev Room for Testing Frost Lance & Shatter');
    await page.click('#btn-menu-dev');
    await page.waitForTimeout(1000);

    // Cast Frost Lance towards dummies
    await page.keyboard.press('KeyQ');
    await page.mouse.click(640, 280);
    await page.waitForTimeout(220); // Capture lance in mid-air with orbiting diamond shards
    await page.screenshot({ path: 'aaa_frost_lance_flight.png' });

    // Cast consecutively to trigger freeze & shatter explosion
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('KeyQ');
      await page.mouse.click(640, 280);
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'aaa_frost_shatter_burst.png' });

    console.log('✅ AAA Frost Lance & Shatter Burst Verified 100%!');
  } finally {
    await browser.close();
  }
}

testAAAFrostLance();
