import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage';
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

  // Click start
  console.log('Clicking START button...');
  await page.click('#btn-hero-start');
  await page.waitForTimeout(3000);

  // Click canvas to aim to the right
  console.log('Aiming at canvas...');
  await page.mouse.click(800, 360);
  await page.waitForTimeout(500);

  // Press KeyQ
  console.log('Triggering KeyQ...');
  await page.keyboard.press('KeyQ');

  // Capture at 0.15s (Charge)
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outputDir, 'wb_q_charge_0.15s.png') });
  console.log('Captured wb_q_charge_0.15s.png');

  // Capture at 0.30s (Marineford Inversion & Air Cracks)
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outputDir, 'wb_q_impact_0.30s.png') });
  console.log('Captured wb_q_impact_0.30s.png');

  // Capture at 0.60s (Shockwave & Debris)
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, 'wb_q_debris_0.60s.png') });
  console.log('Captured wb_q_debris_0.60s.png');

  await browser.close();
  console.log('Finished Whitebeard Action test.');
}

run().catch(console.error);
