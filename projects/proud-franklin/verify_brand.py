import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def verify_brand():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1600, "height": 960})

        print("[+] Testing https://labellejian-antique.web.app ...")
        await page.goto("https://labellejian-antique.web.app", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1500)

        title = await page.title()
        print(f"[+] Verified Page Title: {title}")

        await page.screenshot(path="qa_vintage_textures/labellejian_antique_live.png")
        print("[+] labellejian_antique_live.png captured!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_brand())
