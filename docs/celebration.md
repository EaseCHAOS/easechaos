# Celebration System: Exam Completion Surprise

> Premium, clean surprise (Apple / Cursor / Google) for students who finish their exams, with special graduate treatment for Level 400.

## TL;DR

| Trigger | Surface | Icon Stack (1024 3D) | Motion |
|---------|---------|----------------------|--------|
| `ONE_LEFT` with 1 paper left (future) | Sticky banner (non-blocking) | `rocket` + `fire` + `goal` + `sparkles` | Small banner slide in plus 2s side cannons |
| `LAST_TODAY` with last paper today | Sticky banner | same as above, copy tweaked | same |
| `DONE` with 0 papers left | Glass modal plus share | `trophy` + `confetti` + `checked` + `sparkles` | Center burst plus side cannons 2.8s |
| `GRADUATE_DONE` with DONE plus year is 4 (400) | Glass modal plus gold plus share card | `graduation-cap` + `diploma` + `trophy` + `medal` + `sparkles` | Gold palette, 4.2s cannons, center 90-particle burst |

All icons are **Icons8 3D Fluency, 1024 transparent PNG** stored in `frontend/assets/celebration/` (512 plus 1024 variants, `srcSet` for retina). Aqua pack reserved as alt. Attribution: Icons8 (free tier).

---

## 1. Design Principles

- **Glass, not gloss**: `bg-white/90 backdrop-blur-2xl rounded-[32px] border-white/20 shadow-2xl` (dark: `bg-zinc-900/90`). Top hairline `via-white/60` sheen, shimmer sweep once.
- **Icon as hero**: 3D skeuomorph is the only color pop. Card stays monochrome and white so icons read premium. `drop-shadow-[0_16px_32px_rgba(0,0,0,0.18)]` plus `float` 3s ease in out plus `twinkle` for sparkles.
- **Typography**: `tracking-[-0.02em]`, `text-[28px] font-semibold`, eyebrow `uppercase tracking-[0.14em] text-[11px]`. Matches `ExamView` tokens.
- **Motion respects user**: `prefers-reduced-motion: reduce` means no confetti. All animations use `will-change-transform`.

## 2. Assets

```
frontend/assets/celebration/
  trophy-{512,1024}.png          # 839K / 220K
  graduation-cap-{512,1024}.png  # 655K / 162K
  confetti-{512,1024}.png
  rocket-{512,1024}.png
  sparkles-{512,1024}.png
  diploma-{512,1024}.png
  medal-{512,1024}.png
  checked-{512}.png / checked-checkbox-1024.png
  fire-{512,1024}.png
  goal-{512,1024}.png
```

Source: `https://img.icons8.com/3d-fluency/{512,1024}/{name}.png` pulled via `curl`, verified 200. Total about 5.6 MB (not shipped to `dist` until imported; Vite code splits).

**Alternative:** `Aqua Icons` (51 icons, 4k, Figma community, GitHub `YamilAyma/aqua-icons`) glossy candy Aqua 2003 style, kept as alt if brand wants more playful.

## 3. Architecture

### 3.1 State detection: `frontend/src/lib/celebration.ts`

```ts
export type CelebrationState = "ONE_LEFT" | "LAST_TODAY" | "DONE" | "GRADUATE_DONE" | null;

getCelebrationState({ totalPapers, remainingPapers, lastPaperDate, isFinalYear, hasExams })
```

- `totalPapers`: deduped `day::value` keys (mirrors `ExamPage:getGroupedPaperCount`).
- `remainingPapers`: grouped papers where `date >= startOfToday()`.
- `isFinalYear`: `String(year) === "4"` (`years` id 4 is name "400").
- Persists dismissal: `localStorage["easechaos:celebration:{version}:{state}"] = "dismissed"` keyed by `examData.version` (draft hash), so new draft shows again.

Helpers: `shouldShowCelebration`, `dismissCelebration`, `resetCelebration`.

### 3.2 Overlay: `frontend/src/components/CelebrationOverlay.tsx`

