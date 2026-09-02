import { chromium } from 'playwright';

async function testCastDebug() {
  console.log('❄️ Debugging Avalanche ability...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist', '--disable-gpu-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#preloader', { state: 'detached', timeout: 30000 });
    await page.waitForSelector('#btn-hero-start', { state: 'visible', timeout: 10000 });
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    const result = await page.evaluate(() => {
      console.log('Arthur loaded. Now arming avalanche...');
      window.app.armAbility('avalanche');
      console.log('Is armed:', window.app.aim.isArmed);
      console.log('Aim valid:', window.app.aim.valid);
      
      // Directly invoke _cast
      window.app._cast(window.app.character.position, window.app.aim.direction, 15);
      console.log('Active abilities after cast:', window.app.abilities.active.length);
      return {
        active: window.app.abilities.active.length,
        element: window.app.element
      };
    });

    console.log('Cast result:', result);

    await page.waitForTimeout(600);
    await page.screenshot({ path: 'test_direct_01.png' });

    await page.waitForTimeout(700);
    await page.screenshot({ path: 'test_direct_02.png' });

    await page.waitForTimeout(700);
    await page.screenshot({ path: 'test_direct_03.png' });
  } finally {
    await browser.close();
  }
}

testCastDebug();
