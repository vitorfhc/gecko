## Codebase Overview

Gecko is a cross-browser (Chrome/Firefox) Manifest V3 extension that automates discovery of Client-Side Path Traversals (CSPT) by intercepting HTTP requests and matching URL-derived values against request paths. Findings are surfaced in a DevTools panel with search, filtering, and export capabilities.

**Stack**: TypeScript, React 18, Tailwind CSS 3, Headless UI, Webpack 5, webextension-polyfill
**Structure**: Service worker (`src/sw/`) handles detection, React UI split between DevTools panel (`src/pages/panel.tsx`) and popup settings (`src/pages/popup.tsx`), shared types/constants in `src/shared/`, reusable UI components in `src/components/ui/`. `browser.storage.local` is the single shared state bus between all contexts.

For detailed architecture, see [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md).