- Props: `{ state, version, dept, yearLabel, onClose, onShare }`
- Banner branch (`ONE_LEFT`/`LAST_TODAY`): fixed top, `max-w-[560px]`, amber gradient icon badge, dismiss X.
- Modal branch (`DONE`/`GRADUATE_DONE`): backdrop `bg-[#0A0A0F]/40 backdrop-blur-[16px]`, card `rounded-[32px]` with `IconStack` (absolute positioned 3D PNGs).
- Confetti: `canvas-confetti@1.9.4` side cannons (angle 60 and 120, spread 70) plus center burst. Colors per state (graduate gold `#D4AF37` and `#FFD700`, done blue and green and amber). Guarded by `matchMedia("(prefers-reduced-motion: reduce)")`.
- Close: X button, backdrop click, `Escape` key, auto dismiss persists.

### 3.3 Share Card: `frontend/src/components/ShareCard.tsx`

- DOM node `id="celebration-share-card"` with **1080 by 1080** square (WhatsApp Status, X, Instagram).
- Gradient `#0A0A0F` to `#111827` to `#1E293B`, blurred orbs, hero icon (gradCap or trophy plus sparkles), stats pills (`dept year`, `N papers`, `Graduate` if 400), footer `easechaos.xyz #UMaT2026`.
- Hidden off screen in `ExamPage` (`left-[-9999px] opacity-0`) and captured on demand.
- Capture: existing `frontend/src/utils/downloadUtils.ts:downloadElementAsImage` (`html-to-image`) produces `easeCHAOS-{dept}-{year}.png`.

### 3.4 Wiring: `frontend/src/pages/ExamPage.tsx`

- Computes `celebrationState` from `examData` (grouped papers) plus `isFinalYear`.
- `useEffect` shows overlay after 700ms if `shouldShowCelebration(version, state)` is true.
- Renders `<CelebrationOverlay>` plus hidden `<ShareCard>` (always, so capture works even when modal not visible).
- `onShare` calls `downloadElementAsImage("celebration-share-card", ...)`.

### 3.5 Preview: `frontend/src/pages/CelebrationPreviewPage.tsx` at `/preview/celebration`

- Live canvas: controls for all 4 states, replay and dismiss, theme toggle.
- Left: state picker plus share card download.
- Right: simulated ExamView surface with overlay plus scaled ShareCard preview (`scale-[0.32]`).
- Uses `PREVIEW_VERSION = "preview-v1"` so preview does not pollute real dismissal keys.

### 3.6 Routes: `frontend/src/App.tsx`

```tsx
<Route path="/preview/celebration" element={<CelebrationPreviewPage />} />
<Route path="/admin/halls" element={<HallSchedulePage />} />
```

## 9. Teaser Campaign (Curiosity Loop)

Do not spoil the surprise. Tease it.

**TeaserCard** (`frontend/src/components/TeaserCard.tsx`): same premium dark gradient as ShareCard, gift box 1024 plus sparkles, QR to `easechaos.xyz` (via `api.qrserver.com`), footer `easeCHAOS` h-14 as fixed above. Two formats:

- `feed` with 1080 square for WhatsApp Status, X feed, Instagram feed
- `story` with 1080 by 1920 for WhatsApp Status full screen, X, Instagram Story

Hooks rotate without spoiling:

- "Something is waiting after your last paper. Finish strong. Open EaseChaos. You will know."
- "EaseChaos has a surprise waiting for you. Your last paper is not the end. Come find what we saved."
- "One more paper. Then come see. No spoilers. Just finish and open EaseChaos."

Preview and download both at `/preview/celebration` (bottom section) via same `downloadElementAsImage`.

**LandingPage pull banner** (`frontend/src/components/TeaserBanner.tsx`): fixed `max-w-[560px]` pill, gift icon, text "Psst. EaseChaos has a surprise waiting. Finish your last paper and open your schedule to find it." Shows `2026-08-25` to `2026-09-15` (exam window plus a week after), dismissible via `localStorage["easechaos:teaser-banner:dismissed:2026-08"]`. Works on mobile and tablet: `px-3`, `sm:`, `truncate`, `flex`, `backdrop-blur-xl`.

**Marketing flow:**

