import { chromium } from 'playwright';

async function testLiveProduction() {
  console.log('🌐 Testing Live Production Deployment (https://elemental-defense-rpg.web.app)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log(`[LIVE PROD] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[LIVE ERR] ${err.message}`));

  try {
    await page.goto('https://elemental-defense-rpg.web.app/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.waitForTimeout(1500);

    // Click Start Game
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);

    // Test Smart Quick Cast: Press KeyQ
    console.log('⚡ Pressing Q for Frost Lance on live prod...');
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'live_prod_01_cast_q.png' });

    // Test Smart Quick Cast: Press KeyT for Absolute Zero
    console.log('❄️ Pressing T for Absolute Zero on live prod...');
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'live_prod_02_cast_t_avalanche.png' });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'live_prod_03_avalanche_full_blast.png' });

    console.log('✅ Live production verification completed successfully!');
  } finally {
    await browser.close();
  }
}

testLiveProduction();
