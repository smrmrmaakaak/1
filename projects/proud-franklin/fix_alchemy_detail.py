import os
import urllib.request

# Authentic antique botanical manuscript illustration / medieval illuminated grimoire
url = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=90"
filepath = "public/artifacts/alchemy_detail.jpg"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as res, open(filepath, "wb") as f:
        f.write(res.read())
    print(f"[+] Downloaded authentic antique painting/manuscript detail ({os.path.getsize(filepath)} bytes)")
except Exception as e:
    print(f"[-] Failed: {e}")
