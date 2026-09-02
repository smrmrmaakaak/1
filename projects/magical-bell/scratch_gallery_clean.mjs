import { chromium } from 'playwright';

const HERO_IDS = ['arthur', 'raiden', 'ignis', 'lumina', 'tesla', 'boreas', 'sera'];

async function captureAllHeroesClean() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    // Hide modals & position close camera
    await page.evaluate(() => {
      window.app.heroSelectModal.hide();
      window.app.game.dom.shopModal.style.display = 'none';
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

      await page.waitForTimeout(300);
      await page.screenshot({ path: `3d_hero_${heroId}.png` });
      console.log(`Saved 3d_hero_${heroId}.png`);
    }

  } finally {
    await browser.close();
  }
}

captureAllHeroesClean();
