import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = 'qa_page_flip_01s'
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
        # Wait 1.2s for book to fully open
        await asyncio.sleep(1.2)
        await page.screenshot(path=f'{OUTPUT_DIR}/flip_00_opened_spread0.png')
        print('[+] Captured flip_00_opened_spread0.png')

        # Now click "다음 장 넘기기" (Next Page)
        print('[2] Clicking Next Page and capturing at 0.08s intervals...')
        await page.evaluate('''() => {
            const nextBtn = document.querySelector('.bottom-nav-btn.next');
            if (nextBtn) nextBtn.click();
        }''')

        # Capture 12 frames across 1.0s
        for i in range(1, 13):
            t = i * 0.08
            filename = f'{OUTPUT_DIR}/flip_{i:02d}_{t:.2f}s.png'
            await page.screenshot(path=filename)
            print(f'[+] Captured {filename}')
            await asyncio.sleep(0.08)

        await browser.close()
        print('[+] Page flip capture complete!')

if __name__ == '__main__':
    asyncio.run(main())
