import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = 'qa_burst_01s'
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1600, 'height': 960})

        print('[1] Loading page...')
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await asyncio.sleep(0.5)

        # Pre-capture gallery closed state (t = -0.1s)
        await page.screenshot(path=f'{OUTPUT_DIR}/frame_00_closed.png')
        print('[+] Captured frame_00_closed.png')

        # Trigger click instantly without blocking
        print('[2] Triggering instant click to capture in-flight 3D opening...')
        await page.evaluate('''() => {
            const card = document.querySelector('.book-card');
            if (card) card.click();
        }''')

        # Capture 12 in-flight frames at 0.08s intervals
        for i in range(1, 13):
            t = i * 0.08
            filename = f'{OUTPUT_DIR}/frame_{i:02d}_{t:.2f}s.png'
            await page.screenshot(path=filename)
            print(f'[+] Captured {filename}')
            await asyncio.sleep(0.08)

        await browser.close()
        print('[+] Real-time in-flight burst capture complete!')

if __name__ == '__main__':
    asyncio.run(main())
