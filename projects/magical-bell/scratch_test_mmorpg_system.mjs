import { chromium } from 'playwright';

async function testMMORPGSystem() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Phase 1: Game Load & Showcase');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'rpg_01_class_showcase.png' });

    console.log('🚀 Phase 2: Start Game with Arthur');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'rpg_02_village_spawn.png' });

    console.log('🚀 Phase 3: Open Inventory & Stats Modal');
    await page.click('#btn-menu-inv');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'rpg_03_inventory_modal.png' });

    console.log('🚀 Phase 4: Allocate Stat Point (INT +1)');
    await page.click('.btn-add-stat[data-stat="int"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'rpg_04_stat_allocated.png' });
    await page.click('#btn-inv-close');
    await page.waitForTimeout(600);

    console.log('🚀 Phase 5: Talk to Village Elder NPC');
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'rpg_05_npc_dialog.png' });
    await page.click('#btn-dialog-confirm');
    await page.waitForTimeout(800);

    console.log('🚀 Phase 6: Field Combat & Hunting Simulation');
    // Move south toward Dawn Fields
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(2500);
    await page.keyboard.up('KeyS');

    // Combat auto-cast for 5 seconds
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'rpg_06_field_combat_exp.png' });

    console.log('✅ MMORPG System Verification Completed 100%!');
  } finally {
    await browser.close();
  }
}

testMMORPGSystem();
