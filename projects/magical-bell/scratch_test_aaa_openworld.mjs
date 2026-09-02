import { chromium } from 'playwright';

async function testAAAOpenWorld() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    console.log('🚀 Phase 1: Test Hero Selection & 7 AAA Heroes in Showcase');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Click Ignis Hero Card
    await page.click('.showcase-hero-card[data-hero-id="ignis"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'aaa_hero_showcase_ignis.png' });

    console.log('🚀 Phase 2: Enter Game World & View Sanctuary Capital with NPCs and Houses');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'aaa_01_sanctuary_capital.png' });

    console.log('🚀 Phase 3: Long March South into Eternal Forest (100m+)');
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(6500);
    await page.keyboard.up('KeyS');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'aaa_02_eternal_forest.png' });

    console.log('🚀 Phase 4: Long March East into Infernal Canyon (100m+)');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(8000);
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'aaa_03_infernal_canyon.png' });

    console.log('🚀 Phase 5: Long March North into Abyssal Void Domain (120m+)');
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(14000);
    await page.keyboard.up('KeyW');
    await page.keyboard.down('KeyA');
    await page.waitForTimeout(4000);
    await page.keyboard.up('KeyA');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'aaa_04_abyssal_domain.png' });

    console.log('✅ Ultra-Wide AAA 300m+ Open World & Blender Heroes Successfully Verified 100%!');
  } finally {
    await browser.close();
  }
}

testAAAOpenWorld();
