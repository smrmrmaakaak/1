import { chromium } from 'playwright';

async function dumpScene() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(3000);

    const sceneObjects = await page.evaluate(() => {
      const scene = window.app?.scene;
      if (!scene) return 'No Scene';

      const items = [];
      scene.traverse(obj => {
        if (obj.isMesh) {
          items.push({
            name: obj.name || 'Unnamed Mesh',
            parentName: obj.parent?.name || 'Unnamed Parent',
            geo: obj.geometry?.type,
            pos: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
            visible: obj.visible,
            color: obj.material?.color ? obj.material.color.getHexString() : 'no-color'
          });
        }
      });
      return items;
    });

    console.log('Scene Meshes (Total: ' + sceneObjects.length + '):', JSON.stringify(sceneObjects.slice(0, 30), null, 2));
  } finally {
    await browser.close();
  }
}

dumpScene();
