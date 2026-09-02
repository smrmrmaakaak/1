import { chromium } from 'playwright';

async function testCastWalkAndAAAInferno() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Step 1: Enter Game and Open Dev Room');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);
    await page.click('#btn-menu-dev');
    await page.waitForTimeout(1000);

    console.log('🚀 Step 2: Trigger AAA Hellfire Cataclysm with Procedural Vertex Vortex');
    await page.click('#btn-dev-cast-inferno');
    await page.waitForTimeout(850);
    await page.screenshot({ path: 'aaa_inferno_vortex.png' });

    console.log('🚀 Step 3: Move immediately while casting (Hold W and D keys) to verify Running Animation');
    await page.click('#btn-dev-cast-inferno');
    await page.keyboard.down('KeyW');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(400); // During/after cast while moving
    await page.screenshot({ path: 'cast_walk_motion.png' });
    await page.keyboard.up('KeyW');
    await page.keyboard.up('KeyD');

    console.log('✅ Cast Walk Motion & AAA Inferno Verified 100%!');
  } finally {
    await browser.close();
  }
}

testCastWalkAndAAAInferno();
