import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def verify_gallery():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1600, "height": 1000})

        url = "http://127.0.0.1:5174/"
        print(f"[+] Navigating to {url} ...")
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(800)

        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1000)

        # Open Book 2 (성 요한 구호기사단)
        cat_btn = page.locator(".shelf-nav-icon-btn").nth(2)
        if await cat_btn.count() > 0:
            await cat_btn.click()
            await page.wait_for_timeout(800)

        # Open center book
        await page.locator(".book-card.is-center").click()
        await page.wait_for_timeout(2000)

        # Open Vertical Lookbook Gallery
        gallery_btn = page.locator("button:has-text('고화질 사진 룩북')").first
        if await gallery_btn.count() > 0:
            print("[+] Clicking Lookbook Gallery button...")
            await gallery_btn.click()
            await page.wait_for_timeout(1200)

            # Capture top of lookbook gallery
            await page.screenshot(path="qa_vintage_textures/gallery_01_top.png")
            print("[+] Captured gallery_01_top.png")

            # Scroll down inside photo stream
            stream = page.locator(".vertical-photo-stream")
            await stream.evaluate("el => el.scrollTop = 900")
            await page.wait_for_timeout(800)
            await page.screenshot(path="qa_vintage_textures/gallery_02_mid.png")
            print("[+] Captured gallery_02_mid.png")

            # Scroll to bottom dossier
            await stream.evaluate("el => el.scrollTop = el.scrollHeight")
            await page.wait_for_timeout(800)
            await page.screenshot(path="qa_vintage_textures/gallery_03_dossier.png")
            print("[+] Captured gallery_03_dossier.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_gallery())
