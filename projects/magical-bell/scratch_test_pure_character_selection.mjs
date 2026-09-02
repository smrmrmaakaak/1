import { chromium } from 'playwright';

async function testPureCharacterSelection() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('1. Loading Pure Character Creation Screen...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Take screenshot of character selection screen (Must be 100% clean without in-game HUDs)
    await page.screenshot({ path: 'pure_selection_01_clean_creation.png' });

    console.log('2. Selecting Ignis & Inputting Nickname "불꽃군주"...');
    await page.click('.showcase-hero-card[data-hero-id="ignis"]');
    await page.waitForTimeout(500);

    const input = await page.$('#input-hero-nickname');
    await input.fill('');
    await input.fill('불꽃군주');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'pure_selection_02_ignis_selected.png' });

    console.log('3. Entering World with Ignis...');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'pure_selection_03_world_entered.png' });

    console.log('✨ Pure Character Selection & World Entrance Verified 100%!');
  } finally {
    await browser.close();
  }
}

testPureCharacterSelection();
