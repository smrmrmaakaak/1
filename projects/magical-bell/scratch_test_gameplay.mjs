import { chromium } from 'playwright';

async function testGameplay() {
  console.log('🎮 Testing Arthur Gameplay in Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.waitForTimeout(1000);

    // Click Start button on modal
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    // Capture In-Game Screen with Village
    await page.screenshot({ path: 'gameplay_01_village.png' });

    // Press Q (Frost Lance)
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(400);
    await page.mouse.click(720, 350);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'gameplay_02_cast_q.png' });

    // Press T (Absolute Zero)
    console.log('Pressing KeyT...');
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'gameplay_03_armed_t.png' });

    // Click mouse to drop Absolute Zero
    await page.mouse.click(720, 300);
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'gameplay_04_avalanche_dropping.png' });

    await page.waitForTimeout(700);
    await page.screenshot({ path: 'gameplay_05_avalanche_huge_impact.png' });

    console.log('✅ Gameplay screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

testGameplay();
