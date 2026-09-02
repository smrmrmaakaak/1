import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage\\kizaru_kick';
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

  // Directly start battle with Kizaru (lumina)
  console.log('Starting battle with Kizaru (lumina)...');
  await page.evaluate(() => {
    window.app.startBattleWithHero('lumina', '황태민');
  });
  await page.waitForTimeout(2000);

  // Click Dev Room button
  console.log('Entering Dev Room...');
  await page.click('#btn-menu-dev');
  await page.waitForTimeout(1000);

  // Aim towards dummies and trigger Kizaru Z/Q (beam - Light Speed Kick)
  console.log('Triggering Kizaru Z/Q [Light Speed Kick]...');
  const res = await page.evaluate(() => {
    try {
      window.app._quickCastAbility('beam');
      return { success: true };
    } catch (e) {
      return { error: e.message, stack: e.stack };
    }
  });
  console.log('Cast result:', res);

  // Capture at 0.10s (Photon Dissolve, Blink & Foot 8-Ray Starburst)
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outputDir, 'kizaru_01_teleport_starburst_0.10s.png') });
  console.log('Captured kizaru_01_teleport_starburst_0.10s.png');

  // Capture at 0.35s (Kick Strike, Piercing Laser & Golden Plasma Detonation)
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outputDir, 'kizaru_02_kick_detonation_0.35s.png') });
  console.log('Captured kizaru_02_kick_detonation_0.35s.png');

  // Capture at 0.70s (Golden Shockwave & Lingering Photons)
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(outputDir, 'kizaru_03_lingering_photons_0.70s.png') });
  console.log('Captured kizaru_03_lingering_photons_0.70s.png');

  await browser.close();
  console.log('Finished Kizaru Light Speed Kick test.');
}

run().catch(console.error);
