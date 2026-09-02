import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = 'qa_intro_flow'
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1600, 'height': 960})

        print('[1] Loading site to test Cinematic Intro Video...')
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await asyncio.sleep(2.0) # Let video play for 2 seconds
        await page.screenshot(path=f'{OUTPUT_DIR}/01_intro_video_playing.png')
        print('[+] Captured 01_intro_video_playing.png')

        # Test 1: Click "수장고 입장하기" button
        print('[2] Clicking enter button to enter Cover Flow...')
        await page.click('.intro-skip-btn')
        await asyncio.sleep(1.2)
        await page.screenshot(path=f'{OUTPUT_DIR}/02_entered_coverflow.png')
        print('[+] Captured 02_entered_coverflow.png')

        # Test 2: Click TopBar "🎬 인트로 영상" to rewatch intro
        print('[3] Clicking TopBar intro button...')
        await page.evaluate('''() => {
            const btns = Array.from(document.querySelectorAll('.museum-action-pill'));
            const introBtn = btns.find(b => b.textContent.includes('인트로'));
            if (introBtn) introBtn.click();
        }''')
        await asyncio.sleep(1.5)
        await page.screenshot(path=f'{OUTPUT_DIR}/03_intro_replayed.png')
        print('[+] Captured 03_intro_replayed.png')

        await browser.close()
        print('[+] Intro Video flow tests completed successfully!')

if __name__ == '__main__':
    asyncio.run(main())
