from playwright.sync_api import sync_playwright
import time

def verify_all_antiques():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1600, 'height': 900})
        page = context.new_page()

        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR]: {err}"))

        print("Navigating to http://localhost:8080 ...")
        page.goto("http://localhost:8080", wait_until="networkidle")
        time.sleep(2)

        # 1. Capture Royal Doulton Past Glory
        page.screenshot(path="screenshot_01_royal_doulton.png")
        print("Captured screenshot_01_royal_doulton.png")

        # 2. Click Sèvres Rose Pompadour Box
        pills = page.locator(".col-pill")
        print(f"Found {pills.count()} collection pills")

        if pills.count() >= 2:
            pills.nth(1).click()
            time.sleep(1.5)
            page.screenshot(path="screenshot_02_sevres_rose.png")
            print("Captured screenshot_02_sevres_rose.png")

        # 3. Click Royal Worcester Greek Goddesses
        if pills.count() >= 3:
            pills.nth(2).click()
            time.sleep(1.5)
            page.screenshot(path="screenshot_03_worcester_greek.png")
            print("Captured screenshot_03_worcester_greek.png")

        # 4. Click Royal Worcester Warwick Castle Vase
        if pills.count() >= 4:
            pills.nth(3).click()
            time.sleep(1.5)
            page.screenshot(path="screenshot_04_worcester_warwick.png")
            print("Captured screenshot_04_worcester_warwick.png")

        # 5. Click Royal Worcester Moorish Ewer
        if pills.count() >= 5:
            pills.nth(4).click()
            time.sleep(1.5)
            page.screenshot(path="screenshot_05_worcester_moorish.png")
            print("Captured screenshot_05_worcester_moorish.png")

        # 6. Click Sèvres Blue Box
        if pills.count() >= 6:
            pills.nth(5).click()
            time.sleep(1.5)
            page.screenshot(path="screenshot_06_sevres_blue.png")
            print("Captured screenshot_06_sevres_blue.png")

        browser.close()
        print("=== ALL 6 ANTIQUE MASTERPIECES VERIFICATION COMPLETE ===")

if __name__ == "__main__":
    verify_all_antiques()
