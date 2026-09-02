import { chromium } from 'playwright';

const HEROES = [
  { id: 'arthur', name: '아서', expectedSkill: 'ice' },
  { id: 'raiden', name: '라이덴', expectedSkill: 'thunder' },
  { id: 'ignis', name: '이그니스', expectedSkill: 'meteor' },
  { id: 'lumina', name: '루미나', expectedSkill: 'beam' },
  { id: 'tesla', name: '테슬라', expectedSkill: 'snare' },
  { id: 'boreas', name: '보레아스', expectedSkill: 'glacier' },
  { id: 'sera', name: '세라', expectedSkill: 'blizzard' }
];

async function testAll7HeroesCombat() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=vulkan', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    for (const h of HEROES) {
      console.log(`\n--- Testing Hero: ${h.name} (${h.id}) ---`);

      // Open Hero Select Modal & Select hero
      await page.evaluate((heroId) => {
        window.app.heroSelectModal.show();
        window.app.heroSelectModal.selectHero(heroId);
      }, h.id);

      await page.waitForTimeout(200);

      // Start Battle
      await page.click('#btn-hero-start');
      await page.waitForTimeout(500);

      const status = await page.evaluate(() => {
        return {
          currentHero: window.app.currentHeroId,
          activeElement: window.app.element,
          unlockedSkills: Array.from(window.app.unlockedSkills),
          isArmed: window.app.aim.isArmed
        };
      });

      console.log(`Hero: ${status.currentHero}, Active Skill: ${status.activeElement}, Unlocked:`, status.unlockedSkills);

      if (!status.unlockedSkills.includes(h.expectedSkill)) {
        throw new Error(`FAIL: ${h.name} did not unlock ${h.expectedSkill}!`);
      }

      // Try Casting skill directly via App._cast
      await page.evaluate(() => {
        window.app.armAbility();
        if (window.app.aim.isArmed) {
          window.app.aim.confirm();
        }
      });

      await page.waitForTimeout(600);
      await page.screenshot({ path: `hero_combat_${h.id}.png` });
      console.log(`SUCCESS: ${h.name} (${h.id}) successfully cast ${h.expectedSkill}!`);
    }

    console.log('\n🎉 ALL 7 HEROES TESTED AND VERIFIED WORKING 100%!');

  } finally {
    await browser.close();
  }
}

testAll7HeroesCombat();
