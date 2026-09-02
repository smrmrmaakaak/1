import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage\\aokiji_ice_age';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Directly start battle with Aokiji (arthur)
  console.log('Starting battle with Aokiji (arthur)...');
  await page.evaluate(() => {
    window.app.startBattleWithHero('arthur', '황태민');
  });
  await page.waitForTimeout(2500);

  // Click Dev Room button
  console.log('Entering Dev Room...');
  await page.click('#btn-menu-dev');
  await page.waitForTimeout(1000);

  // Trigger Aokiji T (avalanche - Ice Age)
  console.log('Triggering Aokiji T [Ice Age / avalanche]...');
  const res = await page.evaluate(() => {
    try {
      window.app._quickCastAbility('avalanche');
      return { success: true };
    } catch (e) {
      return { error: e.message, stack: e.stack };
    }
  });
  console.log('Cast result:', res);

  // Capture at 0.20s (Glaciation Wave & 32 Frost Tendrils)
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outputDir, 'aokiji_t_01_glaciation_0.20s.png') });
  console.log('Captured aokiji_t_01_glaciation_0.20s.png');

  // Capture at 0.70s (16 Glacial Monoliths Violent Eruption & Cryostasis Ice Prisons)
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'aokiji_t_02_peaks_eruption_0.70s.png') });
  console.log('Captured aokiji_t_02_peaks_eruption_0.70s.png');

  // Capture at 2.20s (Full Arctic Frozen Sea Battlefield)
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'aokiji_t_03_arctic_frozen_field_2.20s.png') });
  console.log('Captured aokiji_t_03_arctic_frozen_field_2.20s.png');

  await browser.close();
  console.log('Finished Aokiji Ice Age test.');
}

run().catch(console.error);
