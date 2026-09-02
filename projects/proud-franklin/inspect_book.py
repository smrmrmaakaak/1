import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def inspect_book_issues():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1600, "height": 960})

        url = "http://127.0.0.1:5174/"
        print(f"[+] Navigating to {url} ...")
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(800)

        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1200)

        # 1. Capture bookshelf state
        await page.screenshot(path="qa_vintage_textures/debug_01_shelf.png")
        print("[+] Captured debug_01_shelf.png")

        # 2. Click center book to open
        await page.locator(".book-card.is-center").click()
        await page.wait_for_timeout(2500) # Wait for open animation to complete

        # 3. Capture open book state to inspect crookedness
        await page.screenshot(path="qa_vintage_textures/debug_02_book_open.png")
        print("[+] Captured debug_02_book_open.png")

        # 4. Click '책 덮기' button and capture closing sequence
        close_btn = page.locator("button:has-text('책 덮기')").first
        if await close_btn.count() > 0:
            print("[+] Clicking close button...")
            await close_btn.click()
            # Capture during closing
            await page.wait_for_timeout(200)
            await page.screenshot(path="qa_vintage_textures/debug_03_closing_mid.png")
            print("[+] Captured debug_03_closing_mid.png")

            await page.wait_for_timeout(500)
            await page.screenshot(path="qa_vintage_textures/debug_04_closing_end.png")
            print("[+] Captured debug_04_closing_end.png")

            await page.wait_for_timeout(500)
            await page.screenshot(path="qa_vintage_textures/debug_05_back_to_shelf.png")
            print("[+] Captured debug_05_back_to_shelf.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect_book_issues())
