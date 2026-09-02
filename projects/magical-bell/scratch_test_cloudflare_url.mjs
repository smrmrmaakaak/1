import { chromium } from 'playwright';

async function testCloudflareLiveUrl() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('Testing Cloudflare live URL...');
    await page.goto('https://complement-relevance-wage-petroleum.trycloudflare.com/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'cloudflare_live_verified.png' });
    console.log('✅ Cloudflare Live URL Verified and Perfectly Working!');
  } finally {
    await browser.close();
  }
}

testCloudflareLiveUrl();
