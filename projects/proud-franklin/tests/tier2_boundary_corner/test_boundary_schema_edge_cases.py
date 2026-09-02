import os
import unittest
from tests.utils.catalog_loader import get_all_products, get_catalog_books

class TestBoundarySchemaEdgeCases(unittest.TestCase):
    """
    Tier 2 Boundary Test: Schema Edge Cases (Unicode, Accents, Sold-Out states, Pricing strings)
    Verifies that the catalog schema handles international accents, Hangul strings,
    sold-out state flags, and currency formatting without encoding corruption.
    """

    def setUp(self):
        self.products = get_all_products()
        self.books = get_catalog_books()

    def test_unicode_and_diacritic_preservation(self):
        """
        Verifies that Spanish/French accents (ó, è, etc.) and Korean Hangul are intact.
        """
        all_text = ""
        for b in self.books:
            all_text += f" {b.get('brandLatin', '')} {b.get('latinTitle', '')} {b.get('title', '')}"
        for p in self.products:
            all_text += f" {p.get('name', '')} {p.get('latinName', '')} {p.get('lore', '')}"

        # Accents in brand names
        self.assertTrue("LLADRÓ" in all_text or "Lladró" in all_text, "Lladró accent ó was corrupted")
        # Korean hangul check
        has_korean = any(ord(c) >= 0xAC00 and ord(c) <= 0xD7A3 for c in all_text)
        self.assertTrue(has_korean, "Korean Hangul characters missing or corrupted")

    def test_sold_out_product_state_handling(self):
        """
        Verifies that products marked isSoldOut have valid soldOutBadge or soldOutDate strings.
        """
        sold_out_prods = [p for p in self.products if p.get("isSoldOut") is True]
        self.assertGreaterEqual(len(sold_out_prods), 1, "Expected at least 1 sold out demo product (e.g. Nao #1429)")

        for p in sold_out_prods:
            pid = p.get("id")
            badge = p.get("soldOutBadge", "")
            self.assertTrue(
                "SOLD OUT" in badge or "소장 완료" in badge,
                f"Sold out product {pid} missing soldOutBadge: {badge}"
            )

    def test_currency_string_formatting(self):
        """
        Verifies that all product values contain Korean Won symbol (₩) and valid numeric digits.
        """
        for p in self.products:
            pid = p.get("id")
            val = p.get("value", "")
            self.assertIn("₩", val, f"Product {pid} value missing '₩' symbol: '{val}'")
            has_digits = any(c.isdigit() for c in val)
            self.assertTrue(has_digits, f"Product {pid} value missing price digits: '{val}'")

if __name__ == "__main__":
    unittest.main()
