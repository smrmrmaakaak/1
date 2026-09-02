import asyncio
import os
from playwright.async_api import async_playwright

async def test_vintage_realism():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1600, "height": 960})
        os.makedirs("qa_vintage_textures", exist_ok=True)

        print("[+] Loading http://127.0.0.1:5174/ ...")
        await page.goto("http://127.0.0.1:5174/", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Enter museum from intro
        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1200)

        # 1. Main Coverflow - Vintage Real Leather Books
        await page.screenshot(path="qa_vintage_textures/01_vintage_coverflow.png")
        print("[+] 01_vintage_coverflow.png captured")

        # 2. Close-up of Center Book Cover
        center_book = page.locator(".book-card.is-center .front-cover").first
        if await center_book.count() > 0:
            await center_book.screenshot(path="qa_vintage_textures/02_vintage_center_cover_macro.png")
            print("[+] 02_vintage_center_cover_macro.png captured")

        # 3. Next Book (Burgundy Knight Book)
        next_arrow = page.locator(".coverflow-nav-arrow.next").first
        if await next_arrow.count() > 0:
            await next_arrow.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path="qa_vintage_textures/03_vintage_burgundy_cover.png")
            print("[+] 03_vintage_burgundy_cover.png captured")

        # 4. Open 3D Book to see real vintage parchment pages
        await page.locator(".book-card.is-center").click()
        await page.wait_for_timeout(2000)
        await page.screenshot(path="qa_vintage_textures/04_3d_vintage_parchment_pages.png")
        print("[+] 04_3d_vintage_parchment_pages.png captured")

        # 5. Mobile (iPhone 14)
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.wait_for_timeout(800)
        await page.screenshot(path="qa_vintage_textures/05_mobile_vintage_tome.png")
        print("[+] 05_mobile_vintage_tome.png captured")

        await browser.close()
        print("[+] All vintage texture verification screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(test_vintage_realism())
