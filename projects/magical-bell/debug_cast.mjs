import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click start
  await page.click('#btn-hero-start');
  await page.waitForTimeout(2500);

  // Click Dev Room button
  console.log('Entering dev room...');
  await page.click('#btn-menu-dev');
  await page.waitForTimeout(1000);

  console.log('Evaluating _quickCastAbility("earth_spike")...');
  const result = await page.evaluate(() => {
    try {
      console.log('Current element:', window.app.element);
      console.log('Allowed skills:', Array.from(window.app.allowedHeroSkills || []));
      console.log('Unlocked skills:', Array.from(window.app.unlockedSkills || []));
      console.log('Cooldown:', window.app.cooldowns.get('earth_spike'));
      console.log('Is in dev room:', window.app.devRoom?.isInDevRoom);
      window.app._quickCastAbility('earth_spike');
      return { success: true };
    } catch (e) {
      return { error: e.message, stack: e.stack };
    }
  });

  console.log('Result:', result);
  await page.waitForTimeout(500);
  await browser.close();
}

run().catch(console.error);
