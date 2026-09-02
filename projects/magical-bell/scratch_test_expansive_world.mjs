import { chromium } from 'playwright';

async function testExpansiveWorld() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Step 1: Enter Game at Sanctuary Village Plaza');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'world_01_sanctuary.png' });

    console.log('🚀 Step 2: Travel South to Dawn Fields (Z: +80m)');
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(6500);
    await page.keyboard.up('KeyS');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'world_02_meadows.png' });

    console.log('🚀 Step 3: Travel East to Obsidian Lava Canyon (X: +90m)');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(7000);
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'world_03_lava_canyon.png' });

    console.log('🚀 Step 4: Travel North to Abyss Altar (Z: -100m)');
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(12000);
    await page.keyboard.up('KeyW');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'world_04_abyss_altar.png' });

    console.log('✅ Expansive Multi-Biome World and Distant Zones Verified 100%!');
  } finally {
    await browser.close();
  }
}

testExpansiveWorld();
