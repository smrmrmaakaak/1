import { chromium } from 'playwright';

const GLOBAL_URL = 'https://video-recruitment-survival-regions.trycloudflare.com';

async function testMobileGlobal() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 844, height: 390 }, // iPhone Landscape
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();

  try {
    await page.goto(GLOBAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);

    await page.screenshot({ path: 'global_mobile_01_hero_select.png' });

    // Tap Raiden
    await page.click('.hero-card[data-hero-id="raiden"]');
    await page.waitForTimeout(400);

    // Tap Start
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'global_mobile_02_battle.png' });
    console.log('Mobile Global Test Success!');

  } finally {
    await browser.close();
  }
}

testMobileGlobal();
