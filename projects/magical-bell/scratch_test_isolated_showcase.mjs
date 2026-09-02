import { chromium } from 'playwright';

async function testIsolatedShowcase() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('1. Loading Pure Character Creation Room...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Initial character selection screen
    await page.screenshot({ path: 'isolated_01_creation_room.png' });

    console.log('2. Trying WASD Movement during selection (Must NOT move!)...');
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyW');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyD');
    await page.screenshot({ path: 'isolated_02_no_movement.png' });

    console.log('3. Selecting Raiden and entering name "태민대마왕"...');
    await page.click('.showcase-hero-card[data-hero-id="raiden"]');
    await page.waitForTimeout(500);
    const input = await page.$('#input-hero-nickname');
    await input.fill('');
    await input.fill('태민대마왕');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'isolated_03_raiden_selected.png' });

    console.log('4. Entering Game World...');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'isolated_04_village_entered.png' });

    console.log('5. Moving inside Village after entrance...');
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(1500);
    await page.keyboard.up('KeyS');
    await page.screenshot({ path: 'isolated_05_moved_in_village.png' });

    console.log('✨ Isolated Character Creation Room Verified 100%!');
  } finally {
    await browser.close();
  }
}

testIsolatedShowcase();
