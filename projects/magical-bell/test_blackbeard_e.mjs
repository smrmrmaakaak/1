import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage\\blackbeard_e';
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

  // Capture at 0.40s (Domain Expansion & Accretion Vortex)
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, 'bb_e_01_domain_expansion_0.40s.png') });
  console.log('Captured bb_e_01_domain_expansion_0.40s.png');

  // Capture at 1.40s (Quicksand Sinking & Trapping)
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'bb_e_02_quicksand_sinking_1.40s.png') });
  console.log('Captured bb_e_02_quicksand_sinking_1.40s.png');

  // Capture at 2.40s (Completely Swallowed beneath Darkness Floor)
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 'bb_e_03_swallowed_beneath_2.40s.png') });
  console.log('Captured bb_e_03_swallowed_beneath_2.40s.png');

  // Capture at 3.00s (Cataclysmic Implosion & Gravitational Shockwave)
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, 'bb_e_04_implosion_shockwave_3.00s.png') });
  console.log('Captured bb_e_04_implosion_shockwave_3.00s.png');

  await browser.close();
  console.log('Finished Blackbeard E Black Hole test.');
}

run().catch(console.error);
