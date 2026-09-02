import { chromium } from 'playwright';

async function testBlizzard() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const logs = [];
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error('[PAGE ERROR]', msg.text());
    } else {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('[UNCAUGHT]', err.message);
  });

  try {
    console.log('Navigating to http://127.0.0.1:5174/ ...');
    await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Aiming and pressing KeyC...');
    await page.mouse.move(750, 250);
    await page.keyboard.press('KeyC');
    await page.waitForTimeout(500);

    console.log('Clicking to cast Blizzard at (750, 250)...');
    await page.mouse.click(750, 250);
    await page.waitForTimeout(800);

    await page.screenshot({ path: 'blizzard_test_cast_1.png' });
    console.log('Screenshot cast 1 captured');

    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'blizzard_test_cast_2.png' });
    console.log('Screenshot cast 2 captured');

    console.log('Errors count:', errors.length);
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
}

testBlizzard();
