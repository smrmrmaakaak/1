import { chromium } from 'playwright';

async function runComprehensiveQA() {
  console.log('🚀 Starting Comprehensive Visual QA Suite...');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-gl=angle',
      '--use-angle=vulkan',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('🔴 Browser Error:', msg.text());
    }
  });

  try {
    // 1. Hero Selection Screen
    console.log('📸 1. Hero Selection Screen');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'qa_01_hero_select.png' });

    // Select Arthur and Start Game
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);

    // 2. Sanctuary Haven Village & NPCs
    console.log('📸 2. Sanctuary Haven Village & NPCs');
    await page.screenshot({ path: 'qa_02_sanctuary_village.png' });

    // 3. NPC Dialog Interaction (Village Elder Eldrin)
    console.log('📸 3. NPC Dialog Modal');
    // Move close to center NPC
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'qa_03_npc_dialog.png' });

    // Close Dialog (press Escape or click close)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 4. Inventory & Stats Modal
    console.log('📸 4. Inventory & Equipment Modal');
    await page.keyboard.press('KeyI');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'qa_04_inventory_modal.png' });
    await page.keyboard.press('KeyI'); // Close modal
    await page.waitForTimeout(500);

    // 5. Dev Room Entrance (Skill Showcase Room)
    console.log('📸 5. Dev Skill Testing Room');
    await page.keyboard.press('F1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'qa_05_dev_room_overview.png' });

    // 6. Skill VFX in Dev Room: [Q] Frost Lance
    console.log('📸 6. [Q] Frost Lance Signature VFX');
    await page.evaluate(() => {
      window.__app?._castAuto?.('ice', { x: 0, y: 0, z: 14 });
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'qa_06_frost_lance_vfx.png' });
    await page.waitForTimeout(600);

    // 7. Skill VFX in Dev Room: [X] Glacial Prison
    console.log('📸 7. [X] Glacial Prison Signature VFX');
    await page.evaluate(() => {
      window.__app?._castAuto?.('glacier', { x: 0, y: 0, z: 12 });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'qa_07_glacial_prison_vfx.png' });
    await page.waitForTimeout(800);

    // 8. Skill VFX in Dev Room: [C] Blizzard Vortex
    console.log('📸 8. [C] Blizzard Vortex Signature VFX');
    await page.evaluate(() => {
      window.__app?._castAuto?.('blizzard', { x: 0, y: 0, z: 14 });
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'qa_08_blizzard_vortex_vfx.png' });
    await page.waitForTimeout(1000);

    // 9. Skill VFX in Dev Room: [T] Avalanche Ultimate (3 Comet Meteors)
    console.log('📸 9. [T] Absolute Zero Avalanche Ultimate VFX');
    await page.evaluate(() => {
      window.__app?._castAuto?.('avalanche', { x: 0, y: 0, z: 15 });
    });
    await page.waitForTimeout(450);
    await page.screenshot({ path: 'qa_09_avalanche_ultimate_vfx.png' });
    await page.waitForTimeout(1800);

    // 10. Dev Room All-Skills Simultaneous Cast
    console.log('📸 10. Dev Room All 8 Spells Simultaneous Burst');
    await page.click('#btn-dev-cast-all');
    await page.waitForTimeout(350);
    await page.screenshot({ path: 'qa_10_all_skills_barrage_vfx.png' });
    await page.waitForTimeout(1500);

    // Exit Dev Room back to Open World
    console.log('📸 11. Returning to Open World & Field Exploration');
    await page.click('#btn-dev-exit');
    await page.waitForTimeout(1500);

    // 11. Walk South into Dawn Meadows towards River, Forest, and Procedural Monsters
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(5000);
    await page.keyboard.up('KeyS');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'qa_11_dawn_meadows_forest.png' });

    // 12. Encounter & Fight Procedural Monsters in the Field
    console.log('📸 12. Fighting Procedural Monsters in the Field');
    await page.evaluate(() => {
      const p = window.__app?.character?.position || { x: 0, z: 25 };
      window.__app?._castAuto?.('ice', { x: p.x, y: 0, z: p.z + 12 });
      window.__app?._castAuto?.('blizzard', { x: p.x, y: 0, z: p.z + 10 });
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'qa_12_field_monster_combat.png' });

    console.log('🎉 Comprehensive Visual QA Finished Successfully! Errors:', consoleErrors.length);
  } finally {
    await browser.close();
  }
}

runComprehensiveQA();