1. Pre last papers (now to Aug 31): post teaser feed and story in department WhatsApp groups, X, Instagram. No reveal.
2. Last paper days: students hit `DONE` or `GRADUATE_DONE` modal and their auto generated 1080 reveal card is what they post. That is the viral loop. Teaser reposts drive FOMO.
3. Measure: `analytics` on `celebration shown`, `dismissed`, `share downloaded`.

All flyers use the same h-14 top bar and h-9 footer as fixed above, so branding stays legible at 3.5 inch phone width and on tablet.

## 4. Copy (No em dashes, research backed)

| State | Eyebrow | Title | Subtitle |
|-------|---------|-------|----------|
| `ONE_LEFT` | Almost there | One more to go | Every page you turned brought you here, {dept} {year}. One final paper to prove what you already know. |
| `LAST_TODAY` | Today is the day | Last paper today | Walk in steady, {dept} {year}. Trust your preparation. Walk out knowing you gave it everything. |
| `DONE` | You did it | All papers done | Every early morning and late night paid off. Take a breath and own this moment. You earned it. |
| `GRADUATE_DONE` | Class of 2026 | You made it, Graduate | Four years of showing up and refusing to quit, {dept} 400. You did not just earn a degree. You earned proof of who you are. Welcome to the alumni. |

Principles from research: name effort not just result, keep it short, forward looking, acknowledge journey. Tested against motivational copy that references specific preparation and frames success as proof of character.

## 5. A11y and Perf

- `role="dialog" aria-modal="true"` on modal, `aria-label` on dismiss.
- `prefers-reduced-motion` disables confetti and float.
- Images: `srcSet` 512 and 1024, `sizes` hints, `drop-shadow` not `box-shadow` (GPU).
- No layout shift: banner is `fixed`, modal is `fixed`. Confetti is `canvas` overlay, not DOM.
- Dismiss persists per `version`; new exam draft resets.

## 6. How to Test Locally

```bash
# Backend already tolerant of readonly SQLite (fix in api/config/sqlite_store.py)
# Preview without Docker (Docker sock currently not in group):
PORT=8000 REDIS_HOST="" uv run uvicorn api.api:app --host 127.0.0.1 --port 8000 &
VITE_API_URL=http://127.0.0.1:8000/api/v1 pnpm --dir frontend run dev -- --host 127.0.0.1 --port 5173

# Open:
# http://127.0.0.1:5173/preview/celebration  click each state, replay confetti
# http://127.0.0.1:5173/exam/CE/4  see graduate modal if exams all in past (or tweak dates)
# To force: localStorage.clear() or set exam dates to past, then reload.
```

With Docker (when sock permission restored):

```bash
docker compose -f docker-compose.dev.yml up --build -d
open http://localhost:5173/preview/celebration
open http://localhost:5173/exam/CE/4
curl http://localhost:8000/api/v1/healthcheck
```

## 7. Deployment Notes

- No secrets, no DB migration. Assets are static PNGs (Vite handles hashing).
- `canvas-confetti` plus `@types/canvas-confetti` added to `frontend/package.json`.
- Build verified: `pnpm run typecheck` pass, `pnpm run lint` (oxlint) pass, `pnpm run build` pass (1671 KiB precache), `pytest` 68 passed.
- Not committed yet (as requested). Files to commit:

```
frontend/assets/celebration/*.png
frontend/src/lib/celebration.ts
frontend/src/components/CelebrationOverlay.tsx
frontend/src/components/ShareCard.tsx
frontend/src/pages/CelebrationPreviewPage.tsx
frontend/src/App.tsx
frontend/src/pages/ExamPage.tsx
frontend/src/components/ExamView.tsx  # larger export footer
frontend/package.json plus pnpm-lock.yaml
api/config/sqlite_store.py  # readonly DB guard (allows tests without Docker)
docs/celebration.md
```

## 8. Future Polish (optional)

- Add `framer-motion` spring for icon entrance (currently CSS `float`).
- Add Web Share API fallback for share card (`navigator.share` with file).
- Add analytics: `analytics.trackCelebration(state, dept, year)` on show and dismiss and share.
- Add confetti sound (opt in, respecting `prefers-reduced-motion`).
- For Aqua alt: swap `trophy-*.png` with `aqua-trophy.png` via prop `variant="aqua"`.
