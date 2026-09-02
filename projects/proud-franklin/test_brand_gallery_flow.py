import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = 'qa_brand_gallery'
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1600, 'height': 960})

        print('[1] Loading website...')
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await asyncio.sleep(0.5)

        # Skip intro to Cover Flow
        print('[2] Skipping intro...')
        await page.click('.intro-skip-btn')
        await asyncio.sleep(1.2)

        # Click the center book to open 3D Book
        print('[3] Opening 3D Brand Book (Regiomontanus)...')
        await page.click('.book-card.is-center')
        await asyncio.sleep(1.8)
        await page.screenshot(path=f'{OUTPUT_DIR}/01_book_open_product1.png')
        print('[+] Captured 01_book_open_product1.png')

        # Click the Photo Hotspot to open Vertical Photo Gallery
        print('[4] Clicking Photo Hotspot to open Vertical Photo Gallery...')
        await page.click('.photo-gallery-click-hotspot')
        await asyncio.sleep(0.8)
        await page.screenshot(path=f'{OUTPUT_DIR}/02_vertical_gallery_opened.png')
        print('[+] Captured 02_vertical_gallery_opened.png')

        # Scroll down in the Vertical Photo Gallery
        print('[5] Scrolling inside Vertical Photo Gallery...')
        await page.evaluate('''() => {
            const stream = document.querySelector('.vertical-photo-stream');
            if (stream) stream.scrollTop = 800;
        }''')
        await asyncio.sleep(0.6)
        await page.screenshot(path=f'{OUTPUT_DIR}/03_vertical_gallery_scrolled.png')
        print('[+] Captured 03_vertical_gallery_scrolled.png')

        # Close Gallery and return to 3D book
        print('[6] Closing gallery...')
        await page.click('.vg-close-btn')
        await asyncio.sleep(0.6)

        # Turn to next product (Spread 1: Product 2)
        print('[7] Turning 3D book to Product 2...')
        await page.click('.bottom-nav-btn.next')
        await asyncio.sleep(1.0)
        await page.screenshot(path=f'{OUTPUT_DIR}/04_book_flipped_to_product2.png')
        print('[+] Captured 04_book_flipped_to_product2.png')

        # Jump to final Spread (Certification & Seal)
        print('[8] Jumping to final Brand Master Certification tab...')
        tabs = await page.query_selector_all('.threejs-tabs-nav .tab-pill-btn')
        if len(tabs) > 0:
            await tabs[-1].click()
            await asyncio.sleep(1.0)
            await page.screenshot(path=f'{OUTPUT_DIR}/05_book_final_certification_seal.png')
            print('[+] Captured 05_book_final_certification_seal.png')

        await browser.close()
        print('[+] All Brand Multi-Product & Vertical Gallery tests completed successfully!')

if __name__ == '__main__':
    asyncio.run(main())
