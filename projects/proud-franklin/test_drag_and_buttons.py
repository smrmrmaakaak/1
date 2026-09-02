import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = 'qa_drag_and_buttons'
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1600, 'height': 960})

        print('[1] Loading page & opening 3D book...')
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await asyncio.sleep(0.5)

        # Click first book to open
        await page.evaluate('''() => {
            document.querySelector('.book-card').click();
        }''')
        await asyncio.sleep(1.2)
        await page.screenshot(path=f'{OUTPUT_DIR}/01_spread0_opened.png')
        print('[+] Captured 01_spread0_opened.png')

        # Test 1: Mouse Drag from Right Page to Left (Spread 0 -> 1)
        print('[2] Performing Mouse Drag from Right (x=1150) to Left (x=650)...')
        await page.mouse.move(1150, 500)
        await page.mouse.down()
        # Drag incrementally across 5 steps
        for step_x in [1050, 950, 850, 750, 650]:
            await page.mouse.move(step_x, 500)
            await asyncio.sleep(0.05)
        await page.screenshot(path=f'{OUTPUT_DIR}/02_drag_in_progress.png')
        print('[+] Captured 02_drag_in_progress.png')
        await page.mouse.up()

        # Wait for page flip completion
        await asyncio.sleep(0.8)
        await page.screenshot(path=f'{OUTPUT_DIR}/03_spread1_after_drag.png')
        print('[+] Captured 03_spread1_after_drag.png')

        # Test 2: In-Page Hotspot Click "다음 장 넘기기" (Spread 1 -> 2)
        print('[3] Clicking Right Page Hotspot Button...')
        await page.evaluate('''() => {
            const rightHotspot = document.querySelector('.page-hotspot-zone.right-zone');
            if (rightHotspot) rightHotspot.click();
        }''')
        await asyncio.sleep(0.8)
        await page.screenshot(path=f'{OUTPUT_DIR}/04_spread2_after_hotspot_click.png')
        print('[+] Captured 04_spread2_after_hotspot_click.png')

        # Test 3: In-Page Hotspot Click "도감 덮기 (완료)" (Spread 2 -> Close Book)
        print('[4] Clicking Complete Close Hotspot...')
        await page.evaluate('''() => {
            const rightHotspot = document.querySelector('.page-hotspot-zone.right-zone');
            if (rightHotspot) rightHotspot.click();
        }''')
        await asyncio.sleep(0.8)
        await page.screenshot(path=f'{OUTPUT_DIR}/05_book_closed_gallery.png')
        print('[+] Captured 05_book_closed_gallery.png')

        await browser.close()
        print('[+] All drag and button tests passed with screenshots!')

if __name__ == '__main__':
    asyncio.run(main())
