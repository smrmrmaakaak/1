import { chromium } from 'playwright';

async function testAceFirePillar() {
  console.log('🔥 Testing Ace (C - Fire Pillar / 불기둥) on http://127.0.0.1:5173/ ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log(`[HERO] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[HERO ERR] ${err.message}`));

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.waitForTimeout(1000);

    // 1. Select Ace (Card index 3)
    const aceCard = await page.$('.showcase-hero-card[data-hero-id="ace"]');
    if (aceCard) {
      await aceCard.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: 'ace_01_selected.png' });
    }

    // 2. Start Battle with Ace
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    // 3. Move mouse forward and press KeyC (Fire Pillar / 불기둥)
    await page.mouse.move(720, 620);
    await page.waitForTimeout(300);
    console.log('🔥 Pressing KeyC (Fire Pillar / 불기둥)...');
    await page.keyboard.press('KeyC');

    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'ace_02_fire_pillar_action.png' });

    console.log('✅ Ace Fire Pillar test completed successfully!');
  } finally {
    await browser.close();
  }
}

testAceFirePillar();
