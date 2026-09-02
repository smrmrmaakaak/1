import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage\\blackbeard_q';
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

  // Trigger Blackbeard Q (void_orb - Kurouzu)
  console.log('Triggering Blackbeard Q [Kurouzu / void_orb]...');
  const res = await page.evaluate(() => {
    try {
      window.app._quickCastAbility('void_orb');
      return { success: true };
    } catch (e) {
      return { error: e.message, stack: e.stack };
    }
  });
  console.log('Cast result:', res);

  // Capture at 0.10s (Suction Beam & Target High-Speed Pull)
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outputDir, 'bb_01_suction_pull_0.10s.png') });
  console.log('Captured bb_01_suction_pull_0.10s.png');

  // Capture at 0.25s (Target Arrived & Gravitational Crush Explosion)
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outputDir, 'bb_02_impact_crush_0.25s.png') });
  console.log('Captured bb_02_impact_crush_0.25s.png');

  // Capture at 0.60s (Lingering Dark Void & Scorch Decal)
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(outputDir, 'bb_03_lingering_void_0.60s.png') });
  console.log('Captured bb_03_lingering_void_0.60s.png');

  await browser.close();
  console.log('Finished Blackbeard Kurouzu test.');
}

run().catch(console.error);
