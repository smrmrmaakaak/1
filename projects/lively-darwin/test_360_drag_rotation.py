from playwright.sync_api import sync_playwright
import time

def test_360_drag():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1600, 'height': 900})
        page = context.new_page()

        print("Navigating to http://localhost:8080 ...")
        page.goto("http://localhost:8080", wait_until="networkidle")
        time.sleep(2)

        # 1. Capture initial front view
        page.screenshot(path="screenshot_turntable_01_front.png")
        print("Captured initial front view")

        # 2. Simulate continuous mouse drag to rotate 90 degrees
        canvas = page.locator("#viewport")
        box = canvas.bounding_box()
        start_x = box['x'] + box['width'] / 2
        start_y = box['y'] + box['height'] / 2

        # Drag left to spin clockwise
        page.mouse.move(start_x, start_y)
        page.mouse.down()
        for offset in range(0, 350, 30):
            page.mouse.move(start_x - offset, start_y)
            time.sleep(0.05)
        page.mouse.up()
        time.sleep(1)

        page.screenshot(path="screenshot_turntable_02_dragged.png")
        print("Captured 360 dragged angle view")

        # 3. Click Auto Spin
        auto_spin_btn = page.locator("#btn-auto-spin")
        auto_spin_btn.click()
        time.sleep(2)
        page.screenshot(path="screenshot_turntable_03_autospin.png")
        print("Captured autospin view")

        browser.close()
        print("=== 360 DRAG ROTATION TEST COMPLETE ===")

if __name__ == "__main__":
    test_360_drag()
