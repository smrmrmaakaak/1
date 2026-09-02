import { chromium } from 'playwright';

async function testAutoCast() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => console.log(`[AUTOCAST LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[AUTOCAST ERROR]', err.message));

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Wave 1 started. Observing Auto-Cast spell assault for 4 seconds...');
    await page.waitForTimeout(4000);

    await page.screenshot({ path: 'autocast_01_auto_attacking.png' });

    // Check stats (abilities casted, kills, active spells)
    const status1 = await page.evaluate(() => ({
      kills: window.app.enemies.kills,
      score: window.app.enemies.score,
      activeSpells: window.app.abilities.active.length,
      autoCast: window.app.autoCast
    }));
    console.log('Stats after 4s auto battle:', status1);

    // Test T key toggle (Manual Mode)
    console.log('Pressing KeyT to toggle to MANUAL mode...');
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(1000);

    const status2 = await page.evaluate(() => ({
      autoCast: window.app.autoCast
    }));
    console.log('Auto-cast state after toggle:', status2);

    await page.screenshot({ path: 'autocast_02_manual_mode.png' });

    // Re-enable Auto-Cast
    console.log('Pressing KeyT to re-enable AUTO mode...');
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'autocast_03_re_enabled.png' });

    console.log('Auto-cast tests completed successfully!');
  } finally {
    await browser.close();
  }
}

testAutoCast();
