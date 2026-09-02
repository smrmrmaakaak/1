import { chromium } from 'playwright';

async function inspectRogueBones() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`[CLIENT] ${msg.text()}`));

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2000);

  const bones = await page.evaluate(() => {
    const list = [];
    window.app.character.model.traverse(node => {
      list.push({ name: node.name, type: node.type });
    });
    return list;
  });

  console.log('Nodes in current character model:', JSON.stringify(bones, null, 2));
  await browser.close();
}

inspectRogueBones();
