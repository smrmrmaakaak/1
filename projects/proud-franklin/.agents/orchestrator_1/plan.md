# Master Execution Plan: Antique Studio Photo & Catalog Integration Pipeline

## 1. Overview & Objectives
Build and execute the automated studio photo processing, 5-angle precision classification, authentic alpha matting, luxury studio backdrop synthesis, and catalog integration pipeline for antique collections (e.g. Lladro Gres Venus #2256 and other pieces in the catalog).

## 2. Execution Phases

### Phase 0: Parallel Survey & Discovery (Top-Level Survey)
- Dispatch 3 Explorers in parallel:
  - Explorer 1: Inspect raw photo assets, image paths, file naming, resolutions, and identify all antique items (specifically Lladro Gres Venus #2256 and existing pieces).
  - Explorer 2: Inspect catalog architecture (`src/data/antiques.js`, React/Vite components, 3D viewer, and book gallery slide implementations).
  - Explorer 3: Inspect image processing infrastructure (Python/Node scripts, Pillow, OpenCV, rembg, canvas, Vite build setup, package.json).
- Synthesize survey findings into `PROJECT.md` (Feature Inventory, Architecture, Interface Contracts, Code Layout).

### Phase 1: Dual Track Launch
- **E2E Testing Track**: Spawn Sub-orchestrator for E2E Testing to formulate `TEST_INFRA.md` and develop 4-tier opaque-box E2E test suites covering all inventoried features.
- **Implementation Track**:
  - **Milestone 1**: 5-Angle Precision Classification & Raw Asset Pipeline (Front, Profile, Detail, Back, Backstamp).
  - **Milestone 2**: Auction-Grade Studio Enhancement (High-precision alpha matting, luxury dark slate & warm charcoal radial spotlight backdrop, contact shadows, stoneware unsharp mask & texture enhancement, 100% authentic shape preservation).
  - **Milestone 3**: Seamless Data Integration into `src/data/antiques.js`, 3D viewer multi-angle rendering, and book gallery slides.
  - **Milestone 4 (Final)**: Pass 100% E2E tests, run `npm run build`, and execute Tier 5 adversarial coverage hardening.

### Phase 2: Rigorous Gate Verification
- Explorer -> Worker -> Reviewer -> Challenger -> Forensic Auditor cycle per milestone.
- Strict AND gate pass criteria (build passes, clean audit, approve from reviewers, challenger pass).

### Phase 3: Final Synthesis & Human Reporting
- Generate comprehensive report, verify all visual and build outputs, and report to user/parent.
