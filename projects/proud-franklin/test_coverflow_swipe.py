import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = 'qa_coverflow_swipe'
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1600, 'height': 960})

        print('[1] Loading page & checking 3D Cover Flow Showcase...')
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await asyncio.sleep(1.0)
        await page.screenshot(path=f'{OUTPUT_DIR}/01_coverflow_initial.png')
        print('[+] Captured 01_coverflow_initial.png')

        # Test 1: Click Next Arrow Button
        print('[2] Clicking Next Arrow button...')
        await page.click('.coverflow-arrow-btn.next-arrow')
        await asyncio.sleep(0.6)
        await page.screenshot(path=f'{OUTPUT_DIR}/02_coverflow_next_arrow.png')
        print('[+] Captured 02_coverflow_next_arrow.png')

        # Test 2: Mouse Drag / Swipe Leftward (Swipe from x=1000 to x=500)
        print('[3] Performing Mouse Swipe Leftward...')
        await page.mouse.move(1000, 500)
        await page.mouse.down()
        for x in [900, 800, 700, 600, 500]:
            await page.mouse.move(x, 500)
            await asyncio.sleep(0.04)
        await page.mouse.up()
        await asyncio.sleep(0.6)
        await page.screenshot(path=f'{OUTPUT_DIR}/03_coverflow_after_swipe.png')
        print('[+] Captured 03_coverflow_after_swipe.png')

        # Test 3: Filter by "황실 보물" (Royal category)
        print('[4] Selecting "황실 보물" Category Filter...')
        await page.evaluate('''() => {
            const btns = Array.from(document.querySelectorAll('.shelf-nav-btn'));
            const royalBtn = btns.find(b => b.textContent.includes('황실 보물'));
            if (royalBtn) royalBtn.click();
        }''')
        await asyncio.sleep(0.6)
        await page.screenshot(path=f'{OUTPUT_DIR}/04_royal_category_coverflow.png')
        print('[+] Captured 04_royal_category_coverflow.png')

        # Test 4: Open Center Royal Book in 3D (코로나 임페리얼리스)
        print('[5] Opening Center Book (코로나 임페리얼리스) in 3D...')
        await page.click('.coverflow-card.is-center')
        await asyncio.sleep(1.2)
        await page.screenshot(path=f'{OUTPUT_DIR}/05_corona_imperialis_3d_opened.png')
        print('[+] Captured 05_corona_imperialis_3d_opened.png')

        await browser.close()
        print('[+] All Cover Flow swipe & multi-book tests completed successfully!')

if __name__ == '__main__':
    asyncio.run(main())
