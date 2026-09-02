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

  // Capture Full-Body Character and NPCs Standing on the Ground
  console.log('Capturing standing views...');
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.rig) {
      app.rig.distance = 12.0;
      app.rig.controls.object.position.set(0, 3.5, 12);
      app.rig.controls.target.set(0, 1.2, 0);
      app.rig.controls.update();
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, 'standing_01_full_body.png') });
  console.log('Captured standing_01_full_body.png');

  // Side angle view to see feet firmly planted on ground
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.rig) {
      app.rig.controls.object.position.set(8, 2.2, 5);
      app.rig.controls.target.set(0, 1.0, 0);
      app.rig.controls.update();
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, 'standing_02_side_profile.png') });
  console.log('Captured standing_02_side_profile.png');

  // Cast Dark Domain Room and capture full-body inside dome
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.abilities && app.character) {
      const pos = app.character.position.clone();
      const dir = app.character.position.clone().set(0, 0, 1);
      app.abilities.cast(pos, dir, 1.0, 'abyss_eruption');
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, 'standing_03_dark_domain_full_body.png') });
  console.log('Captured standing_03_dark_domain_full_body.png');

  await browser.close();
  console.log('All standing screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
