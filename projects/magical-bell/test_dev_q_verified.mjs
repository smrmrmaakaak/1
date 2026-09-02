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

  // Click canvas to aim at the dummy in the middle
  console.log('Aiming at dummy...');
  await page.mouse.click(640, 260);
  await page.waitForTimeout(200);

  // Press KeyQ
  console.log('Pressing KeyQ for Whitebeard Q Attack...');
  await page.keyboard.press('KeyQ');

  // Capture at 0.15s (Grab & Lift)
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outputDir, 'dev_q_grab_verified.png') });
  console.log('Captured dev_q_grab_verified.png');

  // Capture at 0.35s (Slam & Shattered Space & Color Inversion)
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outputDir, 'dev_q_slam_verified.png') });
  console.log('Captured dev_q_slam_verified.png');

  // Capture at 0.65s (Debris & Lingering Shatter)
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, 'dev_q_debris_verified.png') });
  console.log('Captured dev_q_debris_verified.png');

  await browser.close();
  console.log('Finished full verification.');
}

run().catch(console.error);
