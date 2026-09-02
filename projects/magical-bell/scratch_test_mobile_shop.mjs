import { chromium, devices } from 'playwright';

async function testMobileShop() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  // Mobile landscape viewport (iPhone 13 Landscape: 844 x 390)
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();
  page.on('console', msg => console.log(`[MOBILE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[MOBILE ERROR]', err.message));

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Opening Shop on Mobile Landscape viewport (844x390)...');
    await page.evaluate(() => {
      // Give gold and trigger shop
      window.app.game.addGold(200);
      window.app.game.openShop(1, (nextWave) => {
        console.log('Next wave started:', nextWave);
      });
    });

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'mobile_shop_01_opened.png' });
    console.log('Screenshot mobile_shop_01_opened.png captured');

    // Test tapping an upgrade button in the shop
    console.log('Tapping Spell Power upgrade button...');
    const buyBtn = await page.$('.shop-card-buy-btn[data-id="damage"]');
    if (buyBtn) {
      await buyBtn.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'mobile_shop_02_upgraded.png' });

    // Test tapping the NEXT WAVE START button in footer
    console.log('Tapping NEXT WAVE START button in footer...');
    const nextBtn = await page.$('#btn-next-wave');
    if (nextBtn) {
      await nextBtn.click();
      await page.waitForTimeout(1000);
    }

    const state = await page.evaluate(() => ({
      gameState: window.app.game.state,
      wave: window.app.game.wave,
      damageLevel: window.app.game.upgrades.damageLevel,
      joystickVisible: window.app.joystick?.zone?.style?.display
    }));
    console.log('Game state after mobile shop flow:', state);

    await page.screenshot({ path: 'mobile_shop_03_wave2_resumed.png' });
    console.log('Mobile shop test completed successfully!');

  } finally {
    await browser.close();
  }
}

testMobileShop();
