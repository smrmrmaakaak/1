import asyncio
from playwright.async_api import async_playwright

async def verify_price_flow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1600, "height": 960})

        print("[+] Accessing https://arcana-antiqua.web.app ...")
        await page.goto("https://arcana-antiqua.web.app", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1500)

        # 1. Capture CoverFlow bottom HUD (Confirm NO price is shown on cover)
        await page.screenshot(path="qa_vintage_textures/01_no_price_on_cover.png")
        print("[+] 01_no_price_on_cover.png captured!")

        # 2. Open 3D book
        await page.locator(".book-card.is-center").click()
        await page.wait_for_timeout(2000)

        # 3. Click "고화질 사진 룩북" button to open vertical photo gallery
        gallery_btn = page.locator("button:has-text('사진 룩북')").first
        if await gallery_btn.count() > 0:
            await gallery_btn.click()
            await page.wait_for_timeout(1500)

            # Scroll .vertical-gallery-overlay down to pricing card
            await page.evaluate("document.querySelector('.vertical-gallery-overlay')?.scrollTo(0, 99999)")
            await page.wait_for_timeout(800)
            await page.screenshot(path="qa_vintage_textures/02_vertical_gallery_bottom_price.png")
            print("[+] 02_vertical_gallery_bottom_price.png captured!")

        await browser.close()
        print("[+] Price verification complete!")

if __name__ == "__main__":
    asyncio.run(verify_price_flow())
