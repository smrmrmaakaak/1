import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage\\blackbeard_liberation';
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

  // 1. Cast Black Hole (E) to swallow dummies
  console.log('Step 1: Casting Black Hole (E) to swallow dummies...');
  await page.evaluate(() => {
    window.app._quickCastAbility('shadow_grasp');
  });
  await page.waitForTimeout(2300); // Wait for full sinking immersion

  // 2. Cast Liberation (R) to spit out swallowed dummies + 32 town debris!
  console.log('Step 2: Casting Liberation (R / void_singularity)...');
  await page.evaluate(() => {
    window.app._quickCastAbility('void_singularity');
  });

  // Capture Geyser & Skyward Launch at 0.40s
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, 'bb_r_01_geyser_launch_0.40s.png') });
  console.log('Captured bb_r_01_geyser_launch_0.40s.png');

  // Capture Parabolic Flight at 1.00s
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, 'bb_r_02_bombardment_arc_1.00s.png') });
  console.log('Captured bb_r_02_bombardment_arc_1.00s.png');

  // Capture Cataclysmic Earth Impact & Stun at 1.80s
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'bb_r_03_earth_impact_stun_1.80s.png') });
  console.log('Captured bb_r_03_earth_impact_stun_1.80s.png');

  await browser.close();
  console.log('Finished Blackbeard Liberation E -> R Combo Test.');
}

run().catch(console.error);
