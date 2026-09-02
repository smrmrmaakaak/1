import { chromium } from 'playwright';

async function findCharacter() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(3000);

    const charInfo = await page.evaluate(() => {
      const char = window.app?.character;
      if (!char) return 'No Character';

      const items = [];
      char.root.traverse(obj => {
        items.push({
          name: obj.name || 'Unnamed',
          type: obj.type,
          visible: obj.visible,
          pos: obj.position,
          scale: obj.scale,
          geo: obj.geometry?.type
        });
      });
      return {
        rootPos: char.root.position,
        rootVisible: char.root.visible,
        items
      };
    });

    console.log('Character Tree:', JSON.stringify(charInfo, null, 2));
  } finally {
    await browser.close();
  }
}

findCharacter();
