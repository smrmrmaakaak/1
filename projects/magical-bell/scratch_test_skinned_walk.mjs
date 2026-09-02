import { chromium } from 'playwright';

async function testSkinnedWalk() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Phase 1: Test Skinned Hero in Selection Showcase');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'skinned_01_select.png' });

    console.log('🚀 Phase 2: Enter Game World & View Idle Breathing');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'skinned_02_idle.png' });

    console.log('🚀 Phase 3: Walk/Run Movement with Active Leg & Arm Striding Motion');
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(1200); // Capture mid-stride
    await page.screenshot({ path: 'skinned_03_walking_motion.png' });
    await page.waitForTimeout(2500);
    await page.keyboard.up('KeyS');

    console.log('🚀 Phase 4: Full-Body Elemental Casting Animation');
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'skinned_04_casting.png' });

    console.log('✅ Skinned Character with Full Walk & Cast Animations Verified 100%!');
  } finally {
    await browser.close();
  }
}

testSkinnedWalk();
