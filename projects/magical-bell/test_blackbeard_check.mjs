import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage\\blackbeard_check';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => window.app && window.app.isHeroSelecting !== undefined);
  await page.waitForTimeout(1000);

  // Start battle with Blackbeard (sera)
  console.log('Starting battle with Blackbeard (sera)...');
  await page.evaluate(() => {
    window.app.startBattleWithHero('sera', '황태민');
  });
  await page.waitForTimeout(2000);

  // Click Dev Room button
  console.log('Entering Dev Room...');
  await page.click('#btn-menu-dev');
  await page.waitForTimeout(1000);

  // Trigger Blackbeard E (shadow_grasp - Black Hole)
  console.log('Triggering Blackbeard E [Black Hole / shadow_grasp]...');
  const res = await page.evaluate(() => {
    try {
      window.app._quickCastAbility('shadow_grasp');
      return { success: true };
    } catch (e) {
      return { error: e.message, stack: e.stack };
    }
  });
  console.log('Cast result:', res);

  // Capture at 0.50s (40m Huge Liquid Black Ocean)
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'bb_e_unified_0.50s.png') });
  console.log('Captured bb_e_unified_0.50s.png');

  // Capture at 1.50s (Dummies Sinking inside the ocean)
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'bb_e_unified_1.50s.png') });
  console.log('Captured bb_e_unified_1.50s.png');

  await browser.close();
  console.log('Finished test.');
}

run().catch(console.error);
