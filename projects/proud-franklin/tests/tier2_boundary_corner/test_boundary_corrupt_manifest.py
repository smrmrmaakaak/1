import os
import unittest
from tests.utils.catalog_loader import get_all_products, get_catalog_books

class TestBoundaryCorruptManifest(unittest.TestCase):
    """
    Tier 2 Boundary Test: Manifest Robustness & Missing Field Resilience
    Verifies that catalog parsing gracefully handles edge conditions,
    missing optional attributes, and ensures all products have unique identifiers.
    """

    def test_unique_product_ids(self):
        products = get_all_products()
        ids = [p.get("id") for p in products]
        unique_ids = set(ids)
        self.assertEqual(
            len(ids), len(unique_ids),
            f"Duplicate product IDs detected! Total: {len(ids)}, Unique: {len(unique_ids)}"
        )

    def test_unique_tome_ids_and_slugs(self):
        books = get_catalog_books()
        book_ids = [b.get("id") for b in books]
        slugs = [b.get("slug") for b in books]

        self.assertEqual(len(book_ids), len(set(book_ids)), "Duplicate book IDs detected")
        self.assertEqual(len(slugs), len(set(slugs)), "Duplicate book slugs detected")

    def test_no_empty_string_critical_fields(self):
        products = get_all_products()
        for p in products:
            pid = p.get("id")
            for key in ["name", "mainImage", "detailImage", "value", "appraisalGrade"]:
                val = p.get(key)
                self.assertIsNotNone(val, f"Product {pid} has None for field {key}")
                self.assertNotEqual(str(val).strip(), "", f"Product {pid} has empty whitespace for field {key}")

if __name__ == "__main__":
    unittest.main()
