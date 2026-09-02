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
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // Press F1 to enter Dev Room
  console.log('Pressing F1 to enter Dev Room...');
  await page.keyboard.press('F1');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(outputDir, 'dev_room_entered.png') });
  console.log('Captured dev_room_entered.png');

  // Aim towards upper screen (where dummies are lined up) and press KeyQ
  console.log('Aiming at dummy and pressing KeyQ...');
  await page.mouse.move(640, 200);
  await page.waitForTimeout(200);
  await page.keyboard.press('KeyQ');

  // Capture at 0.15s (Player Teleported to dummy)
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outputDir, 'dev_dummy_teleport_0.15s.png') });
  console.log('Captured dev_dummy_teleport_0.15s.png');

  // Capture at 0.35s (Air cracks & damage popup on dummy)
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outputDir, 'dev_dummy_impact_0.35s.png') });
  console.log('Captured dev_dummy_impact_0.35s.png');

  await browser.close();
  console.log('Finished Dev Room Dummy test.');
}

run().catch(console.error);
