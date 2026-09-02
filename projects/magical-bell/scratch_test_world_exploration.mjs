import { chromium } from 'playwright';

async function testWorldExploration() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Phase 1: Enter Game World with Arthur');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'world_01_sanctuary_haven.png' });

    console.log('🚀 Phase 2: Explore South (Dawn Meadows & Fantasy Woodlands)');
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(4500);
    await page.keyboard.up('KeyS');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'world_02_dawn_meadows.png' });

    console.log('🚀 Phase 3: Explore West (Obsidian Canyon & Basalt Columns)');
    await page.keyboard.down('KeyA');
    await page.waitForTimeout(5500);
    await page.keyboard.up('KeyA');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'world_03_obsidian_canyon.png' });

    console.log('🚀 Phase 4: Explore North (Abyss Altar & Void Monoliths)');
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(9000);
    await page.keyboard.up('KeyW');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(3500);
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'world_04_abyss_altar.png' });

    console.log('✅ AAA 3D Procedural Open World Map Exploration Completed 100%!');
  } finally {
    await browser.close();
  }
}

testWorldExploration();
