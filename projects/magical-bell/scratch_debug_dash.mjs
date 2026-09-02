import { chromium } from 'playwright';

async function debugDashError() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[PAGE ERROR STACK]', err.stack || err.message));

  try {
    await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    console.log('Pressing Space...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    console.log('Pressing KeyD + Space...');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyD');

  } finally {
    await browser.close();
  }
}

debugDashError();
