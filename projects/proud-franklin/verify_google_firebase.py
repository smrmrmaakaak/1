import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def verify_google_firebase():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1600, "height": 960})

        url = "https://labellejian-antiques.web.app"
        print(f"[+] Testing Google Firebase Server URL: {url} ...")
        resp = await page.goto(url, wait_until="networkidle")
        print(f"[+] Response status: {resp.status}")

        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1500)

        await page.screenshot(path="qa_vintage_textures/09_google_firebase_verified.png")
        print("[+] 09_google_firebase_verified.png captured successfully!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_google_firebase())
