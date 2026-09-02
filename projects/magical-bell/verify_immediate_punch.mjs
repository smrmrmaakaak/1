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
  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Click start
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // Click Dev Room button
  console.log('Clicking #btn-menu-dev...');
  await page.click('#btn-menu-dev');
  await page.waitForTimeout(1000);

  // Trigger Whitebeard Q directly via evaluate
  console.log('Triggering Q directly via app._quickCastAbility("earth_spike")...');
  await page.evaluate(() => {
    window.app._quickCastAbility('earth_spike');
  });

  // Capture at 0.10s (Immediate Impact & Color Inversion & 3D Air Cracks)
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outputDir, 'dev_q_immediate_impact_0.10s.png') });
  console.log('Captured dev_q_immediate_impact_0.10s.png');

  // Capture at 0.35s (Expanding 3D Air Cracks & Shockwave)
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outputDir, 'dev_q_immediate_impact_0.35s.png') });
  console.log('Captured dev_q_immediate_impact_0.35s.png');

  await browser.close();
  console.log('Finished immediate attack verification.');
}

run().catch(console.error);
