import { chromium } from 'playwright';

async function testAvalancheVisuals() {
  console.log('❄️ Testing Avalanche Visuals in Playwright...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist', '--disable-gpu-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log(`[PAGE] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERR] ${err.message}`));

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#preloader', { state: 'detached', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Start battle with Arthur
    await page.evaluate(async () => {
      await window.app.startBattleWithHero('arthur', '황태민');
    });
    await page.waitForTimeout(2500);

    // Cast Avalanche directly in front of Arthur into camera view
    await page.evaluate(() => {
      console.log('🔥 Executing Absolute Zero Avalanche Cast!');
      window.app.armAbility('avalanche');
      // Cast forward in the negative Z direction so it is centered directly in view
      window.app._cast(window.app.character.position, new window.app.character.position.constructor(0, 0, -1), 6.5);
    });

    // Frame 1: Sky Rune Halo & 1st Glacier Comet plunging
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'avalanche_01_stage1_plunge.png' });

    // Frame 2: 1st Glacier Impact, Frost Shockwave & 2nd Comet dropping
    await page.waitForTimeout(650);
    await page.screenshot({ path: 'avalanche_02_stage2_impact.png' });

    // Frame 3: 3rd Colossal Ancient Glacial Comet & Screen Shatter Burst
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'avalanche_03_stage3_colossal.png' });

    // Frame 4: Persistent Frost Decals & Glacial Sparkling Particles
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'avalanche_04_frost_field.png' });

    console.log('✅ All 4 visual stages captured!');
  } finally {
    await browser.close();
  }
}

testAvalancheVisuals();
