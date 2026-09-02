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

  // Click start on global
  console.log('Clicking START button on global...');
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // Press KeyQ on global
  console.log('Pressing KeyQ on global...');
  await page.keyboard.press('KeyQ');
  await page.waitForTimeout(300);

  await page.screenshot({ path: path.join(outputDir, 'global_whitebeard_q_verified.png') });
  console.log('Finished capturing global_whitebeard_q_verified.png');
  await browser.close();
}

run().catch(console.error);
