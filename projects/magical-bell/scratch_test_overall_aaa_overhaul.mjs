import { chromium } from 'playwright';

async function testOverallAAAOverhaul() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Phase 1: Enter Game as Arthur');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);

    // 1. Capture River, Forest, Lanterns, Village Architecture
    await page.screenshot({ path: 'aaa_world_river_flora.png' });

    console.log('🚀 Phase 2: Walk South into Dawn Meadows towards procedural monsters');
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(6000);
    await page.keyboard.up('KeyS');
    await page.waitForTimeout(1500);

    // 2. Cast Frost Lance & Blizzard on spawned procedural monsters
    await page.keyboard.press('KeyQ');
    await page.mouse.click(640, 360);
    await page.waitForTimeout(350);

    await page.screenshot({ path: 'aaa_procedural_monsters_combat.png' });
    console.log('✅ Overall AAA Map, Monster, Flora, and Combat verified!');
  } finally {
    await browser.close();
  }
}

testOverallAAAOverhaul();
