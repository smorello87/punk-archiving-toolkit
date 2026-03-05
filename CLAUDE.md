# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Punk Archiving Toolkit is a single-page static website that curates guides, templates, and tools for building subcultural and community digital archives. It is a companion to the [East Bay Punk Digital Archive](https://eastbaypunkda.com), created by Stefano Morello.

## Architecture

**`index.html`** — The entire site. Single HTML file with all CSS inline in a `<style>` block and a small `<script>` at the bottom (closes the mobile nav on link click). No build step, no package manager, no external dependencies beyond Google Fonts.

Supporting files (reference material, not served on the site):
- `PSN 2026 Paper.docx` — Source paper describing EBP-DA methodology
- `Punk_Digital_Archive_Permission_Form.docx` — Original permission form (site links to a Google Drive copy)
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

- **Desktop**: 7 visible links + a "More +" hover dropdown containing Examples, Go Further, Reading
- **Mobile (≤768px)**: CSS-only hamburger menu using a hidden checkbox toggle (`.nav-toggle`). The "More +" label is hidden; all links appear flat. A small script unchecks the toggle when a link is clicked.

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

## Hosting

Designed for GitHub Pages. Enable Pages from the root of the default branch. No configuration needed — the site is a single `index.html`.
