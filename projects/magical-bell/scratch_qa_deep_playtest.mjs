import { chromium } from 'playwright';

export async function runDeepQAPlaytest() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-unsafe-webgpu',
      '--use-gl=angle',
      '--use-angle=vulkan',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const logs = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.error(`[CONSOLE ERROR] ${text}`);
    } else {
      logs.push(text);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.error(`[PAGE ERROR] ${err.message}`);
  });

  try {
    console.log('🚀 Phase 1: Game Load & Showcase UI Check');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'qa_01_showcase_init.png' });

    console.log('🚀 Phase 2: Switch to Raiden & Demo Cast');
    await page.click('.showcase-hero-card[data-hero-id="raiden"]');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'qa_02_raiden_showcase.png' });

    console.log('🚀 Phase 3: Start Battle with Raiden');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'qa_03_wave1_battle_start.png' });

    console.log('🚀 Phase 4: Combat Simulation (Movement, Auto-Cast, Kills)');
    // Move player around
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyW');
    await page.keyboard.down('KeyA');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyA');

    // Wait for auto combat to defeat Wave 1 minions
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'qa_04_wave1_fighting.png' });

    // Wait for wave 1 clear & shop modal opening
    console.log('🚀 Phase 5: Waiting for Wave 1 Clear & Shop Opening');
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'qa_05_wave1_shop_opened.png' });

    // Try upgrading inside shop
    const buyBtn = await page.$('.shop-card .btn-buy:not([disabled])');
    if (buyBtn) {
      console.log('Buying first available upgrade in shop...');
      await buyBtn.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: 'qa_06_shop_purchased.png' });

    // Click Next Wave button
    console.log('🚀 Phase 6: Starting Wave 2');
    await page.click('#btn-next-wave');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'qa_07_wave2_started.png' });

    // Test Hero Switch in-game
    console.log('🚀 Phase 7: Testing In-Game Hero Switch HUD');
    await page.click('#game-btn-hero-select');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'qa_08_ingame_hero_select_opened.png' });

    // Select Ignis and re-enter
    await page.click('.showcase-hero-card[data-hero-id="ignis"]');
    await page.waitForTimeout(500);
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'qa_09_ignis_wave2_fighting.png' });

    console.log('🚀 Phase 8: Mobile Viewport QA (Touch & UI Fit)');
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'qa_10_mobile_gameplay.png' });

    console.log('✅ QA Playtest Completed. Total Errors:', errors.length);
  } finally {
    await browser.close();
  }
}

runDeepQAPlaytest();
