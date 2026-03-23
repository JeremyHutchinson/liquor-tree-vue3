# Developer Documentation Design

**Date:** 2026-02-21
**Scope:** Public-facing feature documentation for library consumers integrating liquor-tree-vue3 into Vue 3 applications

## Goals

- Document all 11 features demonstrated in the demo app
- Provide copy-pasteable Vue 3 code examples grounded in actual demo code
- Give a complete options reference and events reference per feature
- Create a discoverable index so new users can orient themselves quickly

## Audience

Library consumers: developers integrating liquor-tree into their own Vue 3 apps.

## File Structure

```
docs/
  README.md              # Navigation hub: feature table + links + getting started
  basic.md               # Data format, expand/collapse, initial state
  selection.md           # Single and multi-select (Ctrl+click, Shift+click)
  checkboxes.md          # Checkbox mode, autoCheckChildren, indeterminate state
  filter.md              # tree.filter() / tree.clearFilter(), FilterOptions
  sorting.md             # tree.sort(comparator, deep)
  keyboard.md            # Keyboard navigation keys and behavior
  editing.md             # Inline node text editing (double-click, F2, Escape)
  drag-drop.md           # Drag and drop, DragAndDropOptions, placement callbacks
  async.md               # fetchData option, isBatch nodes, loading state
  custom-rendering.md    # Scoped slot #default, node object API
  events.md              # Full events reference, tree.$on() pattern
```

The root `README.md` gets an updated `docs/` link replacing the stale Storybook reference.

## Per-Feature Content Template

Each file contains these sections (scaled to complexity):

1. **Title + description** — 2–3 sentences: what it does, when to use it
2. **Basic Usage** — Minimal `<script setup>` + `<template>` working example
3. **Options table** — `| Option | Type | Default | Description |`
4. **Events table** — `| Event | Payload | Description |` (only events relevant to the feature)
5. **Advanced Example** — Where applicable: edge cases, combining options, tree ref usage

## Content Source

All code examples are derived from the actual demo tab components:

| Doc file             | Source demo tab               |
|----------------------|-------------------------------|
| basic.md             | BasicTab.vue                  |
| selection.md         | SelectionTab.vue              |
| checkboxes.md        | CheckboxTab.vue               |
| filter.md            | FilterTab.vue                 |
| sorting.md           | SortingTab.vue                |
| keyboard.md          | KeyboardTab.vue               |
| editing.md           | EditingTab.vue                |
| drag-drop.md         | DragDropTab.vue               |
| async.md             | AsyncTab.vue                  |
| custom-rendering.md  | CustomRenderingTab.vue        |
| events.md            | EventsTab.vue                 |

Types are sourced from `src/types/index.ts`.

## Out of Scope

- Internal architecture documentation (covered by CLAUDE.md)
- Migration guide from Vue 2 (separate concern)
- A full generated API site (out of scope for this iteration)
