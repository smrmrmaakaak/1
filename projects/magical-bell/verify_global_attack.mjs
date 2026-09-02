import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  console.log('Navigating to global https://elemental-defense-rpg.web.app ...');
  await page.goto('https://elemental-defense-rpg.web.app', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2500);

  // Click start
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // Click Dev Room button
  console.log('Entering dev room on global...');
  await page.click('#btn-menu-dev');
  await page.waitForTimeout(1000);

  // Trigger Whitebeard Q directly via evaluate
  console.log('Triggering Q directly via app._quickCastAbility("earth_spike")...');
  const res = await page.evaluate(() => {
    try {
      window.app._quickCastAbility('earth_spike');
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('Cast result on global:', res);

  // Capture at 0.15s (Immediate Impact & Color Inversion & 3D Air Cracks)
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outputDir, 'global_q_impact_0.15s.png') });
  console.log('Captured global_q_impact_0.15s.png');

  // Capture at 0.35s (Expanding 3D Air Cracks & Shockwave & Damage Popup)
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outputDir, 'global_q_damage_0.35s.png') });
  console.log('Captured global_q_damage_0.35s.png');

  await browser.close();
  console.log('Finished global verification.');
}

run().catch(console.error);
