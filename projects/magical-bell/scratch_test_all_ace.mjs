import { chromium } from 'playwright';

async function testAllAceSkills() {
  console.log('🔥 Capturing Ace all 4 Fire Skills with real blazing flame shaders...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.waitForTimeout(1000);

    const aceCard = await page.$('.showcase-hero-card[data-hero-id="ace"]');
    if (aceCard) await aceCard.click();
    await page.waitForTimeout(400);

    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    // Aim towards open ground
    await page.mouse.move(960, 360);
    await page.waitForTimeout(300);

    // 1. Q: Fire Fist (불주먹)
    console.log('👊 Casting Q [불주먹 (Fire Fist)]...');
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(220);
    await page.screenshot({ path: 'ace_skill_01_fire_fist.png' });

    // Wait for travel & impact
    await page.waitForTimeout(1000);

    // 2. X: Cross Fire (십자화)
    console.log('🔥 Casting X [십자화 (Cross Fire)]...');
    await page.keyboard.press('KeyX');
    await page.waitForTimeout(250);
    await page.screenshot({ path: 'ace_skill_02_cross_fire.png' });

    await page.waitForTimeout(1000);

    // 3. C: Fire Pillar (불기둥)
    console.log('🔥 Casting C [불기둥 (Fire Pillar)]...');
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'ace_skill_03_fire_pillar.png' });

    await page.waitForTimeout(1200);

    // 4. T: Dai Entei (대염계 염제)
    console.log('☀️ Casting T [대염계 염제 (Dai Entei)]...');
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'ace_skill_04_dai_entei.png' });

    console.log('✅ All 4 Ace fire skills captured!');
  } finally {
    await browser.close();
  }
}

testAllAceSkills();
