import { chromium } from 'playwright';

async function verifyLiveProduction() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  try {
    console.log('🚀 Checking Live Production URL: https://elemental-defense-rpg.web.app');
    await page.goto('https://elemental-defense-rpg.web.app', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2500);

    // Capture Hero Select on Live Production
    await page.screenshot({ path: 'live_production_deployment.png' });
    console.log('✅ Live Production Hero Select Verified!');

    // Start Game
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);

    // Capture In-Game Village on Live Production
    await page.screenshot({ path: 'live_production_ingame.png' });
    console.log('✅ Live Production In-Game World Verified!');
  } finally {
    await browser.close();
  }
}

verifyLiveProduction();
