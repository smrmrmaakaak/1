import json
import os
import subprocess
import re

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CATALOG_PATH = os.path.join(WORKSPACE_ROOT, "src", "data", "antiques.js")

_CACHED_CATALOG = None

def get_catalog_books():
    """
    Loads and parses the ANTIQUE_BOOKS array from src/data/antiques.js.
    Uses Node.js import execution with fallback to regex extraction.
    """
    global _CACHED_CATALOG
    if _CACHED_CATALOG is not None:
        return _CACHED_CATALOG

    if not os.path.exists(CATALOG_PATH):
        raise FileNotFoundError(f"Catalog file not found at: {CATALOG_PATH}")

    # Method 1: Execute Node.js to evaluate ES module and output JSON
    try:
        cmd = [
            "node",
            "-e",
            "import('./src/data/antiques.js').then(m => process.stdout.write(JSON.stringify(m.ANTIQUE_BOOKS)))"
        ]
        res = subprocess.run(
            cmd,
            cwd=WORKSPACE_ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=10
        )
        if res.returncode == 0 and res.stdout.strip():
            _CACHED_CATALOG = json.loads(res.stdout.strip())
            return _CACHED_CATALOG
    except Exception as e:
        pass

    # Method 2: Fallback regex parser for JS export
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.search(r"export\s+const\s+ANTIQUE_BOOKS\s*=\s*(\[[\s\S]*\]);?\s*$", content)
    if match:
        json_str = match.group(1)
        # remove trailing commas before closing braces/brackets if any
        json_str = re.sub(r",\s*([\]}])", r"\1", json_str)
        _CACHED_CATALOG = json.loads(json_str)
        return _CACHED_CATALOG

    raise ValueError("Could not parse ANTIQUE_BOOKS from src/data/antiques.js")

def get_all_products():
    """
    Returns a flat list of all product dictionaries across all books,
    with an added `_bookId` and `_bookTitle` reference.
    """
    books = get_catalog_books()
    products = []
    for b in books:
        for p in b.get("products", []):
            prod_copy = dict(p)
            prod_copy["_bookId"] = b.get("id")
            prod_copy["_bookTitle"] = b.get("title")
            products.append(prod_copy)
    return products

def get_product_by_id(product_id):
    """
    Finds a single product by its id.
    """
    products = get_all_products()
    for p in products:
        if p.get("id") == product_id:
            return p
    return None
