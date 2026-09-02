import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = 'qa_bg_emerald'
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # 1. Desktop Check
        page = await browser.new_page(viewport={'width': 1600, 'height': 960})
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await page.click('.intro-skip-btn')
        await asyncio.sleep(1.0)
        await page.screenshot(path=f'{OUTPUT_DIR}/01_main_coverflow_emerald_bg.png')
        print('[+] Captured 01_main_coverflow_emerald_bg.png')

        # Open 3D Book
        await page.click('.book-card.is-center')
        await asyncio.sleep(1.8)
        await page.screenshot(path=f'{OUTPUT_DIR}/02_book_view_emerald_bg.png')
        print('[+] Captured 02_book_view_emerald_bg.png')

        # Open Photo Lookbook
        await page.mouse.click(1050, 420)
        await asyncio.sleep(1.0)
        await page.screenshot(path=f'{OUTPUT_DIR}/03_lookbook_emerald_bg.png')
        print('[+] Captured 03_lookbook_emerald_bg.png')

        # 2. Mobile Check
        mobile_page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await mobile_page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await mobile_page.click('.intro-skip-btn')
        await asyncio.sleep(1.0)
        await mobile_page.screenshot(path=f'{OUTPUT_DIR}/04_mobile_emerald_bg.png')
        print('[+] Captured 04_mobile_emerald_bg.png')

        await browser.close()
        print('[+] Background color verification complete!')

if __name__ == '__main__':
    asyncio.run(main())
