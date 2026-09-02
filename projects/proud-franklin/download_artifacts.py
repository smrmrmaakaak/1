import os
import urllib.request

os.makedirs("public/artifacts", exist_ok=True)

# Curated Reliable High-Resolution Museum Antique Images (Direct Unsplash & Archive)
images = {
    # 1. Astrolabe: Antique brass astronomical clock & celestial astrolabe mechanism
    "astrolabe_main.jpg": "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=1200&q=90",
    "astrolabe_detail.jpg": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=90",
    
    # 2. Crusader Sword: Medieval castle armor and historical Damascus longsword
    "sword_main.jpg": "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=1200&q=90",
    "sword_detail.jpg": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=90",
    
    # 3. Alchemy: Antique apothecary vials, herbal distillation glass, and ancient botanical manuscript
    "alchemy_main.jpg": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=90",
    "alchemy_detail.jpg": "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=1200&q=90"
}

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

for filename, url in images.items():
    filepath = os.path.join("public/artifacts", filename)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response, open(filepath, "wb") as out_file:
            out_file.write(response.read())
        print(f"[+] Downloaded {filename} ({os.path.getsize(filepath)} bytes)")
    except Exception as e:
        print(f"[-] Failed {filename}: {e}")
