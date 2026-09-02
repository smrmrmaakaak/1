from playwright.sync_api import sync_playwright
import time

def verify_grand_museum():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1600, 'height': 900})
        page = context.new_page()

        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR]: {err}"))

        print("Navigating to http://localhost:8080 ...")
        page.goto("http://localhost:8080", wait_until="networkidle")
        time.sleep(2)

        # 1. Capture initial view (Royal Copenhagen Blue Fluted)
        page.screenshot(path="screenshot_grand_01_copenhagen.png")
        print("Captured screenshot_grand_01_copenhagen.png")

        # 2. Click category '👑 영국 로열우스터'
        cat_pills = page.locator(".cat-pill")
        print(f"Found {cat_pills.count()} category pills")
        for i in range(cat_pills.count()):
            text = cat_pills.nth(i).inner_text()
            if "로열우스터" in text:
                cat_pills.nth(i).click()
                time.sleep(1.5)
                page.screenshot(path="screenshot_grand_02_worcester.png")
                print("Captured screenshot_grand_02_worcester.png")
                break

        # 3. Click category '🌷 스페인 야드로 & 나오'
        for i in range(cat_pills.count()):
            text = cat_pills.nth(i).inner_text()
            if "야드로" in text:
                cat_pills.nth(i).click()
                time.sleep(1.5)
                page.screenshot(path="screenshot_grand_03_lladro.png")
                print("Captured screenshot_grand_03_lladro.png")
                break

        # 4. Click category '🌹 영국 앤슬리'
        for i in range(cat_pills.count()):
            text = cat_pills.nth(i).inner_text()
            if "앤슬리" in text:
                cat_pills.nth(i).click()
                time.sleep(1.5)
                page.screenshot(path="screenshot_grand_04_aynsley.png")
                print("Captured screenshot_grand_04_aynsley.png")
                break

        # 5. Click category '🖼️ 명화 액자 & 자수공예'
        for i in range(cat_pills.count()):
            text = cat_pills.nth(i).inner_text()
            if "명화" in text:
                cat_pills.nth(i).click()
                time.sleep(1.5)
                page.screenshot(path="screenshot_grand_05_art_frame.png")
                print("Captured screenshot_grand_05_art_frame.png")
                break

        browser.close()
        print("=== GRAND ANTIQUE MUSEUM PLAYWRIGHT VERIFICATION COMPLETE ===")

if __name__ == "__main__":
    verify_grand_museum()
