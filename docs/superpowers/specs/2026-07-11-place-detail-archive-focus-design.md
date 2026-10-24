# Place Detail Archive Focus Redesign

## Goal

Migrate the public place detail route from MUI to shadcn/Tailwind as an intentional redesign: a personal archive of the owner's publications about a place, not a place review and not a user-generated content surface.

## Product Position

- The page helps visitors open the owner's existing materials from Dzen, Telegram, and Instagram.
- Visitors cannot create, submit, or share materials through the public UI.
- The place supplies context only: title, category, cover, and material count.
- `summary` and `tags` remain in the frontend model but are not rendered on the redesigned detail page.
- Materials keep using same-origin backend `redirectUrl` links; direct external URLs are never exposed.

## Visual Direction

Use the approved **Archive Spine × Focus Mode** composition:

1. A dark archive spine identifies the place and contains platform navigation.
2. A warm, cardless index contains the complete material list.
3. A sticky Focus Stage uses the place cover as atmosphere and previews the currently focused material with large typography.

The route owns its redesign tokens so the catalog and remaining MUI pages do not change in this slice:

- ink: `#101211`;
- archive surface: `#151816`;
- paper: `#f0ece4`;
- muted ink: `#81786b`;
- brass accent: `#b99a64`;
- focus ring: `#8e7041`.

Do not use platform brand colors as the page palette. Platform identity comes from names, monochrome icons, ordering, and counts.

### Typography

- Use `Literata` 500/600 for the visible place title, Focus Stage title, platform headings, and archive numbering.
- Use `Manrope` 400/500/600/700 for navigation, material rows, dates, metadata, and state copy.
- Load both through `next/font/google`; production must use the self-hosted build output, not runtime Google Fonts requests.
- Scope the font variables to the place-detail surface. Keep the existing Roboto wiring for legacy pages during the MUI bridge.
- The vertical spine title is decorative and `aria-hidden`; the normal horizontal `h1` remains the semantic page title.

## Information Architecture

### Desktop, `1024px` and wider

- Archive spine: fixed-width left column with decorative place title, total count, and platform anchors.
- Material index: independently scrollable center column with a pinned row followed by platform sections.
- Focus Stage: sticky right column using the single place cover image and typographic preview content.

### Below `1024px`

- Replace the vertical spine with a compact page header and horizontal sticky platform navigation.
- Hide the dynamic Focus Stage.
- Render the same material index at full width; a row opens its redirect with one tap.
- Do not introduce a two-tap preview interaction on touch devices.

### Platform navigation

- Render only platforms that have at least one normalized material.
- Use normal same-page anchors such as `href="#platform-telegram"`.
- Keep every platform section in server HTML; navigation scrolls instead of filtering or replacing content.
- After hydration, IntersectionObserver updates the active marker and `aria-current="location"`.
- Platform order stays `dzen`, `telegram`, `instagram`.

## Material Ordering and Pinned Behavior

- Normalize each platform list in the entity mapper.
- Deduplicate by material `id`.
- If the pinned material is missing from its platform response, inject it before sorting.
- Sort materials by `publishedAt` descending, then by `id` ascending for a deterministic tie-breaker.
- Render the pinned material once as the first highlighted row of the complete index and exclude that id from its regular platform rows.
- Platform and total counts come from the normalized arrays, including the pinned material.
- Number regular rows from `01` within each platform. The pinned row uses the archive marker `00` instead of participating in platform numbering.

## Focus Stage Behavior

- The Focus Stage is a visual preview, not a second link or button.
- Mark duplicated preview content as decorative for assistive technology; the material row is the only actionable element.
- Initial preview:
  1. pinned material, when present;
  2. otherwise the first available material in platform order;
  3. otherwise the place-level empty state.
- Pointer hover and keyboard focus temporarily preview the corresponding material.
- When pointer/focus leaves the index, return to the initial preview.
- Scrolling alone never changes the material preview; it only changes the active platform marker.
- The place cover remains constant while preview title, platform, type, date, and duration crossfade.

## Link and State Contracts

