import os
import unittest
from tests.utils.catalog_loader import get_catalog_books, get_all_products

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF09CatalogSchemaIntegrity(unittest.TestCase):
    """
    Feature 9: Catalog Data Schema Integration (src/data/antiques.js)
    Verifies that all master brand books and antique items strictly adhere to
    the standard catalog schema contract.
    """

    def setUp(self):
        self.books = get_catalog_books()
        self.products = get_all_products()

    def test_total_tomes_and_products_count(self):
        self.assertEqual(len(self.books), 8, f"Expected exactly 8 master tomes (LIBER I-VIII), got {len(self.books)}")
        self.assertGreaterEqual(len(self.products), 25, f"Expected at least 25 products, got {len(self.products)}")

    def test_tome_schema_fields(self):
        required_tome_fields = [
            "id", "slug", "tomeNumber", "brandName", "brandLatin",
            "title", "latinTitle", "category", "categoryKey", "products"
        ]
        for b in self.books:
            for field in required_tome_fields:
                self.assertIn(field, b, f"Book {b.get('id')} missing required field: {field}")
                self.assertTrue(b[field], f"Book {b.get('id')} has empty field: {field}")

    def test_product_schema_fields(self):
        required_prod_fields = [
            "id", "itemNumber", "name", "latinName", "era", "value",
            "appraisalGrade", "materials", "dimensions", "mainImage",
            "detailImage", "lore", "specs", "galleryPhotos"
        ]
        for p in self.products:
            pid = p.get("id")
            for field in required_prod_fields:
                self.assertIn(field, p, f"Product {pid} missing field: {field}")
                self.assertTrue(p[field], f"Product {pid} has empty field: {field}")

            # Verify specs array
            self.assertIsInstance(p["specs"], list, f"Product {pid} specs must be a list")
            self.assertGreaterEqual(len(p["specs"]), 1, f"Product {pid} must have at least 1 spec")
            for spec in p["specs"]:
                self.assertIn("label", spec, f"Product {pid} spec missing 'label'")
                self.assertIn("value", spec, f"Product {pid} spec missing 'value'")

            # Verify galleryPhotos array
            self.assertIsInstance(p["galleryPhotos"], list, f"Product {pid} galleryPhotos must be a list")
            self.assertGreaterEqual(len(p["galleryPhotos"]), 1, f"Product {pid} must have at least 1 gallery photo")
            for photo in p["galleryPhotos"]:
                self.assertIn("src", photo, f"Product {pid} photo missing 'src'")
                self.assertIn("angleTag", photo, f"Product {pid} photo missing 'angleTag'")
                self.assertIn("caption", photo, f"Product {pid} photo missing 'caption'")
                self.assertIn("macroRatio", photo, f"Product {pid} photo missing 'macroRatio'")

    def test_all_catalog_image_paths_exist_on_filesystem(self):
        """
        Ensures zero 404 broken image paths in mainImage, detailImage, and galleryPhotos.
        """
        for p in self.products:
            pid = p.get("id")
            # mainImage
            main_img_rel = p["mainImage"].lstrip("/")
            main_img_full = os.path.join(WORKSPACE_ROOT, "public", main_img_rel)
            self.assertTrue(
                os.path.exists(main_img_full),
                f"Product {pid} mainImage missing on disk: {main_img_full}"
            )

            # detailImage
            detail_img_rel = p["detailImage"].lstrip("/")
            detail_img_full = os.path.join(WORKSPACE_ROOT, "public", detail_img_rel)
            self.assertTrue(
                os.path.exists(detail_img_full),
                f"Product {pid} detailImage missing on disk: {detail_img_full}"
            )

            # gallery photos
            for photo in p["galleryPhotos"]:
                src_rel = photo["src"].lstrip("/")
                src_full = os.path.join(WORKSPACE_ROOT, "public", src_rel)
                self.assertTrue(
                    os.path.exists(src_full),
                    f"Product {pid} gallery photo missing on disk: {src_full}"
                )

if __name__ == "__main__":
    unittest.main()
