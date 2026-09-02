import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def verify_all_4_books():
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
            await page.wait_for_timeout(1000)

        # Iterate through books 1 to 4
        for book_idx in range(4):
            print(f"[+] Testing Book {book_idx + 1} ...")

            # Click category icon or navigate shelf
            cat_btn = page.locator(".shelf-nav-icon-btn").nth(book_idx + 1)
            if await cat_btn.count() > 0:
                await cat_btn.click()
                await page.wait_for_timeout(800)

            # Open center book
            await page.locator(".book-card.is-center").click()
            await page.wait_for_timeout(2000)

            # Capture open state
            await page.screenshot(path=f"qa_vintage_textures/book_{book_idx+1}_open.png")
            print(f"[+] Captured book_{book_idx+1}_open.png")

            # Click close button
            close_btn = page.locator("button:has-text('책 덮기')").first
            if await close_btn.count() > 0:
                await close_btn.click()
                await page.wait_for_timeout(300)
                await page.screenshot(path=f"qa_vintage_textures/book_{book_idx+1}_closing.png")
                await page.wait_for_timeout(600)
                print(f"[+] Captured book_{book_idx+1}_closing.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_all_4_books())
