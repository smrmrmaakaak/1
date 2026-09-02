import { chromium } from 'playwright';

async function testAvalancheDOM() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist', '--disable-gpu-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForSelector('#preloader', { state: 'detached', timeout: 30000 });
    
    await page.click('#btn-hero-start');
    await page.waitForTimeout(2000);

    const info = await page.evaluate(() => {
      const btn = document.querySelector('#m-btn-cast');
      const pad = document.querySelector('.mobile-controls-pad');
      const skills = document.querySelectorAll('.mobile-skill-btn');
      return {
        btnExists: !!btn,
        btnDisplay: btn ? window.getComputedStyle(btn).display : null,
        btnVisibility: btn ? window.getComputedStyle(btn).visibility : null,
        btnOpacity: btn ? window.getComputedStyle(btn).opacity : null,
        padDisplay: pad ? window.getComputedStyle(pad).display : null,
        padVisibility: pad ? window.getComputedStyle(pad).visibility : null,
        padBounds: pad ? pad.getBoundingClientRect() : null,
        skillsCount: skills.length
      };
    });

    console.log('DOM Info:', info);
  } finally {
    await browser.close();
  }
}

testAvalancheDOM();
