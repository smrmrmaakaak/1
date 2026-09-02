import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage\\frames';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2500);

  // Click start
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // Focus and press KeyQ
  console.log('Triggering KeyQ and capturing 0.1s frame sequence...');
  await page.keyboard.press('KeyQ');

  for (let i = 0; i <= 10; i++) {
    const timeMs = i * 100;
    const filename = `frame_${String(i).padStart(2, '0')}_${timeMs}ms.png`;
    await page.screenshot({ path: path.join(outputDir, filename) });
    console.log(`Captured ${filename}`);
    await page.waitForTimeout(100);
  }

  await browser.close();
  console.log('Finished capturing frame sequence.');
}

run().catch(console.error);
