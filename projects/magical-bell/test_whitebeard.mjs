import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-quic',
      '--use-gl=angle',
      '--use-angle=swiftshader'
    ]
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  console.log('Navigating to https://elemental-defense-rpg.web.app ...');
  await page.goto('https://elemental-defense-rpg.web.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  // Select Whitebeard (data-hero-id="boreas")
  console.log('Selecting Whitebeard card...');
  const card = await page.$('[data-hero-id="boreas"]');
  if (card) {
    await card.click();
  }
  await page.waitForTimeout(1000);

  // Click START
  console.log('Clicking START button...');
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // Press Q (Air Quake Single-Target Marineford 484 Grab)
  console.log('Pressing KeyQ for Whitebeard Q...');
  await page.keyboard.press('KeyQ');

  // Capture Grab & Charge Phase (0.15s)
  await page.waitForTimeout(150);
  console.log('Capturing Whitebeard Q Grab & Charge...');
  await page.screenshot({ path: path.join(outputDir, 'whitebeard_q_grab.png') });

  // Capture Impact & Red/Blue Inversion & Air Cracks (0.35s)
  await page.waitForTimeout(200);
  console.log('Capturing Whitebeard Q Inversion & Air Cracks...');
  await page.screenshot({ path: path.join(outputDir, 'whitebeard_q_impact.png') });

  // Capture Debris & Shockwave (0.7s)
  await page.waitForTimeout(400);
  console.log('Capturing Whitebeard Q Shockwave & Debris...');
  await page.screenshot({ path: path.join(outputDir, 'whitebeard_q_debris.png') });

  await browser.close();
  console.log('Finished Whitebeard Playwright test.');
}

run().catch(console.error);
