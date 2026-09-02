import { chromium } from 'playwright';
import path from 'path';

async function testIngamePlay() {
  console.log('🎮 Testing In-Game Real Play after fix...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[ERROR]', msg.text());
  });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.waitForTimeout(1000);

    // 1. Hero select screen
    await page.screenshot({ path: 'verify_01_hero_select.png' });

    // 2. Click Start Game
    await page.click('#btn-hero-start');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'verify_02_village_entered.png' });

    // 3. Move North towards Elder NPC
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1500);
    await page.keyboard.up('KeyW');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verify_03_walk_to_elder.png' });

    // 4. Move South and Dash
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Space'); // Dash
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyS');
    await page.screenshot({ path: 'verify_04_dash_south.png' });

    // 5. Cast Ice Skills
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verify_05_cast_q.png' });

    await page.keyboard.press('KeyX');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verify_06_cast_x.png' });

    await page.keyboard.press('KeyC');
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'verify_07_cast_c.png' });

    await page.keyboard.press('KeyT');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verify_08_cast_t.png' });

    console.log('✅ All in-game screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

testIngamePlay();
