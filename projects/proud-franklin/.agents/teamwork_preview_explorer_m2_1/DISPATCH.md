## 2026-09-02T02:32:42Z
**Mission**: Milestone 2 - Authentic Alpha Matting & Luxury Studio Backdrop Synthesis Investigation
**Scope**:
1. Investigate the alpha matting pipeline on the 5 classified raw photos in `public/artifacts/lladro_gres_venus/` identified in `classification_manifest.json`.
2. Ensure 100% authentic physical shape preservation (ZERO generative redrawing, ZERO geometry modification).
3. Design the multi-stage matting strategy (IS-Net foreground segmentation via `rembg`, OpenCV morphological boundary erosion/dilation, and Gaussian/PyMatting alpha edge feathering) to eliminate white/gray halos around terracotta contours and wavy hair.
4. Verify the backstamp macro preservation directive (`mattingRequired: false`), ensuring the base plate hallmark photo retains its authentic physical framing and surface texture.
5. Write complete analysis and findings to `analysis.md` and handoff summary to `handoff.md`.
