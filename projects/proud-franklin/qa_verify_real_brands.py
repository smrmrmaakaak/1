import asyncio
import os
from playwright.async_api import async_playwright

async def run_qa():
    screenshot_dir = r"C:\Users\황태민\.gemini\antigravity\brain\1f09cebe-5429-4ca2-82ed-3a8981220b8f"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()
        
        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Browser PageError] {err}"))
        
        print("[1] Navigating to http://127.0.0.1:5174/ ...")
        await page.goto("http://127.0.0.1:5174/", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        
        # Dismiss intro with Escape
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(1000)
        
        await page.screenshot(path=os.path.join(screenshot_dir, "real_brand_01_shelf.png"))
        print("[+] Captured real brand shelf screenshot")
        
        # Verify only 1 card exists on shelf
        cards = page.locator(".book-card")
        card_count = await cards.count()
        print(f"[+] Total book cards on shelf: {card_count}")
        assert card_count == 1, f"Expected 1 real book card, got {card_count}"
        
        # Open the Lladro Book
        print("[2] Opening Lladro Real Book...")
        await cards.first.click()
        await page.wait_for_timeout(2500)
        await page.screenshot(path=os.path.join(screenshot_dir, "real_brand_02_3d_open.png"))
        print("[+] Captured 3D opened book screenshot")
        
        # Open Lookbook Gallery
        print("[3] Clicking to open Vertical Lookbook...")
        canvas = page.locator("canvas").first
        box = await canvas.bounding_box()
        if box:
            await page.mouse.click(box["x"] + box["width"] * 0.72, box["y"] + box["height"] * 0.45)
            
        await page.wait_for_timeout(2000)
        await page.screenshot(path=os.path.join(screenshot_dir, "real_brand_03_lookbook_top.png"))
        print("[+] Captured Lookbook top screenshot")
        
        # Scroll to bottom
        print("[4] Scrolling to Lookbook CTA and price...")
        modal = page.locator(".vertical-photo-stream").first
        if await modal.count() > 0:
            await modal.evaluate("el => el.scrollTop = el.scrollHeight")
            await page.wait_for_timeout(800)
            await page.screenshot(path=os.path.join(screenshot_dir, "real_brand_04_lookbook_footer.png"))
            print("[+] Captured Lookbook footer screenshot")
            
        await browser.close()
        print("[+] QA Verification Completed Successfully!")

if __name__ == "__main__":
    asyncio.run(run_qa())
