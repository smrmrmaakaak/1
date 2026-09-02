import asyncio
from playwright.async_api import async_playwright
import os

os.makedirs('qa_screenshots', exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1600, 'height': 960})

        print('[1] Navigating to http://127.0.0.1:5174/ ...')
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await asyncio.sleep(1)

        print('[2] Clicking Book 2 (Reliquiae Regum) to capture opening animation mid-flight...')
        books = await page.query_selector_all('.book-card')
        if len(books) >= 2:
            await books[1].click()
            # Capture frame at ~350ms (mid-flight cover swing)
            await asyncio.sleep(0.35)
            await page.screenshot(path='qa_screenshots/06_opening_animation_midflight.png')
            print('[+] Captured 06_opening_animation_midflight.png')
            
            # Settle open
            await asyncio.sleep(0.8)
            await page.screenshot(path='qa_screenshots/07_book2_settled_open.png')
            print('[+] Captured 07_book2_settled_open.png')

        await browser.close()
        print('[+] Animation verification complete!')

if __name__ == '__main__':
    asyncio.run(main())
