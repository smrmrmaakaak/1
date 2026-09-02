import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = 'qa_photo_reserve'
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        print('[1] Launching Browser (1600x960)...')
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1600, 'height': 960})

        print('[2] Navigating to site...')
        await page.goto('http://127.0.0.1:5174/', wait_until='networkidle')
        await page.click('.intro-skip-btn')
        await asyncio.sleep(1.0)

        # Open 3D Brand Book
        print('[3] Opening 3D Brand Book...')
        await page.click('.book-card.is-center')
        await asyncio.sleep(2.0)

        # Click directly on the photo on the right page (x=1050, y=420)
        print('[4] Clicking directly on the photo region on the right page...')
        await page.mouse.click(1050, 420)
        await asyncio.sleep(1.2)
        await page.screenshot(path=f'{OUTPUT_DIR}/01_photo_click_opened_lookbook.png')
        print('[+] Captured 01_photo_click_opened_lookbook.png')

        # Scroll to bottom of lookbook
        print('[5] Scrolling to bottom of lookbook...')
        await page.evaluate('''() => {
            const stream = document.querySelector('.vertical-photo-stream');
            if (stream) stream.scrollTop = stream.scrollHeight;
        }''')
        await asyncio.sleep(0.8)
        await page.screenshot(path=f'{OUTPUT_DIR}/02_lookbook_bottom_pricing_and_reserve_btn.png')
        print('[+] Captured 02_lookbook_bottom_pricing_and_reserve_btn.png')

        # Click Reservation CTA Button
        print('[6] Clicking Reservation CTA Button...')
        await page.click('.vg-reserve-btn')
        await asyncio.sleep(0.8)
        await page.screenshot(path=f'{OUTPUT_DIR}/03_reservation_modal_opened.png')
        print('[+] Captured 03_reservation_modal_opened.png')

        # Submit Reservation Form
        print('[7] Submitting Reservation Form...')
        await page.click('.res-submit-btn')
        await asyncio.sleep(0.8)
        await page.screenshot(path=f'{OUTPUT_DIR}/04_reservation_submitted_success.png')
        print('[+] Captured 04_reservation_submitted_success.png')

        # Wait for auto-dismiss / close modal and return to book
        await asyncio.sleep(2.2)
        await page.click('.vg-close-btn')
        await asyncio.sleep(1.0)

        # Test Drag to Turn Page
        print('[8] Dragging to turn page to Item 02...')
        await page.mouse.move(1100, 480)
        await page.mouse.down()
        for step in range(1, 12):
            cur_x = 1100 - (380 * (step / 12))
            await page.mouse.move(cur_x, 480)
            await asyncio.sleep(0.02)
        await page.mouse.up()
        await asyncio.sleep(1.2)
        await page.screenshot(path=f'{OUTPUT_DIR}/05_page_drag_to_item2.png')
        print('[+] Captured 05_page_drag_to_item2.png')

        await browser.close()
        print('[+] All Photo Click & Reservation tests completed successfully!')

if __name__ == '__main__':
    asyncio.run(main())
