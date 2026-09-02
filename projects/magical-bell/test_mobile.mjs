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

  // Mobile Landscape (iPhone 14 / Galaxy S23)
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  console.log('Navigating to https://elemental-defense-rpg.web.app on Mobile...');
  await page.goto('https://elemental-defense-rpg.web.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  // Capture Mobile Intro
  console.log('Capturing Mobile Intro...');
  await page.screenshot({ path: path.join(outputDir, 'mobile_web_intro.png') });

  // Click start on mobile
  await page.tap('#btn-hero-start');
  await page.waitForTimeout(2500);

  // Capture Mobile In-Game Controls
  console.log('Capturing Mobile In-Game Controls...');
  await page.screenshot({ path: path.join(outputDir, 'mobile_web_ingame.png') });

  // Tap mobile chat button in menu bar
  await page.tap('#btn-menu-chat');
  await page.waitForTimeout(1000);
  console.log('Capturing Mobile Chat Opened...');
  await page.screenshot({ path: path.join(outputDir, 'mobile_web_chat_open.png') });

  await browser.close();
  console.log('Finished Mobile Verification test successfully.');
}

run().catch(console.error);
