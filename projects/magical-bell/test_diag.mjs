import { chromium } from 'playwright';

async function diag() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message, err.stack));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const res = await page.evaluate(() => {
    try {
      const app = window.app;
      const ability = app.abilities.pools.get('tempest_catastrophe')?.active[0] || app.abilities.pools.get('tempest_catastrophe')?.pool._pool[0];
      const fireFist = app.abilities.pools.get('fire_fist')?.pool._pool[0];
      return {
        hasTempest: !!ability,
        tempestSparksType: typeof ability?.tempestSparks,
        tempestSparksHasEmit: typeof ability?.tempestSparks?.emit,
        fireFistHasSparks: typeof fireFist?.flameSparks?.emit
      };
    } catch (e) {
      return { error: e.message, stack: e.stack };
    }
  });

  console.log('Result:', res);
  await browser.close();
}

diag();
