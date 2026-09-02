import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def verify_luxury():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1600, "height": 960})

        url = "http://localhost:5174"
        print(f"[+] Accessing {url} ...")
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(1000)

        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1500)

        # 1. Screenshot Cover View (Check Latin cover and Icon Nav buttons and removed top-left text)
        await page.screenshot(path="qa_vintage_textures/07_luxury_cover_and_icons.png")
        print("[+] 07_luxury_cover_and_icons.png captured!")

        # 2. Click center book
        await page.locator(".book-card.is-center").click()
        await page.wait_for_timeout(2000)

        # 3. Open lookbook gallery
        gallery_btn = page.locator("button:has-text('사진 룩북')").first
        if await gallery_btn.count() > 0:
            await gallery_btn.click()
            await page.wait_for_timeout(1500)

            await page.locator(".vg-pricing-reservation-card").scroll_into_view_if_needed()
            await page.wait_for_timeout(800)
            await page.screenshot(path="qa_vintage_textures/08_luxury_pricing_card.png")
            print("[+] 08_luxury_pricing_card.png captured!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_luxury())
