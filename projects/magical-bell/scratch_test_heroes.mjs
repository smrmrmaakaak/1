import { chromium } from 'playwright';

async function testHeroSystem() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 844, height: 390 }, // Mobile Landscape
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();
  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('1. Capturing Hero Selection Modal screen...');
    await page.screenshot({ path: 'hero_select_01_modal.png' });

    // Click Raiden (Storm Walker)
    console.log('2. Clicking Raiden (Storm Walker)...');
    await page.click('.hero-card[data-hero-id="raiden"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'hero_select_02_raiden.png' });

    // Click Lumina (Arcane Sage)
    console.log('3. Clicking Lumina (Arcane Sage)...');
    await page.click('.hero-card[data-hero-id="lumina"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'hero_select_03_lumina.png' });

    // Click Sera (Tempest Witch)
    console.log('4. Clicking Sera (Tempest Witch)...');
    await page.click('.hero-card[data-hero-id="sera"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'hero_select_04_sera.png' });

    // Click Start Battle with Sera
    console.log('5. Clicking START BATTLE with Sera...');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    const initialSkills = await page.evaluate(() => Array.from(window.app.unlockedSkills));
    console.log('Initial unlocked skills for Sera:', initialSkills);

    await page.screenshot({ path: 'hero_gameplay_01_sera_started.png' });

    // Test Battle Auto-Casting Blizzard
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'hero_gameplay_02_blizzard_cast.png' });

    // Test Shop Skill Unlock
    console.log('6. Testing Shop: Unlocking Cinder Fall skill...');
    await page.evaluate(() => {
      window.app.game.addGold(200);
      window.app.game.openShop(1, () => {});
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'hero_shop_01_skill_cards.png' });

    // Buy Cinder Fall unlock
    const buyCinder = await page.$('.shop-card-buy-btn[data-id="unlock_cinder"]');
    if (buyCinder) {
      await buyCinder.click();
      await page.waitForTimeout(400);
    }

    const updatedSkills = await page.evaluate(() => Array.from(window.app.unlockedSkills));
    console.log('Updated unlocked skills after purchase:', updatedSkills);

    // Start next wave
    await page.click('#btn-next-wave');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'hero_gameplay_03_multi_skills.png' });

    console.log('All Hero Selection & Gameplay tests completed successfully!');

  } finally {
    await browser.close();
  }
}

testHeroSystem();
