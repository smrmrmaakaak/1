import { chromium } from 'playwright';

const GLOBAL_URL = 'https://video-recruitment-survival-regions.trycloudflare.com';

async function testGlobalAccess() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => console.log(`[GLOBAL LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[GLOBAL ERROR]', err.message));

  try {
    console.log(`Connecting to Global URL: ${GLOBAL_URL}`);
    const response = await page.goto(GLOBAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`HTTP Status: ${response.status()}`);

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'global_live_screenshot.png' });
    console.log('Global Live Screenshot captured successfully!');

    // Check if Hero Selection modal is visible
    const isModalVisible = await page.isVisible('#hero-select-modal');
    console.log(`Hero Selection Modal Visible over Global Network: ${isModalVisible}`);

  } catch (err) {
    console.error('Error loading global URL:', err);
  } finally {
    await browser.close();
  }
}

testGlobalAccess();
