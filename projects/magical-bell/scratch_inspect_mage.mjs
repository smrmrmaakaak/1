import { chromium } from 'playwright';

async function inspectMageModel() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(3000);

    const info = await page.evaluate(() => {
      const gltf = window.app?.character?._cachedGLTFs?.get('arthur');
      if (!gltf) return 'No Arthur GLTF in cache';

      const scene = gltf.scene;
      const meshes = [];
      scene.traverse(child => {
        if (child.isMesh || child.isSkinnedMesh) {
          child.geometry.computeBoundingBox();
          const bb = child.geometry.boundingBox;
          meshes.push({
            name: child.name,
            type: child.type,
            scale: child.scale,
            position: child.position,
            bbSize: {
              x: bb.max.x - bb.min.x,
              y: bb.max.y - bb.min.y,
              z: bb.max.z - bb.min.z
            }
          });
        }
      });
      return {
        sceneChildren: scene.children.map(c => c.name),
        meshes
      };
    });

    console.log('Arthur Mage Model Info:', JSON.stringify(info, null, 2));
  } finally {
    await browser.close();
  }
}

inspectMageModel();
