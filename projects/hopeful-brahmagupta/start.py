import sys
import os
import webbrowser
import time
import threading
import uvicorn

def open_browser(port=8000):
    time.sleep(1.2)
    url = f"http://127.0.0.1:{port}"
    print(f"\n========================================================")
    print(f"🚀 Ox Alpha Agent Studio 실행 중!")
    print(f"🌐 웹 브라우저 주소: {url}")
    print(f"========================================================\n")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Could not open browser automatically: {e}")

if __name__ == "__main__":
    port = 8000
    threading.Thread(target=open_browser, args=(port,), daemon=True).start()
    uvicorn.run("app:app", host="127.0.0.1", port=port, reload=False)
