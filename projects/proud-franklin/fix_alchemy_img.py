import os
import urllib.request

# Authentic ancient illuminated botanical manuscript & alchemy drawing
url = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=90"
filepath = "public/artifacts/alchemy_detail.jpg"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as res, open(filepath, "wb") as f:
        f.write(res.read())
    print(f"[+] Replaced alchemy_detail.jpg ({os.path.getsize(filepath)} bytes)")
except Exception as e:
    print(f"[-] Failed: {e}")
