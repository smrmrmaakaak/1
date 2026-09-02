# Execution Plan — Milestone 2, 3, 4

## Milestone 2: Authentic Alpha Matting & Studio Backdrop Synthesis
1. Implement scripts/enhance_studio_photos.py:
   - IS-Net foreground extraction with connected component filtering and morphology (3x3 ellipse closing, 1px erosion, sigma=0.5 Gaussian feathering).
   - Sotheby\'s dark slate radial spotlight gradient (#2A2F35 -> #1A1D20 -> #0A0B0D) using harmonic cosine smoothstep and TPDF dithering.
   - Dual-tier ground contact shadows (Tier 1 AO contact line + Tier 2 diffuse perspective penumbra) with distance attenuation.
   - CIELAB L* unsharp masking (radius 1.8, amount 120%, threshold 2.0) with soft-knee highlight protection.
   - Backstamp bypass: preserve authentic base plate, apply radial vignette (inner 0.65, outer 0.98, opacity 0.35) and unsharp mask (radius 1.5, amount 130%, threshold 1.0).
   - Standardized 1400x1800 RGB JPEG export to public/artifacts/lladro_gres_venus/studio_master/ and lookbook sync to public/assets/lladro_gres/.
2. Implement unit test suite 	ests/test_enhance_studio_photos.py.
3. Execute pipeline and verify all 5 studio masters.
4. Execute M2 Gate (2 Reviewers, 2 Challengers, 1 Forensic Auditor).

## Milestone 3: Catalog Data Integration
1. Inspect src/data/antiques.js and verify schema for prod-lladro-gres-2256-venus and other antique products.
2. Clean up non-porcelain material strings (embroidery/painting), verify physical dimensions (38x24x18.5 cm), and ensure all image URLs resolve.
3. Validate 3D Book Viewer folio rendering and 5-angle vertical modal stream.
4. Execute M3 Gate.

## Milestone 4: Acceptance & Hardening
1. Run master test runner python tests/run_all_e2e_tests.py ensuring 100% pass rate.
2. Run 
pm run build ensuring clean production build.
3. Add Tier 5 adversarial tests for edge cases (corrupt inputs, extreme color gamuts, memory safety).
4. Final Forensic Audit verification.
5. Report to parent.
