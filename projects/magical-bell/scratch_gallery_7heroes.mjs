import { chromium } from 'playwright';

const HERO_IDS = ['arthur', 'raiden', 'ignis', 'lumina', 'tesla', 'boreas', 'sera'];

async function captureAllHeroes() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    // Hide select modal & setup studio camera
    await page.evaluate(() => {
      window.app.heroSelectModal.hide();
      window.app.paused = true;
      window.app.rig.camera.position.set(1.4, 1.4, 2.2);
      window.app.rig.controls.target.set(0, 1.1, 0);
      window.app.rig.controls.update();
      window.app.character.root.rotation.y = 0;
    });

    for (const heroId of HERO_IDS) {
      await page.evaluate((id) => {
        window.app.selectHero(id);
      }, heroId);

      await page.waitForTimeout(400);
      await page.screenshot({ path: `gallery_hero_${heroId}.png` });
      console.log(`Captured 3D gallery shot for: ${heroId}`);
    }

  } finally {
    await browser.close();
  }
}

captureAllHeroes();
