import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function run() {
  const outDir = path.resolve('temp_screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=gl', '--no-sandbox']
  });

  // Mobile Landscape (844 x 390 - iPhone 14 landscape standard)
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  console.log('Navigating to https://elemental-defense-rpg.web.app ...');
  await page.goto('https://elemental-defense-rpg.web.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 1. Screenshot Hero Select Screen
  await page.screenshot({ path: path.join(outDir, 'mobile_01_hero_select_clean.png') });
  console.log('Saved mobile_01_hero_select_clean.png');

  // Trigger start via DOM directly
  console.log('Starting battle...');
  await page.evaluate(() => {
    const btn = document.getElementById('btn-hero-start');
    if (btn) btn.click();
  });

  await page.waitForTimeout(3500);

  // 2. Screenshot In-Game Battle Screen
  await page.screenshot({ path: path.join(outDir, 'mobile_02_battle_screen_clean.png') });
  console.log('Saved mobile_02_battle_screen_clean.png');

  await browser.close();
}

run().catch(console.error);
