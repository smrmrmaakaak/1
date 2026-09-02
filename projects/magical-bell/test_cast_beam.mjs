import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.app && window.app.isHeroSelecting !== undefined);
  await page.waitForTimeout(1000);

  // Start with Kizaru
  await page.evaluate(() => {
    window.app.startBattleWithHero('lumina', '황태민');
  });
  await page.waitForTimeout(2000);

  // Enter dev room
  await page.click('#btn-menu-dev');
  await page.waitForTimeout(1000);

  // Trigger beam
  console.log('Casting beam...');
  const res = await page.evaluate(() => {
    try {
      console.log('App element:', window.app.element);
      console.log('Allowed skills:', Array.from(window.app.allowedHeroSkills || []));
      window.app._quickCastAbility('beam');
      return { success: true };
    } catch (e) {
      return { error: e.message, stack: e.stack };
    }
  });

  console.log('Cast result:', res);
  await page.waitForTimeout(1000);
  await browser.close();
}

run().catch(console.error);
