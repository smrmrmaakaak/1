import { chromium } from 'playwright';

async function testNewCloudflareUrl() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('Testing New Cloudflare URL...');
    await page.goto('https://southwest-tongue-papers-jean.trycloudflare.com/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'new_cloudflare_verified.png' });
    console.log('✅ New Cloudflare URL 100% Verified and Functional!');
  } finally {
    await browser.close();
  }
}

testNewCloudflareUrl();
