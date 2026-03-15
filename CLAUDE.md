# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Punk Archiving Toolkit is a single-page static website that curates guides, templates, and tools for building subcultural and community digital archives. It is a companion to the [East Bay Punk Digital Archive](https://eastbaypunkda.com), created by Stefano Morello.

## Architecture

**`index.html`** — The main toolkit page. Single HTML file with all CSS inline in a `<style>` block and a small `<script>` at the bottom (closes the mobile nav on link click). No build step, no package manager, no external dependencies beyond Google Fonts.

**`archives.html`** — Archives Directory. A searchable, filterable catalog of 100 punk archives worldwide. Same architecture: single HTML file, all CSS inline, all data embedded as a JS array. Linked from the toolkit nav ("More +" dropdown) and the Examples section callout.

Supporting files (reference material, not served on the site):
- `PSN 2026 Paper.docx` — Source paper describing EBP-DA methodology
- `Punk_Digital_Archive_Permission_Form.docx` — Original permission form (site links to a Google Drive copy)
- `Digital_Punk_Archives_Directory.xlsx` — Source spreadsheet for the archives directory
- `Untitled-1.md` — Working notes with resource links

## Development

```
python3 -m http.server 8000
```

A local server is required — font loading and anchor navigation work correctly over HTTP but not `file://`.

## Site Structure

Sections in page order: Nav → Hero → Principles (3 cards) → Step 1: Plan → Step 2: Permission → Step 3: Digitize → Step 4: Build → Step 5: Describe → Step 6: Oral History → Examples → Step 7: Go Further → Bibliography → Footer

Each section is marked with an HTML comment (e.g. `<!-- PLAN YOUR ARCHIVE -->`).

## Nav Behavior

- **Desktop**: 7 visible links + a "More +" hover dropdown containing Examples, Archives Directory, Go Further, Reading. The dropdown uses a `::before` pseudo-element on `.nav-dropdown` as an invisible hover bridge so the menu doesn't disappear while moving the mouse from the label to the menu.
- **Mobile (≤768px)**: CSS-only hamburger menu using a hidden checkbox toggle (`.nav-toggle`). The "More +" label is hidden; dropdown items appear flat via `display: block; position: static` (not `display: contents` — that has Safari click-handling bugs). The `::before` hover bridge is hidden at mobile. A small script unchecks the toggle when a link is clicked.

## Design System

- **Fonts**: Newsreader (display serif) + Work Sans (body sans-serif) via Google Fonts
- **Palette**: CSS custom properties on `:root` — off-white bg (`#faf8f5`), burnt orange accent (`#b45309`), warm stone text (`#1c1917`)
- **Max content width**: `--max-w: 44rem`

### Resource Tags

Colored labels on resource cards. All use CSS custom properties (`--tag-*`, `--tag-*-bg`):

`.tag-guide`, `.tag-template`, `.tag-tutorial`, `.tag-toolkit`, `.tag-schema`, `.tag-interview`, `.tag-code`, `.tag-zine`, `.tag-tool`, `.tag-archive`

The `.tag-archive` class (warm brown/sienna) is used for the Examples section entries. Do not use `.tag-toolkit` for archive entries.

## Content Patterns

### Resource Card (external links)

Used for items that link to an external URL:

```html
<div class="resource">
  <div class="resource-header">
    <p class="resource-title"><a href="URL" target="_blank" rel="noopener">Title</a></p>
    <span class="tag tag-guide">guide</span>
  </div>
  <p class="resource-desc">Description text.</p>
  <p class="resource-credit">By Author Name</p>  <!-- optional -->
</div>
```

### Callout (editorial guidance)

Used for inline advice and guidance that is not an external resource. Renders as a warm-tinted box with a left accent border, no tag:

```html
<div class="callout">
  <p class="callout-title">Title of the guidance</p>
  <p>Advice text. Links to external resources can be inline.</p>
</div>
```

Callouts live inside `.resources` containers alongside resource cards. Do not bold link text inside callouts — the link color is sufficient.

## Accessibility

- **Skip link**: First child of `<body>`, targets `#plan`, visually hidden until focused
- **Hamburger**: `aria-label="Toggle navigation menu"` on the checkbox input
- **Focus states**: `:focus-visible` styles on all links (accent outline), nav elements (with background highlight), and `.download-btn`

## Meta & SEO

- OpenGraph tags (`og:title`, `og:description`, `og:type`, `og:url`) and `twitter:card` in `<head>`
- Inline SVG favicon (file folder emoji, no external file)
- `<meta name="description">` matches `og:description`

## Print Styles

`@media print` hides nav and tags, flattens callout backgrounds, and appends URLs after resource title links.

## Footer

Contains attribution, methodology interview link, and CC BY-SA 4.0 license statement.

## Archives Directory (`archives.html`)

### Data Model

Each archive entry is a JS object in the `ARCHIVES` array with these fields:

```javascript
{
  title: "Archive Name",           // required — display name
  url: "https://...",              // required — external link
  scene: "City, State/Country",    // optional — geographic/cultural scene covered
  years: "1980s–1990s",           // optional — date range of materials (not founding date)
  inst: "University Name",         // optional — hosting institution
  description: "...",              // required — what it contains
  cats: ["zines","flyers","scene"] // required — one or more category keys
}
```

Fields `scene`, `years`, and `inst` are displayed on cards as a metadata line separated by middots (·). Only fields with values are shown.

**Title/institution convention**: Don't duplicate the institution name in the title if it's already in `inst`. E.g., use `title:"Riot Grrrl Collection"` + `inst:"Cornell University"`, not `title:"Cornell — Riot Grrrl Collection"`. Exception: when the institution name *is* the archive name (e.g., "Barnard College Zine Library").

### Categories

Six content-based categories, each mapped to an existing tag class:

| Key | Label | Tag Class |
|-----|-------|-----------|
| `zines` | Zines | `.tag-zine` (magenta) |
| `flyers` | Flyers | `.tag-template` (burnt orange) |
| `music` | Music | `.tag-tutorial` (blue) |
| `scene` | Scene | `.tag-guide` (green) |
| `oral-history` | Oral History | `.tag-interview` (pink-red) |
| `physical` | Physical | `.tag-archive` (warm brown) |

Entries can have multiple categories (`cats` is an array). Filter buttons use OR logic within categories, AND with search text.

### Card Layout

Title (linked) + tags → metadata line (scene · years · institution) → description → visit link. Cards render via `createCard()` using `document.createElement` (no innerHTML). Responsive grid: 3 columns → 2 at 960px → 1 at 600px.

### Editing Archive Data

The `ARCHIVES` array is large (~114 entries, sorted alphabetically by title). For bulk edits, write new data to a temp file and use Python string slicing to replace the array in-place (not `re.sub` — the data contains `\u` escapes that break regex replacement templates). After adding or removing entries, re-sort and update counts in: meta descriptions, subtitle, results counter (all in `archives.html`), and the Examples callout in `index.html`.

## Hosting

Designed for GitHub Pages. Enable Pages from the root of the default branch. No configuration needed — the site is `index.html` and `archives.html`.
