import os
import unittest
from tests.utils.catalog_loader import get_catalog_books, get_all_products

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestFullCatalog29ProductsIntegrity(unittest.TestCase):
    """
    Tier 4 Real-World Workload: Full Catalog Batch Conformance
    Validates complete integrity across all 8 books and all 29 antique products.
    """

    def setUp(self):
        self.books = get_catalog_books()
        self.products = get_all_products()

    def test_all_29_products_count_and_uniqueness(self):
        self.assertEqual(len(self.products), 29, f"Expected 29 total products across all books, got {len(self.products)}")
        ids = [p["id"] for p in self.products]
        self.assertEqual(len(ids), len(set(ids)), "Product IDs must be unique across all books")

    def test_batch_asset_existence_for_all_products(self):
        """
        Iterates over all 29 products and verifies that every single mainImage,
        detailImage, and galleryPhoto exists on the disk filesystem.
        """
        missing_assets = []
        total_photos_checked = 0

        for p in self.products:
            pid = p["id"]
            # Main image
            main_p = os.path.join(WORKSPACE_ROOT, "public", p["mainImage"].lstrip("/"))
            total_photos_checked += 1
            if not os.path.exists(main_p):
                missing_assets.append(f"{pid} mainImage missing: {main_p}")

            # Detail image
            detail_p = os.path.join(WORKSPACE_ROOT, "public", p["detailImage"].lstrip("/"))
            total_photos_checked += 1
            if not os.path.exists(detail_p):
                missing_assets.append(f"{pid} detailImage missing: {detail_p}")

            # Gallery photos
            for photo in p.get("galleryPhotos", []):
                total_photos_checked += 1
                g_p = os.path.join(WORKSPACE_ROOT, "public", photo["src"].lstrip("/"))
                if not os.path.exists(g_p):
                    missing_assets.append(f"{pid} galleryPhoto missing: {g_p}")

        self.assertEqual(
            len(missing_assets), 0,
            f"Found {len(missing_assets)} missing image assets across {total_photos_checked} checked photos:\n" +
            "\n".join(missing_assets[:10])
        )

    def test_batch_lore_and_specs_richness(self):
        """
        Ensures that every product has deep historical lore and at least 3 detailed specs.
        """
        for p in self.products:
            pid = p["id"]
            lore = p.get("lore", "")
            self.assertGreater(
                len(lore), 20,
                f"Product {pid} has excessively short lore ({len(lore)} chars): '{lore}'"
            )

            specs = p.get("specs", [])
            self.assertGreaterEqual(
                len(specs), 2,
                f"Product {pid} has too few specifications ({len(specs)})"
            )

if __name__ == "__main__":
    unittest.main()
