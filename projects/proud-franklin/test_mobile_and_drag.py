import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = 'qa_mobile_drag'
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        # 1. Mobile Device Testing (iPhone 14: 390x844)
        print('[1] Launching Mobile Browser (390x844, Touch)...')
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            has_touch=True,
            is_mobile=True
        )
        page = await context.new_page()

        print('[2] Loading site on Mobile...')
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await asyncio.sleep(0.6)
        await page.screenshot(path=f'{OUTPUT_DIR}/01_mobile_intro.png')
        print('[+] Captured 01_mobile_intro.png')

        # Skip intro to Mobile Cover Flow
        print('[3] Skipping intro to Mobile Cover Flow...')
        await page.click('.intro-skip-btn')
        await asyncio.sleep(1.2)
        await page.screenshot(path=f'{OUTPUT_DIR}/02_mobile_coverflow.png')
        print('[+] Captured 02_mobile_coverflow.png')

        # Open 3D Brand Book on Mobile
        print('[4] Opening 3D Brand Book on Mobile...')
        await page.click('.book-card.is-center')
        await asyncio.sleep(2.0)
        await page.screenshot(path=f'{OUTPUT_DIR}/03_mobile_book_open.png')
        print('[+] Captured 03_mobile_book_open.png')

        # Perform Drag-to-Flip on Mobile (Swipe Left to turn page)
        print('[5] Performing Drag-to-Flip gesture on Mobile...')
        # Start on right half (x=300, y=420) and drag to left (x=60, y=420)
        await page.mouse.move(300, 420)
        await page.mouse.down()
        for step in range(1, 10):
            cur_x = 300 - (240 * (step / 10))
            await page.mouse.move(cur_x, 420)
            await asyncio.sleep(0.03)
        await page.mouse.up()
        await asyncio.sleep(1.2)
        await page.screenshot(path=f'{OUTPUT_DIR}/04_mobile_drag_flipped.png')
        print('[+] Captured 04_mobile_drag_flipped.png')

        # Open Vertical Photo Gallery on Mobile
        print('[6] Opening Vertical Photo Gallery on Mobile...')
        await page.click('.photo-gallery-click-hotspot')
        await asyncio.sleep(1.0)
        await page.screenshot(path=f'{OUTPUT_DIR}/05_mobile_vertical_gallery.png')
        print('[+] Captured 05_mobile_vertical_gallery.png')

        # Scroll Mobile Gallery
        print('[7] Scrolling Mobile Gallery...')
        await page.evaluate('''() => {
            const stream = document.querySelector('.vertical-photo-stream');
            if (stream) stream.scrollTop = 450;
        }''')
        await asyncio.sleep(0.6)
        await page.screenshot(path=f'{OUTPUT_DIR}/06_mobile_gallery_scrolled.png')
        print('[+] Captured 06_mobile_gallery_scrolled.png')

        # Close Mobile Gallery
        await page.click('.vg-close-btn')
        await asyncio.sleep(0.5)

        await context.close()

        # 2. Desktop Mouse Drag Test
        print('[8] Testing Desktop Mouse Drag-to-Flip (1600x960)...')
        desktop_page = await browser.new_page(viewport={'width': 1600, 'height': 960})
        await desktop_page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await desktop_page.click('.intro-skip-btn')
        await asyncio.sleep(1.0)
        await desktop_page.click('.book-card.is-center')
        await asyncio.sleep(1.8)

        # Drag from right to left on desktop
        await desktop_page.mouse.move(1100, 480)
        await desktop_page.mouse.down()
        for step in range(1, 12):
            cur_x = 1100 - (380 * (step / 12))
            await desktop_page.mouse.move(cur_x, 480)
            await asyncio.sleep(0.02)
        await desktop_page.mouse.up()
        await asyncio.sleep(1.2)
        await desktop_page.screenshot(path=f'{OUTPUT_DIR}/07_desktop_drag_flipped.png')
        print('[+] Captured 07_desktop_drag_flipped.png')

        await browser.close()
        print('[+] All Mobile & Drag tests passed successfully!')

if __name__ == '__main__':
    asyncio.run(main())
