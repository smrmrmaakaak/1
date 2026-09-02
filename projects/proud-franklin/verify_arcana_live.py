import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1600, "height": 960})
        print("[+] Accessing https://arcana-antiqua.web.app ...")
        await page.goto("https://arcana-antiqua.web.app", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Click enter button
        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1500)

        await page.screenshot(path="qa_vintage_textures/arcana_antiqua_live_direct.png")
        print("[+] Verified! arcana_antiqua_live_direct.png saved successfully!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
