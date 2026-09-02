import os
import urllib.request

# Authentic medieval knight longsword / crusader armor / historical museum blade
sword_images = {
    # Authentic medieval sword and knight steel armor in castle
    "sword_main.jpg": "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=1200&q=90",
    # Medieval castle armory & historical blade craftsmanship
    "sword_detail.jpg": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=90"
}

# Let's test alternative reliable direct photos of historical medieval swords
urls = [
    ("sword_main.jpg", "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=1200&q=90"),
    ("sword_main.jpg", "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=90")
]

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# Let's check unsplash search or reliable historical image
import json

# Let's download a genuine medieval armor & sword photo
target_main = "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=90"
# Or a genuine museum knight sword
target_sword = "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=1200&q=90"

for fn, u in [("sword_main.jpg", "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=90")]:
    req = urllib.request.Request(u, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as res, open(f"public/artifacts/{fn}", "wb") as f:
        f.write(res.read())
    print(f"[+] Downloaded {fn} ({os.path.getsize(f'public/artifacts/{fn}')} bytes)")
