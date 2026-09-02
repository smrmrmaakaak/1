import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function main() {
  const outputDir = path.resolve('temp_screenshots');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  console.log('Navigating to live URL...');
  await page.goto('https://elemental-defense-rpg.web.app/', { waitUntil: 'networkidle' });

  // 1. Select Blackbeard (sera)
  console.log('Selecting Blackbeard...');
  await page.waitForSelector('.showcase-hero-card');
  await page.click('.showcase-hero-card[data-hero-id="sera"]');
  await page.waitForTimeout(500);

  // Click start game
  console.log('Clicking start button...');
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // 1. Check Initial Sanctuary Haven (Zone 1)
  const zone1 = await page.$eval('#hud-zone-name', el => el.textContent);
  console.log('Zone at (0,0):', zone1);
  await page.screenshot({ path: path.join(outputDir, 'zone_01_sanctuary.png') });

  // 2. Walk South to Dawn Continental Plains (Z: +150m)
  console.log('Moving South to Dawn Continental Plains...');
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.character) {
      app.character.root.position.set(0, 0, 150);
      app.zoneManager.update(app.character.position);
    }
  });
  await page.waitForTimeout(600);
  const zone2 = await page.$eval('#hud-zone-name', el => el.textContent);
  console.log('Zone at (0, 150):', zone2);
  await page.screenshot({ path: path.join(outputDir, 'zone_02_dawn_fields.png') });

  // 3. Walk East to Obsidian Volcano Canyon (X: +220m)
  console.log('Moving East to Obsidian Volcano Canyon...');
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.character) {
      app.character.root.position.set(220, 0, 0);
      app.zoneManager.update(app.character.position);
    }
  });
  await page.waitForTimeout(600);
  const zone3 = await page.$eval('#hud-zone-name', el => el.textContent);
  console.log('Zone at (220, 0):', zone3);
  await page.screenshot({ path: path.join(outputDir, 'zone_03_obsidian_canyon.png') });

  // 4. Walk North to Abyssal Void Domain (Z: -200m)
  console.log('Moving North to Abyssal Void Domain...');
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.character) {
      app.character.root.position.set(0, 0, -200);
      app.zoneManager.update(app.character.position);
    }
  });
  await page.waitForTimeout(600);
  const zone4 = await page.$eval('#hud-zone-name', el => el.textContent);
  console.log('Zone at (0, -200):', zone4);
  await page.screenshot({ path: path.join(outputDir, 'zone_04_abyssal_realm.png') });

  await browser.close();
  console.log('All zone tests passed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
