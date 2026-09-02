import { chromium } from 'playwright';

async function checkAllBones() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(2000);

  const bones = await page.evaluate(() => {
    const action = window.app.character.actions.get('Spellcast_Shoot') || window.app.character.actions.get('1H_Melee_Attack_Chop');
    if (!action) return [];
    const clip = action.getClip();
    return Array.from(new Set(clip.tracks.map(t => t.name.split('.')[0])));
  });

  console.log("All unique animated bone names:", bones);

  await browser.close();
}

checkAllBones();
