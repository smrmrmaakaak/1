import { chromium } from 'playwright';

async function testShopFlow() {
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

    // Simulate wave clear with 500 gold
    console.log('Clearing wave 1 and rewarding gold...');
    await page.evaluate(() => {
      window.app.enemies.enemies.forEach(e => e.takeDamage(9999, true));
      window.app.enemies.enemiesToSpawn.length = 0;
      window.app.game.addGold(300); // add extra test gold
    });

    await page.waitForTimeout(1000);

    // Check shop modal visibility
    const isVisible = await page.$eval('#game-shop-modal', el => el.style.display !== 'none');
    console.log(`Shop modal visible: ${isVisible}`);

    await page.screenshot({ path: 'shop_02_shop_open.png' });

    // Verify gold
    const goldText = await page.$eval('#shop-current-gold', el => el.textContent);
    console.log(`Current Gold in Shop: ${goldText}`);

    // Click Spell Power upgrade
    console.log('Purchasing Spell Power upgrade...');
    await page.click('button[data-id="damage"]');
    await page.waitForTimeout(300);

    // Click AoE Radius upgrade
    console.log('Purchasing AoE Radius upgrade...');
    await page.click('button[data-id="area"]');
    await page.waitForTimeout(300);

    // Click Swift Steps upgrade
    console.log('Purchasing Swift Steps upgrade...');
    await page.click('button[data-id="speed"]');
    await page.waitForTimeout(300);

    // Click Cooldown Haste upgrade
    console.log('Purchasing Cooldown Haste upgrade...');
    await page.click('button[data-id="cooldown"]');
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'shop_03_after_buying_upgrades.png' });

    // Read stats from window.app.game
    const stats = await page.evaluate(() => ({
      dmgMult: window.app.game.damageMultiplier,
      areaMult: window.app.game.areaMultiplier,
      speedMult: window.app.game.speedMultiplier,
      cdMult: window.app.game.cooldownMultiplier,
      gold: window.app.game.gold,
      upgrades: window.app.game.upgrades
    }));
    console.log('Upgraded Game Stats:', JSON.stringify(stats, null, 2));

    // Click NEXT WAVE button
    console.log('Clicking Next Wave button...');
    await page.click('#btn-next-wave');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'shop_04_wave2_running.png' });
    console.log('Wave 2 running screenshot captured');

    // Move player with WASD
    console.log('Moving player with upgraded speed...');
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(800);
    await page.keyboard.up('KeyW');

    await page.screenshot({ path: 'shop_05_player_moved.png' });
    console.log('All shop & upgrade tests completed successfully!');
  } finally {
    await browser.close();
  }
}

testShopFlow();
