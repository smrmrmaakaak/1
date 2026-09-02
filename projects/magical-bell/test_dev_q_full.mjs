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

  // Press F1 to enter Dev Room
  console.log('Pressing F1...');
  await page.keyboard.press('F1');
  await page.waitForTimeout(1000);

  // Aim towards upper screen at dummy and press KeyQ
  console.log('Aiming at dummy and pressing KeyQ...');
  await page.mouse.move(640, 200);
  await page.waitForTimeout(200);
  await page.keyboard.press('KeyQ');

  // Capture at 0.18s (Grab & Charge Phase)
  await page.waitForTimeout(180);
  await page.screenshot({ path: path.join(outputDir, 'q_stage1_grab_charge.png') });
  console.log('Captured q_stage1_grab_charge.png');

  // Capture at 0.38s (Smash & Air Cracks & Inversion Impact)
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outputDir, 'q_stage2_smash_impact.png') });
  console.log('Captured q_stage2_smash_impact.png');

  // Capture at 0.70s (Debris & Lingering Shatter)
  await page.waitForTimeout(320);
  await page.screenshot({ path: path.join(outputDir, 'q_stage3_lingering_shatter.png') });
  console.log('Captured q_stage3_lingering_shatter.png');

  await browser.close();
  console.log('Finished full Q test.');
}

run().catch(console.error);
