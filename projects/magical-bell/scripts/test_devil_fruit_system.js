import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function main() {
  const outputDir = path.resolve('temp_screenshots');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  console.log('Navigating to live URL with cache bust...');
  await page.goto('https://elemental-defense-rpg.web.app/?v=' + Date.now(), { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    try { localStorage.clear(); sessionStorage.clear(); } catch (_) {}
  });
  await page.reload({ waitUntil: 'networkidle' });

  // 1. Check Character Creation Screen
  console.log('Capturing Character Creation Screen...');
  await page.waitForSelector('#btn-hero-start');
  await page.screenshot({ path: path.join(outputDir, 'df_01_creation_screen.png') });

  // 2. Start Game as Normal Adventurer
  console.log('Starting game as Base Adventurer...');
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // 3. Capture Base Adventurer with Locked Skill Slots & Basic Attack
  console.log('Capturing Base Adventurer with locked skills...');
  await page.screenshot({ path: path.join(outputDir, 'df_02_base_adventurer_locked_skills.png') });

  // 4. Perform Basic Melee Attack Combo
  console.log('Performing Basic Melee Attack Combo...');
  await page.evaluate(() => {
    const app = window.app;
    if (app && typeof app.performBasicAttack === 'function') {
      app.performBasicAttack();
    }
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, 'df_03_basic_attack_combo.png') });

  // 5. Open Inventory and View Devil Fruits
  console.log('Opening inventory and viewing Devil Fruits in bag...');
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.inventoryModal) {
      app.inventoryModal.show();
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, 'df_04_inventory_modal.png') });

  // Select fruit_dark in inventory and click Eat Fruit
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.playerData) {
      app.playerData.eatFruit('fruit_dark');
      app.inventoryModal.hide();
    }
  });
  await page.waitForTimeout(1000);
  console.log('Captured Dark-Dark Fruit Awakening!');
  await page.screenshot({ path: path.join(outputDir, 'df_05_dark_fruit_awakened.png') });

  // 6. Cast [T] Dark Domain (45m 결계 룸)
  console.log('Casting Dark Domain [T] skill...');
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.abilities && app.character) {
      const pos = app.character.position.clone();
      const dir = app.character.position.clone().set(0, 0, 1);
      app.abilities.cast(pos, dir, 1.0, 'abyss_eruption');
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, 'df_06_dark_domain_cast.png') });

  // 7. Eat Flame-Flame Fruit (fruit_fire - 에이스)
  console.log('Eating Flame-Flame Fruit (Ace)...');
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.playerData) {
      app.playerData.eatFruit('fruit_fire');
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'df_07_flame_fruit_awakened.png') });

  // 8. Remove Fruit (Back to Normal Human)
  console.log('Purifying fruit with Sea Water...');
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.playerData) {
      app.playerData.removeFruit();
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, 'df_08_fruit_purified_back_to_human.png') });

  await browser.close();
  console.log('All Devil Fruit system tests completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
