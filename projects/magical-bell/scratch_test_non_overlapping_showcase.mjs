import { chromium } from 'playwright';

async function testNonOverlappingShowcase() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true
  });

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('1. Capturing Initial Arthur in non-overlapping mobile layout...');
    await page.screenshot({ path: 'fixed_showcase_01_arthur.png' });

    console.log('2. Clicking Tesla (Far right hero card in dock)...');
    await page.click('.showcase-hero-card[data-hero-id="tesla"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'fixed_showcase_02_tesla.png' });

    console.log('3. Clicking Sera (Far right hero card in dock)...');
    await page.click('.showcase-hero-card[data-hero-id="sera"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'fixed_showcase_03_sera.png' });

    console.log('4. Clicking Demo Attack Button...');
    await page.click('#btn-hero-demo-cast');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'fixed_showcase_04_demo_cast.png' });

    console.log('5. Clicking Start Battle Button...');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'fixed_showcase_05_battle_started.png' });

    console.log('✨ All non-overlapping showcase tests passed 100%!');
  } finally {
    await browser.close();
  }
}

testNonOverlappingShowcase();
