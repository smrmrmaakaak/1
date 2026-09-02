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
  await page.waitForTimeout(2000);

  // Cast Dark Domain Room via window.app
  console.log('Casting Dark Domain Room...');
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.abilities && app.character) {
      const pos = app.character.position.clone();
      const dir = app.character.position.clone().set(0, 0, 1);
      const ab = app.abilities.cast(pos, dir, 1.0, 'abyss_eruption');
      console.log('*** ABILITY CAST TRIGGERED ***:', ab ? ab.element : 'FAIL', 'Active:', app.abilities.active.length);
    }
  });
  await page.waitForTimeout(600);

  // 1. Blackbeard Hero 3rd person perspective (Standing in the center of the majestic Dark Domain Room)
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.rig) {
      app.rig.controls.rotateLeft(0.4);
      app.rig.controls.rotateUp(0.15);
      app.rig.controls.update();
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'dark_domain_01_blackbeard_cast.png') });
  console.log('Captured dark_domain_01_blackbeard_cast.png');

  // 2. Adjust camera to Outside Perspective (Looking from 60m away outside the barrier)
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.rig) {
      app.rig.controls.object.position.set(0, 30, 75);
      app.rig.controls.target.set(0, 5, 0);
      app.rig.controls.update();
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'dark_domain_02_outside_perspective.png') });
  console.log('Captured dark_domain_02_outside_perspective.png');

  // 3. Adjust camera to Inside Perspective (Trapped enemy looking up inside the blinding void dome)
  await page.evaluate(() => {
    const app = window.app;
    if (app && app.rig) {
      app.rig.controls.object.position.set(6, 1.5, 6);
      app.rig.controls.target.set(0, 10, 0);
      app.rig.controls.update();
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, 'dark_domain_03_inside_enemy_perspective.png') });
  console.log('Captured dark_domain_03_inside_enemy_perspective.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
