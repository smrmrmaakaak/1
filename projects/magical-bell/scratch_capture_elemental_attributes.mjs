import { chromium } from 'playwright';

async function captureElementalAttributes() {
  console.log('📸 Capturing 7 Elemental Character Cards & Attributes...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#btn-hero-start', { timeout: 30000 });
    await page.waitForTimeout(1000);

    // Capture initial selection (Arthur - Frost)
    await page.screenshot({ path: 'elemental_01_arthur_ice.png' });

    // Click Raiden (Lightning)
    const cards = await page.$$('.showcase-hero-card');
    if (cards[1]) {
      await cards[1].click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'elemental_02_raiden_lightning.png' });
    }

    // Click Ignis (Fire)
    if (cards[2]) {
      await cards[2].click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'elemental_03_ignis_fire.png' });
    }

    // Click Lumina (Light)
    if (cards[3]) {
      await cards[3].click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'elemental_04_lumina_light.png' });
    }

    // Click Tesla (Wind)
    if (cards[4]) {
      await cards[4].click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'elemental_05_tesla_wind.png' });
    }

    // Click Boreas (Earth)
    if (cards[5]) {
      await cards[5].click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'elemental_06_boreas_earth.png' });
    }

    // Click Sera (Dark)
    if (cards[6]) {
      await cards[6].click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'elemental_07_sera_dark.png' });
    }

    console.log('✅ All 7 elemental attribute cards captured successfully!');
  } finally {
    await browser.close();
  }
}

captureElementalAttributes();
