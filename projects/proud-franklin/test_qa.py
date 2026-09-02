import asyncio
from playwright.async_api import async_playwright
import os

os.makedirs('qa_screenshots', exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1600, 'height': 960})
        
        errors = []
        page.on('console', lambda msg: errors.append(f'[{msg.type}] {msg.text}') if msg.type == 'error' else None)
        page.on('pageerror', lambda err: errors.append(f'[PAGE ERROR] {err}'))

        print('[1] Navigating to http://127.0.0.1:5174/ ...')
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await asyncio.sleep(1)
        await page.screenshot(path='qa_screenshots/01_gallery_showcase.png')
        print('[+] Captured 01_gallery_showcase.png')

        print('[2] Opening Book 1 (Three.js 3D Real Mesh Book Viewer)...')
        books = await page.query_selector_all('.book-card')
        if books:
            await books[0].click()
            await asyncio.sleep(1.2)
            await page.screenshot(path='qa_screenshots/02_threejs_3d_open_book_1.png')
            print('[+] Captured 02_threejs_3d_open_book_1.png')

            print('[3] Clicking Tab 2 (Loupe)...')
            tabs = await page.query_selector_all('.tab-pill-btn')
            if len(tabs) >= 2:
                await tabs[1].click()
                await asyncio.sleep(0.8)
                await page.screenshot(path='qa_screenshots/03_threejs_spread_2_loupe.png')
                print('[+] Captured 03_threejs_spread_2_loupe.png')

            print('[4] Clicking Tab 3 (Wax Seal & Certificate)...')
            if len(tabs) >= 3:
                await tabs[2].click()
                await asyncio.sleep(0.8)
                stamp = await page.query_selector('.wax-stamp-btn-3d')
                if stamp:
                    await stamp.click()
                    await asyncio.sleep(0.5)
                await page.screenshot(path='qa_screenshots/04_threejs_spread_3_seal.png')
                print('[+] Captured 04_threejs_spread_3_seal.png')

            print('[5] Closing Three.js Book...')
            close_btn = await page.query_selector('.threejs-close-btn')
            if close_btn:
                await close_btn.click()
                await asyncio.sleep(1.0)
                await page.screenshot(path='qa_screenshots/05_threejs_closed_gallery.png')
                print('[+] Captured 05_threejs_closed_gallery.png')

        print(f'[+] Total Console Errors: {len(errors)}')
        for err in errors:
            print(f'   {err}')
        await browser.close()
        print('[+] QA Completed Successfully!')

if __name__ == '__main__':
    asyncio.run(main())
