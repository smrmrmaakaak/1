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

  // Select Aokiji (data-hero-id="arthur")
  console.log('Selecting Aokiji...');
  const aokijiCard = await page.$('[data-hero-id="arthur"]');
  if (aokijiCard) {
    await aokijiCard.click();
    await page.waitForTimeout(1000);
  }

  // Click start
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // Click Dev Room button
  console.log('Entering Dev Room...');
  await page.click('#btn-menu-dev');
  await page.waitForTimeout(1000);

  // Aim towards dummies and trigger Aokiji T (avalanche - Ice Age)
  console.log('Triggering Aokiji T [Ice Age]...');
  await page.evaluate(() => {
    window.app._quickCastAbility('avalanche');
  });

  // Capture at 0.20s (Glaciation Wave & Frost Tendrils)
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outputDir, 'aokiji_t_01_glaciation_0.20s.png') });
  console.log('Captured aokiji_t_01_glaciation_0.20s.png');

  // Capture at 0.70s (16 Glacial Monoliths Eruption & Cryostasis Prisons)
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'aokiji_t_02_peaks_eruption_0.70s.png') });
  console.log('Captured aokiji_t_02_peaks_eruption_0.70s.png');

  // Capture at 2.20s (Majestic Frozen Arctic Battlefield)
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'aokiji_t_03_arctic_frozen_field_2.20s.png') });
  console.log('Captured aokiji_t_03_arctic_frozen_field_2.20s.png');

  await browser.close();
  console.log('Finished Aokiji Ice Age test.');
}

run().catch(console.error);
