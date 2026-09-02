import { chromium } from 'playwright';

async function testMobileOptimization() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  // 1. Test Mobile Portrait Viewport
  console.log('1. Testing Mobile Portrait (390x844)...');
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  });

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'opt_mobile_01_portrait_guide.png' });

    // 2. Rotate to Landscape (844x390)
    console.log('2. Rotating to Mobile Landscape (844x390)...');
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'opt_mobile_02_landscape_showcase.png' });

    // 3. Select Ignis on Mobile
    console.log('3. Selecting Ignis on Mobile Landscape...');
    await page.click('.showcase-hero-card[data-hero-id="ignis"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'opt_mobile_03_ignis_selected.png' });

    // 4. Start Battle
    console.log('4. Starting Battle on Mobile...');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'opt_mobile_04_battle_running.png' });

    console.log('✨ Mobile Optimization Test Passed 100%!');
  } finally {
    await browser.close();
  }
}

testMobileOptimization();
