from playwright.sync_api import sync_playwright
import time

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1600, 'height': 900})
        page = context.new_page()

        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR]: {err}"))

        print("Navigating to http://localhost:8080 ...")
        page.goto("http://localhost:8080", wait_until="networkidle")
        time.sleep(2)

        # 1. Capture 2.5D Hologram Front View
        page.screenshot(path="web_25d_hologram_front.png")
        print("Captured web_25d_hologram_front.png")

        # 2. Click 3D Depth Map Mode
        btn_depth = page.locator("#btn-mode-depth")
        if btn_depth.is_visible():
            btn_depth.click()
            time.sleep(1)
            page.screenshot(path="web_25d_depth_map.png")
            print("Captured web_25d_depth_map.png")

        # 3. Click Photo Mode & Select Thumbnail 10 (Macro Medals)
        page.locator("#btn-mode-photo").click()
        time.sleep(0.5)
        page.locator("#thumb-9").click()
        time.sleep(1.5)
        page.screenshot(path="web_25d_macro_medals.png")
        print("Captured web_25d_macro_medals.png")

        # 4. Switch to Prugio Apartment Tab
        page.locator("#pill-prugio").click()
        time.sleep(1.5)
        page.screenshot(path="web_prugio_live.png")
        print("Captured web_prugio_live.png")

        browser.close()
        print("=== 2.5D QA VERIFICATION COMPLETE ===")

if __name__ == "__main__":
    verify()
