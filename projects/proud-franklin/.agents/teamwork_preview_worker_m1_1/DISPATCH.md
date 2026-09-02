## 2026-09-02T02:17:53Z
You are the Worker for Milestone 1 (5-Angle Asset Classification & Ingestion Pipeline).
Your Working Directory: c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_worker_m1_1
Original Request File: c:\Users\황태민\Documents\antigravity\proud-franklin\ORIGINAL_REQUEST.md
Project File: c:\Users\황태민\Documents\antigravity\proud-franklin\PROJECT.md

Explorer Reports to Review:
- c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_explorer_m1_1\handoff.md
- c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_explorer_m1_2\handoff.md
- c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_explorer_m1_3\handoff.md

Your Exclusive File Ownership:
- `scripts/classify_and_ingest_photos.py`
- `tests/test_classify_and_ingest.py`

Tasks:
1. Implement `scripts/classify_and_ingest_photos.py`:
   - Safely handle Windows Unicode file paths (using binary buffer decoding `cv2.imdecode(np.fromfile(...))` or PIL).
   - Ingest raw collection photos from `--input-dir` (e.g. `public/artifacts/lladro_gres_venus/`).
   - Implement quantitative heuristics for classifying into 5 Sotheby's angles: `HERO_FRONT` (전신 전면), `SIDE_PROFILE` (3/4 측면), `PORTRAIT_TORSO` (상체 디테일), `REAR_SCULPTURE` (후면 조형미), `BASE_BACKSTAMP` (하단 각인/백스탬프).
   - Support CLI arguments: `--input-dir`, `--output-manifest`, `--product-id`, `--item-slug`, `--override-json`, `--strict`, `--normalize-exif`.
   - Output clean `classification_manifest.json` adhering to the schema specified in Explorer 3's report.
2. Implement unit tests in `tests/test_classify_and_ingest.py` verifying classification accuracy, manifest structure, and CLI options.
3. Execute `python scripts/classify_and_ingest_photos.py --input-dir public/artifacts/lladro_gres_venus/ --output-manifest public/artifacts/lladro_gres_venus/classification_manifest.json --product-id prod-lladro-gres-2256-venus --item-slug venus` and verify `classification_manifest.json` is generated correctly.
4. Run `python -m unittest tests/test_classify_and_ingest.py` and `python tests/run_all_e2e_tests.py` to confirm all tests pass.
5. Write your complete handoff report to `c:\Users\황태민\Documents\antigravity\proud-franklin\.agents\teamwork_preview_worker_m1_1\handoff.md` including test execution output.
