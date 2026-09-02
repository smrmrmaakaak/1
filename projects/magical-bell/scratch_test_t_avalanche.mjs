import { chromium } from 'playwright';

async function testAbsoluteZeroKeyT() {
  console.log('❄️ Testing KeyT & Absolute Zero (Avalanche) in Arthur...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist', '--disable-gpu-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#preloader', { state: 'detached', timeout: 30000 });
    
    // Wait for Hero Select Modal Start button and click it
    await page.waitForSelector('#btn-hero-start', { state: 'visible', timeout: 10000 });
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);

    // [1] Press KeyT to arm Absolute Zero (Avalanche)
    console.log('Pressing KeyT...');
    await page.keyboard.press('KeyT');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test_01_armed_absolute_zero.png' });

    // [2] Confirm cast by clicking the CAST button
    console.log('Clicking CAST button (#m-btn-cast)...');
    await page.click('#m-btn-cast');

    // Frame 1: Sky Halo and 1st Comet falling
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test_02_avalanche_stage1.png' });

    // Frame 2: 1st Comet Impact & 2nd Giant Comet falling
    await page.waitForTimeout(650);
    await page.screenshot({ path: 'test_03_avalanche_stage2.png' });

    // Frame 3: 3rd Colossal Ancient Glacial Comet & Frost Burst
    await page.waitForTimeout(650);
    await page.screenshot({ path: 'test_04_avalanche_colossal_stage3.png' });

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'test_05_avalanche_final_burst.png' });

    const status = await page.evaluate(() => {
      return {
        activeCount: window.app.abilities.active.length,
        currentElement: window.app.element,
        allowedSkills: Array.from(window.app.allowedHeroSkills || []),
        unlockedSkills: Array.from(window.app.unlockedSkills || [])
      };
    });

    console.log('✅ Ingame State:', JSON.stringify(status, null, 2));
  } finally {
    await browser.close();
  }
}

testAbsoluteZeroKeyT();
