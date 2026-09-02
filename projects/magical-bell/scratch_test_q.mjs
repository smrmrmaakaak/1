import { chromium } from 'playwright';

async function testQ() {
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

    console.log('Aiming and pressing KeyQ...');
    await page.mouse.move(800, 300);
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(500);

    console.log('Clicking to cast Frost Lance (Q)...');
    await page.mouse.click(800, 300);
    await page.waitForTimeout(800);

    await page.screenshot({ path: 'q_test_cast.png' });
    console.log('Screenshot Q captured');
  } finally {
    await browser.close();
  }
}

testQ();
