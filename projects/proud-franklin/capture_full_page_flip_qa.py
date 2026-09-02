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
        # Wait 1.4s for opening animation to settle
        await asyncio.sleep(1.4)
        await page.screenshot(path=f'{OUTPUT_DIR}/spread0_settled.png')
        print('[+] Captured spread0_settled.png')

        # Flip 1: Spread 0 -> Spread 1
        print('[2] Triggering Next Page flip (Spread 0 -> 1)...')
        await page.evaluate('''() => {
            const nextBtn = document.querySelector('.bottom-nav-btn.next');
            if (nextBtn) nextBtn.click();
        }''')

        for i in range(1, 11):
            t = i * 0.08
            filename = f'{OUTPUT_DIR}/flip1_0to1_frame_{i:02d}_{t:.2f}s.png'
            await page.screenshot(path=filename)
            print(f'[+] Captured {filename}')
            await asyncio.sleep(0.08)

        await asyncio.sleep(0.5)
        await page.screenshot(path=f'{OUTPUT_DIR}/spread1_settled.png')
        print('[+] Captured spread1_settled.png')

        # Flip 2: Spread 1 -> Spread 2
        print('[3] Triggering Next Page flip (Spread 1 -> 2)...')
        await page.evaluate('''() => {
            const nextBtn = document.querySelector('.bottom-nav-btn.next');
            if (nextBtn) nextBtn.click();
        }''')

        for i in range(1, 11):
            t = i * 0.08
            filename = f'{OUTPUT_DIR}/flip2_1to2_frame_{i:02d}_{t:.2f}s.png'
            await page.screenshot(path=filename)
            print(f'[+] Captured {filename}')
            await asyncio.sleep(0.08)

        await asyncio.sleep(0.5)
        await page.screenshot(path=f'{OUTPUT_DIR}/spread2_settled.png')
        print('[+] Captured spread2_settled.png')

        # Flip 3: Spread 2 -> Spread 1 (Reverse Flip)
        print('[4] Triggering Prev Page reverse flip (Spread 2 -> 1)...')
        await page.evaluate('''() => {
            const prevBtn = document.querySelector('.bottom-nav-btn.prev');
            if (prevBtn) prevBtn.click();
        }''')

        for i in range(1, 11):
            t = i * 0.08
            filename = f'{OUTPUT_DIR}/flip3_2to1_frame_{i:02d}_{t:.2f}s.png'
            await page.screenshot(path=filename)
            print(f'[+] Captured {filename}')
            await asyncio.sleep(0.08)

        await asyncio.sleep(0.5)
        await page.screenshot(path=f'{OUTPUT_DIR}/spread1_reverse_settled.png')
        print('[+] Captured spread1_reverse_settled.png')

        await browser.close()
        print('[+] Full page flip QA verification complete!')

if __name__ == '__main__':
    asyncio.run(main())
