import { chromium } from 'playwright';

async function captureFrontFace() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    // Position camera in FRONT of the character looking directly at face & chest
    await page.evaluate(() => {
      window.app.paused = true;
      // Character is facing +Z by default
      window.app.rig.camera.position.set(0, 1.4, 2.5);
      window.app.rig.controls.target.set(0, 1.2, 0);
      window.app.rig.controls.update();
      // Rotate character to face the camera (+Z)
      window.app.character.root.rotation.y = 0;
    });

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'hero_ignis_front_face.png' });

    // Slightly angled 3D perspective
    await page.evaluate(() => {
      window.app.rig.camera.position.set(1.6, 1.5, 2.2);
      window.app.rig.controls.target.set(0, 1.1, 0);
      window.app.rig.controls.update();
    });

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'hero_ignis_3d_angle.png' });
    console.log('Front face and 3D angle captured');

  } finally {
    await browser.close();
  }
}

captureFrontFace();
