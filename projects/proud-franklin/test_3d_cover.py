import asyncio
from playwright.async_api import async_playwright

async def test_3d_cover():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1600, "height": 960})
        await page.goto("http://127.0.0.1:5174/", wait_until="networkidle")
        await page.wait_for_timeout(800)

        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1000)

        # Open book
        await page.locator(".book-card.is-center").click()
        await page.wait_for_timeout(1500)

        # Navigate to last certification page to see the back cover
        # or flip spread
        next_btn = page.locator("button:has-text('다음')").first
        for _ in range(4):
            if await next_btn.count() > 0:
                await next_btn.click()
                await page.wait_for_timeout(700)

        await page.screenshot(path="qa_embossed_cover/05_3d_last_spread.png")
        print("[+] 05_3d_last_spread.png captured")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_3d_cover())
