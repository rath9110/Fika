---
description: Standard operating procedure for implementing new features in Fika
---

Follow these steps for every new feature request to ensure consistency and quality.

### 1. Research & Context Alignment
- **Read Rules:** Read `.agent/rules/README.md` and follow the relevant linked rule files. 
- **Verify Stack:** Ensure the approach uses React + Vite + TypeScript.
- **Tone Check:** Review `tone-and-copy.md` before writing any user-facing text.

### 2. Design Foundation
- **Mobile-First Layout:** Draft the UI for a 375px width (portrait). 
- **Hierarchy Check:** Ensure clear visual priority using headers and button weights (see `visual-hierarchy.md`).
- **Interactive Elements:** Verify all tap targets are ≥ 44px. No hover-dependent logic.

### 3. Implementation (Offline-First)
- **State Management:** Use `localStorage` as the primary source of truth for immediate interaction.
- **Sync Logic:** Implement Supabase sync for authenticated users secondarily.
- **Motion:** Apply subtle transitions (150-250ms) for any UI changes (see `animation-and-motion.md`).

### 4. Quality Assurance
- **Local Testing:** Test the feature in the browser using mobile emulation.
- **Offline Test:** Verify the feature works when network requests are blocked (simulating airplane mode).
- **Consolidation:** Check for redundant dependencies; avoid adding new ones unless strictly necessary.

### 5. Documentation
- If the feature introduces a new UI pattern, update `visual-hierarchy.md`.
- If a new technical decision was made, update `.agent/memory/architecture-decisions.md` (if it exists).
