import asyncio
import os
from playwright.async_api import async_playwright

async def test_embossed_covers():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1600, "height": 960})
        page = await context.new_page()

        os.makedirs("qa_embossed_cover", exist_ok=True)
        print("[+] Navigating to http://127.0.0.1:5174/ ...")
        await page.goto("http://127.0.0.1:5174/", wait_until="networkidle")
        await page.wait_for_timeout(800)

        # Enter museum from intro
        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1000)

        # 1. Main Coverflow - Center & Side Book Covers
        await page.screenshot(path="qa_embossed_cover/01_coverflow_embossed.png")
        print("[+] 01_coverflow_embossed.png captured")

        # 2. Close-up of Center Book Cover
        center_book = page.locator(".book-card.is-center .front-cover").first
        if await center_book.count() > 0:
            await center_book.screenshot(path="qa_embossed_cover/02_center_cover_closeup.png")
            print("[+] 02_center_cover_closeup.png captured")

        # 3. Click Center Book to open 3D Book Viewer
        await page.locator(".book-card.is-center").click()
        await page.wait_for_timeout(2000)
        await page.screenshot(path="qa_embossed_cover/03_3d_book_viewer_embossed.png")
        print("[+] 03_3d_book_viewer_embossed.png captured")

        # 4. Mobile Viewport (iPhone 14)
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.wait_for_timeout(800)
        await page.screenshot(path="qa_embossed_cover/04_mobile_3d_viewer.png")
        print("[+] 04_mobile_3d_viewer.png captured")

        await browser.close()
        print("[+] All verification screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(test_embossed_covers())
