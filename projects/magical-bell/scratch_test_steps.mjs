import { chromium } from 'playwright';

async function testScreenshots() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));

  try {
    await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '01_initial_scene.png' });
    console.log('01_initial_scene captured');

    await page.mouse.move(750, 250);
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(300);

    await page.screenshot({ path: '02_aiming_c.png' });
    console.log('02_aiming_c captured');

    await page.mouse.click(750, 250);
    await page.waitForTimeout(400);

    await page.screenshot({ path: '03_after_c_click.png' });
    console.log('03_after_c_click captured');
  } finally {
    await browser.close();
  }
}

testScreenshots();
