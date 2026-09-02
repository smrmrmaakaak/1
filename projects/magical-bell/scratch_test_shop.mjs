import { chromium } from 'playwright';

async function testShopAndUpgrades() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));

  try {
    await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Initial screenshot
    await page.screenshot({ path: 'shop_01_game_start.png' });
    console.log('Game start screenshot captured');

    // Cast Blizzard (KeyC) at enemy group to defeat wave 1
    console.log('Casting Blizzard (KeyC) to defeat wave 1...');
    await page.mouse.move(640, 280);
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(200);
    await page.mouse.click(640, 280);

    // Also cast Cinder Fall (KeyR) and Frost Lance (KeyQ)
    await page.waitForTimeout(800);
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(100);
    await page.mouse.click(640, 280);

    // Wait for enemies to be killed and gold collected
    await page.waitForTimeout(3500);
    await page.screenshot({ path: 'shop_02_enemies_killed.png' });

    // Check if shop modal appears
    const shopModal = await page.$('#game-shop-modal');
    const isVisible = await shopModal.isVisible();
    console.log(`Shop modal visible: ${isVisible}`);

    await page.screenshot({ path: 'shop_03_shop_modal.png' });

    if (isVisible) {
      // Click on Spell Power upgrade button
      const dmgBtn = await page.$('button[data-id="damage"]');
      if (dmgBtn) {
        console.log('Purchasing Spell Power upgrade...');
        await dmgBtn.click();
        await page.waitForTimeout(500);
      }

      // Click on AoE Radius upgrade button
      const aoeBtn = await page.$('button[data-id="area"]');
      if (aoeBtn) {
        console.log('Purchasing AoE Radius upgrade...');
        await aoeBtn.click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({ path: 'shop_04_after_purchases.png' });

      // Click Next Wave button
      console.log('Clicking Next Wave button...');
      await page.click('#btn-next-wave');
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'shop_05_wave2_started.png' });
      console.log('Wave 2 started screenshot captured');
    }
  } finally {
    await browser.close();
  }
}

testShopAndUpgrades();
