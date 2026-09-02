import urllib.request, os

museum_images = {
    # 1. Astrolabe: Antique brass celestial clockwork mechanism
    "astrolabe_main.jpg": "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=1200&q=90",
    "astrolabe_detail.jpg": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=90",
    
    # 2. Crusader Sword: Medieval historical blade & gothic castle armor
    "sword_main.jpg": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=90",
    "sword_detail.jpg": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=90",
    
    # 3. Alchemy: Antique apothecary vials & Renaissance botanical still life
    "alchemy_main.jpg": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=90",
    "alchemy_detail.jpg": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=90"
}

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

for filename, url in museum_images.items():
    filepath = os.path.join("public/artifacts", filename)
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response, open(filepath, "wb") as out_file:
        out_file.write(response.read())
    print(f"[+] Verified {filename} ({os.path.getsize(filepath)} bytes)")
