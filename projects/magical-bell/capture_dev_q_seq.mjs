import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outputDir = 'C:\\Users\\황태민\\.gemini\\antigravity\\brain\\c5a7b71f-d457-4321-a6c1-a87088e9f8bc\\.tempmediaStorage\\dev_q_seq';
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

  // Enter Dev Room via UI button
  console.log('Entering Dev Room...');
  await page.click('#btn-menu-dev');
  await page.waitForTimeout(1000);

  // Focus canvas and click
  await page.mouse.click(640, 360);
  await page.waitForTimeout(500);

  // Trigger Whitebeard Q directly via evaluate
  console.log('Triggering Whitebeard Q via app._quickCastAbility("earth_spike")...');
  await page.evaluate(() => {
    window.app._quickCastAbility('earth_spike');
  });

  // Capture sequence every 100ms from 0 to 1.2s
  for (let i = 0; i <= 10; i++) {
    const ms = i * 100;
    const filename = `seq_${String(i).padStart(2, '0')}_${ms}ms.png`;
    await page.screenshot({ path: path.join(outputDir, filename) });
    console.log(`Captured ${filename}`);
    await page.waitForTimeout(100);
  }

  await browser.close();
  console.log('Finished sequence capture.');
}

run().catch(console.error);
