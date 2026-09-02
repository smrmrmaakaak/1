import asyncio
import os
from playwright.async_api import async_playwright

async def run_qa():
    screenshot_dir = r"C:\Users\황태민\.gemini\antigravity\brain\1f09cebe-5429-4ca2-82ed-3a8981220b8f"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()
        
        # Listen to console
        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Browser PageError] {err}"))
        
        print("[1] Navigating to http://127.0.0.1:5174/ ...")
        await page.goto("http://127.0.0.1:5174/", wait_until="networkidle")
        await page.wait_for_timeout(1500)
        
        # Dismiss intro with Escape or clicking
        print("[+] Pressing Escape to dismiss intro...")
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(1000)
        
        # Check if intro is still there, click skip button if any
        skip = page.locator("button.intro-skip-btn, button.cinematic-skip, .intro-overlay button")
        if await skip.count() > 0:
            await skip.first.click()
            await page.wait_for_timeout(1000)
            
        await page.screenshot(path=os.path.join(screenshot_dir, "lladro_qa_01_shelf.png"))
        print("[+] Captured shelf screenshot")
        
        # Find Liber V or navigate right to it
        print("[2] Navigating to Liber V (Lladro book)...")
        for i in range(6):
            card = page.locator('.book-card[data-book="lladro_nao"]')
            if await card.count() > 0:
                is_center = await card.evaluate("el => el.classList.contains('is-center')")
                if is_center:
                    print(f"[+] Liber V is centered at step {i}!")
                    break
            # Press right arrow
            await page.keyboard.press("ArrowRight")
            await page.wait_for_timeout(400)
            
        await page.screenshot(path=os.path.join(screenshot_dir, "lladro_qa_02_lladro_card.png"))
        print("[+] Captured Lladro cover flow screenshot")
        
        # Open Lladro Book
        print("[3] Opening Lladro Book...")
        lladro_card = page.locator('.book-card[data-book="lladro_nao"]')
        await lladro_card.click()
        await page.wait_for_timeout(2500)
        
        await page.screenshot(path=os.path.join(screenshot_dir, "lladro_qa_03_3d_book_open.png"))
        print("[+] Captured 3D opened book screenshot")
        
        # Click on right folio / lookbook trigger
        print("[4] Opening Vertical Lookbook Gallery...")
        canvas = page.locator("canvas").first
        box = await canvas.bounding_box()
        if box:
            await page.mouse.click(box["x"] + box["width"] * 0.72, box["y"] + box["height"] * 0.45)
                
        await page.wait_for_timeout(2000)
        await page.screenshot(path=os.path.join(screenshot_dir, "lladro_qa_04_lookbook_top.png"))
        print("[+] Captured Lookbook Top screenshot")
        
        # Scroll down in lookbook to view the 5 photos, wood CTA button, and cursive price
        print("[5] Scrolling lookbook...")
        modal = page.locator(".vertical-photo-stream").first
        if await modal.count() > 0:
            await modal.evaluate("el => el.scrollTop = 1200")
            await page.wait_for_timeout(800)
            await page.screenshot(path=os.path.join(screenshot_dir, "lladro_qa_05_lookbook_scroll1.png"))
            
            await modal.evaluate("el => el.scrollTop = 3000")
            await page.wait_for_timeout(800)
            await page.screenshot(path=os.path.join(screenshot_dir, "lladro_qa_06_lookbook_scroll2.png"))
            
            await modal.evaluate("el => el.scrollTop = el.scrollHeight")
            await page.wait_for_timeout(800)
            await page.screenshot(path=os.path.join(screenshot_dir, "lladro_qa_07_lookbook_footer_cta.png"))
            print("[+] Captured Lookbook Footer with Wood CTA and Cursive Price screenshot")
            
        await browser.close()
        print("[+] QA Verification Completed Successfully!")

if __name__ == "__main__":
    asyncio.run(run_qa())
