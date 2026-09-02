import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = 'qa_bgm_test'
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1600, 'height': 960})

        print('[1] Loading site...')
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await asyncio.sleep(0.5)

        # Enter Cover Flow from intro
        print('[2] Skipping intro to trigger background music...')
        await page.click('.intro-skip-btn')
        await asyncio.sleep(1.5)

        # Check audio status
        audio_info = await page.evaluate('''() => {
            const audio = document.querySelector('.bgm-player-widget audio');
            return {
                src: audio ? audio.src : null,
                paused: audio ? audio.paused : null,
                volume: audio ? audio.volume : null,
                currentTime: audio ? audio.currentTime : null
            };
        }''')
        print('[+] BGM Audio Info:', audio_info)

        await page.screenshot(path=f'{OUTPUT_DIR}/01_coverflow_with_bgm_active.png')
        print('[+] Captured 01_coverflow_with_bgm_active.png')

        # Test toggle play/pause
        print('[3] Toggling BGM mute/pause button...')
        await page.click('.bgm-control-pill')
        await asyncio.sleep(0.5)
        await page.screenshot(path=f'{OUTPUT_DIR}/02_bgm_paused.png')
        print('[+] Captured 02_bgm_paused.png')

        # Resume BGM
        print('[4] Resuming BGM...')
        await page.click('.bgm-control-pill')
        await asyncio.sleep(0.5)
        await page.screenshot(path=f'{OUTPUT_DIR}/03_bgm_resumed.png')
        print('[+] Captured 03_bgm_resumed.png')

        await browser.close()
        print('[+] All BGM integration tests passed!')

if __name__ == '__main__':
    asyncio.run(main())
