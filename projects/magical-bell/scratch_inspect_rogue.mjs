import { chromium } from 'playwright';

async function inspectRogue() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);

  const aceCard = await page.$('.showcase-hero-card[data-hero-id="ace"]');
  if (aceCard) await aceCard.click();
  await page.waitForTimeout(1000);

  const names = await page.evaluate(() => {
    const list = [];
    window.app.character.model.traverse(node => {
      list.push({ name: node.name, type: node.type, parent: node.parent?.name });
    });
    return list;
  });

  console.log('Rogue nodes:', JSON.stringify(names, null, 2));
  await browser.close();
}

inspectRogue();
