import { chromium } from 'playwright';

async function testMobileShowcase() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  // Mobile landscape viewport
  const page = await browser.newPage({ viewport: { width: 844, height: 390 } });

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('Capturing mobile landscape Arthur showcase...');
    await page.screenshot({ path: 'showcase_mobile_arthur.png' });

    console.log('Switching to Ignis on mobile...');
    await page.click('.showcase-hero-card[data-hero-id="ignis"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'showcase_mobile_ignis.png' });

    console.log('✨ Mobile 3D Showcase test passed!');
  } finally {
    await browser.close();
  }
}

testMobileShowcase();
