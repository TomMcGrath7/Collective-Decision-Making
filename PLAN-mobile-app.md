# Plan — Mobile Web App (PWA)

Strategy and step-by-step plan for shipping the Collective Decision Making tool as an installable mobile web app.

---

## Why a PWA, not React Native or native

The app already meets every prerequisite for being a great PWA:

- **Pure client-side computation** — every mechanism runs in the browser, no backend.
- **Static asset deploy** — Vite + GitHub Pages, no server needed.
- **No platform-specific APIs** — no camera, no Bluetooth, no push notifications required.
- **Educational use case** — short, intentional sessions; not a daily-driver app fighting for a home-screen slot.

A PWA gets us:

- Installable on iOS (Add to Home Screen) and Android (Chrome install prompt).
- Offline use after first load — perfect for classrooms with flaky Wi-Fi.
- One codebase, one deploy pipeline, no app-store review.
- No new framework, no rewrite — incremental on the existing Vite/React app.

A native rewrite (React Native, Flutter, Capacitor) is **not justified** unless we later need: push notifications, file-system integration, app-store distribution for institutional procurement, or deep OS integration. Revisit only if those become real requirements.

---

## End-state checklist

When this plan is done, the app should:

- [ ] Pass Lighthouse "Installable" + "PWA" audits.
- [ ] Install on iOS Safari via Share → Add to Home Screen, opening full-screen with a custom icon and splash.
- [ ] Install on Android Chrome via the in-browser install prompt.
- [ ] Work fully offline after the first visit (all mechanisms, all pages).
- [ ] Work as a one-handed phone experience at 375 px width across all flows.
- [ ] Cache-bust correctly on new deploys without trapping users on a stale version.

---

## Implementation plan

Eight phases. Each phase is independently shippable.

### Phase 1 — Mobile responsiveness baseline

Don't ship a PWA shell over a layout that breaks at 375 px. Do this first.

- [ ] Audit every page at 375 / 414 / 768 widths.
- [ ] Fix the ranking UI for touch (see "Drag-and-drop ranking" in `TODO-ui-ux.md`). Critical — current ↑/↓ buttons are too small and fiddly on a phone.
- [ ] Fix the matching preferences input similarly.
- [ ] Make the Results page visualisations (once added) horizontally scrollable rather than overflowing.
- [ ] Add a sticky bottom "Continue" / "Run mechanism" CTA on input pages so it stays reachable as the form grows.
- [ ] Ensure tap targets are ≥ 44 × 44 px (Apple HIG) — the current `p-1` icon buttons are too small.
- [ ] Add `meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"` (likely already present — verify).
- [ ] Honour iOS safe-area insets via `env(safe-area-inset-*)` for the bottom CTA and any fixed elements.

**Done when:** every flow is comfortably usable on a phone in portrait, with one hand.

### Phase 2 — Manifest and icons

The minimum to be "installable".

- [ ] Add `public/manifest.webmanifest`:
  ```json
  {
    "name": "Collective Decision Making",
    "short_name": "Decisions",
    "description": "Explore voting, fair division, claims problems, and matching mechanisms.",
    "start_url": "/Collective-Decision-Making/",
    "scope": "/Collective-Decision-Making/",
    "display": "standalone",
    "orientation": "portrait",
    "background_color": "#f8fafc",
    "theme_color": "#2563eb",
    "icons": [
      { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
      { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
    ]
  }
  ```
- [ ] Generate icons (192, 512, 512-maskable, plus an iOS 180×180 `apple-touch-icon`). A simple ballot/scales/pie-slice glyph on the existing blue-600 background is fine; can iterate later.
- [ ] Reference in `index.html`:
  ```html
  <link rel="manifest" href="/Collective-Decision-Making/manifest.webmanifest" />
  <link rel="apple-touch-icon" href="/Collective-Decision-Making/icons/apple-touch-icon.png" />
  <meta name="theme-color" content="#2563eb" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Decisions" />
  ```
- [ ] Verify the GitHub Pages base path (`/Collective-Decision-Making/`) is reflected in `start_url` and `scope`.

**Done when:** Lighthouse PWA audit shows "Installable" green.

### Phase 3 — Service worker + offline

Use **`vite-plugin-pwa`** (Workbox under the hood). It handles service worker registration, precaching, and update flow with minimal config.

- [ ] `npm i -D vite-plugin-pwa`
- [ ] In `vite.config.ts`:
  ```ts
  import { VitePWA } from 'vite-plugin-pwa'
  // ...
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*'],
      manifest: false, // we ship our own manifest.webmanifest
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: '/Collective-Decision-Making/index.html',
      },
    }),
  ],
  ```
- [ ] Add an "Update available — reload" toast (vite-plugin-pwa exposes a `useRegisterSW` hook). Don't auto-reload — surprises users mid-flow.
- [ ] Verify in DevTools Application tab: service worker active, all assets cached.

