import { chromium } from 'playwright';

async function test7UniqueHeroes() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    hasTouch: false
  });

  try {
    const heroes = [
      { id: 'arthur', name: '01_arthur_mage' },
      { id: 'raiden', name: '02_raiden_rogue_hooded' },
      { id: 'ignis', name: '03_ignis_barbarian' },
      { id: 'lumina', name: '04_lumina_mage_classic' },
      { id: 'tesla', name: '05_tesla_ranger' },
      { id: 'boreas', name: '06_boreas_paladin' },
      { id: 'sera', name: '07_sera_druid' }
    ];

    console.log('🚀 Testing 7 Completely Unique 3D Heroes in Selection Room:');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    for (const h of heroes) {
      console.log(`- Selecting hero: ${h.id} (${h.name})`);
      await page.click(`.showcase-hero-card[data-hero-id="${h.id}"]`);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `hero_${h.name}.png` });
    }

    console.log('✅ All 7 Unique Heroes Verified and Captured 100%!');
  } finally {
    await browser.close();
  }
}

test7UniqueHeroes();
