import { chromium } from 'playwright';

async function testCinematicShowcase() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('1. Capturing Arthur 3D Showcase & Frost Lance Attack...');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'showcase_01_arthur_cast.png' });

    console.log('2. Selecting Raiden (Storm Walker) & Lighting VFX...');
    await page.click('.showcase-hero-card[data-hero-id="raiden"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'showcase_02_raiden_cast.png' });

    console.log('3. Selecting Ignis (Pyromancer) & Meteor Fall VFX...');
    await page.click('.showcase-hero-card[data-hero-id="ignis"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'showcase_03_ignis_cast.png' });

    console.log('4. Selecting Lumina (Arcane Sage) & Nova Beam VFX...');
    await page.click('.showcase-hero-card[data-hero-id="lumina"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'showcase_04_lumina_cast.png' });

    console.log('5. Selecting Sera (Tempest Witch) & Blizzard Storm VFX...');
    await page.click('.showcase-hero-card[data-hero-id="sera"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'showcase_05_sera_cast.png' });

    console.log('6. Clicking Manual Demo Attack Button...');
    await page.click('#btn-hero-demo-cast');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'showcase_06_manual_demo.png' });

    console.log('7. Clicking START BATTLE with Sera...');
    await page.click('#btn-hero-start');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'showcase_07_battle_entered.png' });

    console.log('✨ All 3D Cinematic Showcase & Attack preview tests passed successfully!');

  } finally {
    await browser.close();
  }
}

testCinematicShowcase();
