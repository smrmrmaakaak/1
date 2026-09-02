import os
import unittest
import re
from tests.utils.catalog_loader import get_all_products, get_catalog_books

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

class TestF10CatalogLorePolish(unittest.TestCase):
    """
    Feature 10: Catalog Data Quality & Lore Polish
    Verifies that all 29 antique lore entries, material descriptions,
    dimensions, and provenance details are authentic, free of placeholder text,
    and accurately describe porcelain/antique craftsmanship.
    """

    def setUp(self):
        self.products = get_all_products()
        self.books = get_catalog_books()

    def test_no_placeholder_or_todo_text(self):
        """
        Ensures zero 'lorem ipsum', 'todo', 'temp', 'placeholder', or 'asdf' strings.
        """
        banned_patterns = ["lorem ipsum", "todo", "tbd", "asdf", "placeholder", "임시텍스트"]
        for p in self.products:
            pid = p.get("id")
            for field in ["name", "latinName", "lore", "materials", "dimensions", "value", "appraisalGrade"]:
                val = str(p.get(field, "")).lower()
                for banned in banned_patterns:
                    self.assertNotIn(
                        banned, val,
                        f"Product {pid} field '{field}' contains placeholder text '{banned}': {val}"
                    )

    def test_materials_and_dimension_validity(self):
        """
        Verifies that materials describe physical attributes and dimensions contain metric units (cm/mm).
        """
        for p in self.products:
            pid = p.get("id")
            dim = p.get("dimensions", "")
            # Dimensions must contain numbers and unit cm or mm, or explicit measurement status
            has_metric = bool(re.search(r"\d+(\.\d+)?\s*(cm|mm)", dim, re.IGNORECASE)) or ("실측" in dim)
            self.assertTrue(
                has_metric,
                f"Product {pid} dimensions missing valid metric measurement format: '{dim}'"
            )

            # Material must be descriptive
            mat = p.get("materials", "")
            self.assertGreaterEqual(
                len(mat), 10,
                f"Product {pid} materials string too short/non-descriptive: '{mat}'"
            )

    def test_lladro_gres_material_accuracy(self):
        """
        Special check for Lladro Gres Venus: ensure material describes Gres/stoneware terracotta,
        NOT silk embroidery or canvas oil paintings.
        """
        venus = [p for p in self.products if p.get("id") == "prod-lladro-gres-2256-venus"]
        self.assertEqual(len(venus), 1)
        v = venus[0]
        mat = v.get("materials", "")
        self.assertTrue(
            "그레스" in mat or "Gres" in mat or "스톤웨어" in mat or "테라코타" in mat,
            f"Lladro Gres materials description does not accurately describe Gres stoneware: {mat}"
        )

if __name__ == "__main__":
    unittest.main()