**Done when:** Disable network in DevTools, refresh, and the full app still works.

### Phase 4 — iOS-specific fixes

iOS PWAs have rough edges. None are blockers but each is a polish item.

- [ ] Custom splash screens (one per device size) via `<link rel="apple-touch-startup-image">`. Optional — the OS will use a blank background otherwise.
- [ ] Test "Add to Home Screen" → launch fullscreen → all routes work (React Router + service worker + iOS standalone interaction sometimes loses route state on cold launch).
- [ ] `overscroll-behavior: contain` on scrollable areas to avoid the rubber-band exposing browser chrome.
- [ ] Disable iOS text auto-zoom on form inputs by setting `font-size: 16px` minimum on inputs.
- [ ] Test that `prefers-color-scheme: dark` doesn't produce unreadable text (currently no dark mode — out of scope but worth noting).

### Phase 5 — Local persistence

Phones get backgrounded, switched apps, run out of battery. Don't lose the user's work.

- [ ] Persist the in-progress problem to `localStorage` on every state change in `useSession`.
- [ ] On load, prompt: "Resume your previous decision?" with options to continue or start fresh.
- [ ] Cap stored size; clear on explicit "reset" actions.
- [ ] (Optional) Migrate to IndexedDB if scenarios get larger or we add a "saved scenarios" library.

### Phase 6 — Share Target / Web Share

PWAs can both *receive* shares and trigger native share sheets. Useful here for "share this scenario".

- [ ] Add `navigator.share({ title, text, url })` on a Results-page Share button. Falls back to copy-to-clipboard.
- [ ] (Optional) Register as a Web Share Target so users can share text *into* the app — only worth it once we support textual ballot import (e.g. `3:A>B>C`).

### Phase 7 — Performance

Phones over 4G are the hard case.

- [ ] Audit current bundle (`415 KB` minified, `119 KB` gzipped per the build output) — fine for desktop, borderline for mobile cold start.
- [ ] Route-level code-splitting via `React.lazy` + `Suspense`. The Learn More page in particular is a candidate to defer.
- [ ] Treeshake unused parts of `canvas-confetti` or load it dynamically only when the Results page actually fires it.
- [ ] Self-host fonts (or rely on system fonts) to avoid render-blocking webfont fetches.
- [ ] Verify Lighthouse mobile performance ≥ 90.

### Phase 8 — Distribution and discovery

- [ ] In-app install prompt (custom button that calls `beforeinstallprompt`'s `prompt()`). Don't rely on Chrome's automatic mini-infobar — easy to miss.
- [ ] Add a "Use offline" or "Install" CTA on the Home page.
- [ ] Update README with screenshots of the installed app on iOS / Android.
- [ ] (Optional) Submit to PWA directories (`appsco.pe`, etc.) — low value, low effort.
- [ ] (Optional, much later) Wrap with Capacitor or PWABuilder for true app-store distribution if institutional users ask. Not now.

---

## Risks and trade-offs

- **GitHub Pages base-path footguns.** `start_url`, `scope`, and the service worker `navigateFallback` all need the `/Collective-Decision-Making/` prefix. Easy to get wrong; test before declaring Phase 2/3 done.
- **Stale-cache lockout.** A misconfigured service worker can pin users to an old version. Use `registerType: 'prompt'` (not `autoUpdate`) and surface an explicit "update available" UI.
- **iOS install discoverability.** iOS has no install prompt — users must know to tap Share → Add to Home Screen. Add a one-time hint banner for Safari on iOS users who haven't installed.
- **Offline + analytics.** If we add analytics later, queue events while offline and flush on reconnect — or skip when offline. Don't silently drop.
- **Service worker scope.** Service workers can only control pages at or under their scope. With the GH Pages subpath, that's automatic, but worth a check.

---

## What this plan deliberately does NOT include

- **React Native / Flutter / Capacitor rewrite** — see "Why a PWA" above.
- **Push notifications** — no use case for a decision tool.
- **Account system / cloud sync** — kills the "all calculations on-device" privacy story.
- **App Store / Play Store submission** — costs, review friction, and ongoing maintenance for no real distribution win at this stage.

Revisit any of these only when there's a concrete user-driven reason.

---

## Suggested ordering

If shipping this incrementally, the natural order is:

1. **Phase 1** (responsive) — unlocks every other phase.
2. **Phase 2** (manifest) — cheap, makes the app "installable" today.
3. **Phase 3** (service worker) — biggest user-visible win: offline.
4. **Phase 5** (persistence) — most-asked feature for any input-heavy app.
5. **Phase 7** (performance) — once everything's wired, measure and trim.
6. **Phases 4, 6, 8** (iOS polish, sharing, install prompt) — distributed-leverage polish; ship as time allows.
