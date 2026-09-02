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

        print('[2] Clicking Book 1 to capture 3D WebGL page bending mid-flight...')
        books = await page.query_selector_all('.book-card')
        if len(books) >= 1:
            await books[0].click()
            # Capture frame at ~250ms (3D bending pages mid-flight)
            await asyncio.sleep(0.25)
            await page.screenshot(path='qa_screenshots/08_threejs_mesh_bending_midflight.png')
            print('[+] Captured 08_threejs_mesh_bending_midflight.png')

            # Capture frame at ~500ms
            await asyncio.sleep(0.25)
            await page.screenshot(path='qa_screenshots/09_threejs_mesh_flutter_cascade.png')
            print('[+] Captured 09_threejs_mesh_flutter_cascade.png')

            # Settle open
            await asyncio.sleep(0.8)
            await page.screenshot(path='qa_screenshots/10_threejs_settled_illumination.png')
            print('[+] Captured 10_threejs_settled_illumination.png')

        await browser.close()
        print('[+] Three.js 3D Frame QA Complete!')

if __name__ == '__main__':
    asyncio.run(main())
