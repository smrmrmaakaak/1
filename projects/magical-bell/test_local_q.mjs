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

  // Click start (Whitebeard is selected by default)
  console.log('Clicking START button...');
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // Press KeyQ
  console.log('Pressing KeyQ for Whitebeard Q on Localhost...');
  await page.keyboard.press('KeyQ');
  await page.waitForTimeout(300);

  await page.screenshot({ path: path.join(outputDir, 'localhost_whitebeard_q.png') });
  console.log('Finished capturing localhost_whitebeard_q.png');
  await browser.close();
}

run().catch(console.error);