- Available material: render one full-row anchor with `target="_blank"` and `rel="noopener noreferrer"`.
- Unavailable material: keep the row visible, render no anchor, and show `Недоступно`.
- Pinned material without `redirectUrl`: keep the pinned row and default preview but provide no action.
- Missing cover: use the existing deterministic local placeholder.
- Empty platform: omit it from navigation and from the index.
- No materials at all: replace the archive/index experience with one page-level empty state; do not render empty navigation or Focus Stage.
- Long titles: allow two lines in index rows and up to four lines on Focus Stage without overlapping metadata.

## Server and Client Boundaries

- Keep route loading and `PlaceDetailModel` assembly server-side.
- Render the page title, spine, anchors, section headings, rows, redirect hrefs, initial preview, and all state copy in the initial server response.
- Use no client-side data fetch.
- Pass only serializable preview records and platform ids/counts across client boundaries.
- Keep material rows as server-rendered children inside a small interaction boundary that uses delegated pointer/focus events.
- Use a client navigation island for IntersectionObserver-driven `aria-current` and the moving active marker.
- Use Motion only inside client islands; do not convert the entity mapper, route, or material index into client components.

Without JavaScript, platform anchors, external links, reading order, pinned row, and default preview remain functional. Only scrollspy and dynamic Focus Stage updates are absent.

## Motion

- Focus Stage crossfade: opacity plus `translateY`, approximately `280–380ms`.
- Active platform marker: restrained position/height transition, approximately `300ms`.
- Material hover/focus: paper-tone line/surface reveal plus a `4px` arrow translation, approximately `200–320ms`.
- Cover entrance: one clip/opacity reveal on initial page display; no continuous parallax.
- Animate only opacity and transforms to avoid layout shift.
- Respect `prefers-reduced-motion`; reduced motion removes entrance and transform animation and uses immediate state changes.
- Do not add Lenis, WebGL, scroll hijacking, or decorative platform-color animation.

## Accessibility

- Preserve one semantic `main`, one `h1`, platform `h2` headings, and valid list/link structure.
- Every material row must have a visible keyboard focus state that does not rely on color alone.
- Hover behavior must have an equivalent focus behavior.
- Focus Stage must not create duplicate tab stops or duplicate screen-reader announcements.
- Active platform uses both the brass marker and `aria-current="location"`.
- Unavailable rows are plain non-interactive content, not disabled anchors.
- Mobile tap targets are at least `44px` high.

## Implementation Scope

- Migrate the complete `widgets/place-detail` UI slice away from MUI.
- Migrate `PlaceCategoryBadge` to the shared shadcn/Tailwind badge contract because the detail route consumes it; update its catalog consumer without redesigning the catalog.
- Add only the shadcn primitives needed by this slice, through the CLI.
- Add Motion for the two client enhancements.
- Update the MUI-to-shadcn migration plan to record this approved redesign exception and completed slice.

## Non-goals

- Redesigning the home catalog or place cards.
- Removing the MUI/Emotion providers or packages.
- Adding material thumbnails, excerpts, reactions, public authors, or submission flows.
- Changing backend DTOs or redirect behavior.
- Adding client filtering, search, pagination, or a unified chronological feed to place detail.
- Redesigning global navigation or the application brand in the same pull request.

## Acceptance and Verification

- Mapper tests cover deterministic sorting, pinned injection, deduplication, counts, and empty platforms.
- Server-rendered tests cover semantic headings, platform anchors, available/unavailable rows, safe redirect links, pinned/no-pinned behavior, and empty state.
- Interaction coverage verifies scrollspy, pointer preview, keyboard preview, reset to initial preview, and reduced-motion behavior.
- Visual checks cover `1440px`, `1024px`, and `390px` with:
  - pinned and no pinned material;
  - cover and placeholder;
  - unavailable link;
  - long title;
  - one empty platform;
  - no materials.
- While the MUI bridge remains active, smoke-check the home catalog on desktop and mobile after the new route-scoped fonts and tokens are loaded.
- Run focused tests, TypeScript, strict lint, full unit tests, build, Prettier check, and `git diff --check` before merge.
