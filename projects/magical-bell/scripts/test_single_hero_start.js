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

  // 1. Capture Single Character Startup Screen
  console.log('Capturing Single Character Startup Screen...');
  await page.waitForSelector('#btn-hero-start');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'single_character_startup.png') });

  // 2. Start Game
  console.log('Starting game...');
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // 3. Capture In-Game Screen (Single Adventurer with physical attack and locked slots)
  console.log('Capturing In-Game Base Adventurer Screen...');
  await page.screenshot({ path: path.join(outputDir, 'single_character_ingame.png') });

  // 4. Open Inventory
  console.log('Opening Inventory...');
  await page.evaluate(() => {
    window.app?.inventoryModal?.show();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, 'single_character_inventory.png') });

  await browser.close();
  console.log('Single Character verification completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
