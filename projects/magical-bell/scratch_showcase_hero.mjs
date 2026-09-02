import { chromium } from 'playwright';

async function showcaseHero() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Zoom camera close to character for showcase
    await page.evaluate(() => {
      window.app.rig.camera.position.set(0, 2.5, 4.8);
      window.app.rig.controls.target.set(0, 1.2, 0);
      window.app.rig.controls.update();
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'hero_01_ignis_closeup.png' });
    console.log('Hero closeup screenshot captured');

    // Orbit to angled 3/4 view
    await page.evaluate(() => {
      window.app.rig.camera.position.set(-3.2, 2.8, 4.2);
      window.app.rig.controls.target.set(0, 1.2, 0);
      window.app.rig.controls.update();
    });

    await page.waitForTimeout(800);
    await page.screenshot({ path: 'hero_02_ignis_angled.png' });
    console.log('Hero angled screenshot captured');

    // Walk forward to test procedural cape, halo and greatsword
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'hero_03_ignis_walking.png' });
    await page.keyboard.up('KeyW');

    console.log('Showcase completed successfully!');
  } finally {
    await browser.close();
  }
}

showcaseHero();
