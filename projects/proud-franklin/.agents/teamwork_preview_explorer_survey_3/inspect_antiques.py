import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open(r"c:\Users\황태민\Documents\antigravity\proud-franklin\src\data\antiques.js", "r", encoding="utf-8") as f:
    content = f.read()

print(f"Total size: {len(content)} characters, lines: {len(content.splitlines())}")

# Match book categories: "categoryKey": "..." or "id": "..."
book_matches = re.findall(r'"id":\s*"([^"]+)",\s*\n\s*"title":\s*"([^"]+)"', content)
print(f"Found {len(book_matches)} books/categories:")
for bid, btitle in book_matches:
    print(f"  - [{bid}] {btitle}")

# Find all items/products
prod_matches = re.findall(r'"id":\s*"(prod-[^"]+)",\s*\n\s*"itemNumber":\s*"([^"]+)",\s*\n\s*"name":\s*"([^"]+)"', content)
print(f"\nFound {len(prod_matches)} antique items/products:")
for pid, item_no, name in prod_matches:
    print(f"  - [{pid}] {item_no}: {name}")

print("\n--- Gallery Photos & Studio Master Status ---")
items_split = content.split('"id": "prod-')
for item_block in items_split[1:]:
    item_id = "prod-" + item_block.split('"')[0]
    photos = re.findall(r'"src":\s*"([^"]+)"', item_block)
    has_studio = any("studio_master" in p for p in photos)
    print(f"  Item: {item_id:30s} | Photos: {len(photos):2d} | Uses Studio Master: {has_studio}")
