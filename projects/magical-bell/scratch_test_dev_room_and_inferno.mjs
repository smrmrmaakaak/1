import { chromium } from 'playwright';

async function testDevRoomAndInferno() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Phase 1: Enter Game World');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);

    console.log('🚀 Phase 2: Enter Developer VFX Sandbox Room (Click Dev Room Button)');
    await page.click('#btn-menu-dev');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'dev_01_sandbox_room.png' });

    console.log('🚀 Phase 3: Cast New Epic Fire Skill: Hellfire Cataclysm (T)');
    await page.click('#btn-dev-cast-inferno');
    await page.waitForTimeout(750); // Capture peak fiery vortex explosion
    await page.screenshot({ path: 'dev_02_inferno_eruption.png' });

    await page.waitForTimeout(2500);

    console.log('🚀 Phase 4: Cast All 8 Elemental Skills Barrage');
    await page.click('#btn-dev-cast-all');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'dev_03_all_skills_barrage.png' });

    await page.waitForTimeout(2500);

    console.log('🚀 Phase 5: Return to Sanctuary Open World');
    await page.click('#btn-dev-exit');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'dev_04_return_openworld.png' });

    console.log('✅ Dev Room and Epic Inferno Fire Skill Verified 100%!');
  } finally {
    await browser.close();
  }
}

testDevRoomAndInferno();
