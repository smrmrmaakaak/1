import asyncio
import time
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def capture_svg_plaque():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1600, "height": 960}, bypass_csp=True)
        page = await context.new_page()

        url = f"https://labellejian-antiques.web.app/?cb={int(time.time())}"
        print(f"[+] Accessing {url} with fresh context ...")
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(1000)

        enter_btn = page.locator("button:has-text('수장고')").first
        if await enter_btn.count() > 0:
            await enter_btn.click()
            await page.wait_for_timeout(1500)

        await page.locator(".book-card.is-center").click()
        await page.wait_for_timeout(2000)

        gallery_btn = page.locator("button:has-text('사진 룩북')").first
        if await gallery_btn.count() > 0:
            await gallery_btn.click()
            await page.wait_for_timeout(1500)

            await page.locator(".vg-archival-dossier").scroll_into_view_if_needed()
            await page.wait_for_timeout(800)
            await page.screenshot(path="qa_vintage_textures/11_svg_plaque_verified.png")
            print("[+] 11_svg_plaque_verified.png captured!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_svg_plaque())
