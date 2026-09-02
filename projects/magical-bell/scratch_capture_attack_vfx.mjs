import { chromium } from 'playwright';

async function captureHeroAttacks() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const heroes = ['arthur', 'raiden', 'ignis', 'lumina', 'sera'];

    for (const h of heroes) {
      await page.evaluate((heroId) => {
        window.app.heroSelectModal.selectHero(heroId);
      }, h);

      // Wait 350ms for VFX explosion at peak
      await page.waitForTimeout(350);
      await page.screenshot({ path: `vfx_showcase_${h}.png` });
      console.log(`Captured live VFX attack for: ${h}`);
    }

  } finally {
    await browser.close();
  }
}

captureHeroAttacks();
