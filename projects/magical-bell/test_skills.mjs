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

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  console.log('Navigating to https://elemental-defense-rpg.web.app ...');
  await page.goto('https://elemental-defense-rpg.web.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 1. Select Akainu card
  console.log('Selecting Akainu card...');
  await page.click('[data-hero-id="akainu"]');
  await page.waitForTimeout(600);

  // 2. Click START button
  console.log('Clicking START button #btn-hero-start...');
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2000);

  // 3. Test T Skill (유성 화산)
  console.log('Pressing KeyT...');
  await page.keyboard.press('KeyT');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, 't_sky_1.0s.png') });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 't_sky_2.5s.png') });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 't_sky_4.0s.png') });

  await browser.close();
  console.log('Finished Playwright test.');
}

run().catch(console.error);
