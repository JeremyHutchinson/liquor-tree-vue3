# Demo Site Refactor Design

**Date:** 2026-02-21
**Branch:** vue3-take3

## Problem

`demo/src/App.vue` is 1,396 lines containing all 11 demo tabs, their data, logic, and styles in a single file. This makes it hard to navigate, edit, or reason about any individual demo.

## Goal

Break the demo site into logical, maintainable components and move global/shared styles into `style.css`.

## File Structure

```
demo/src/
  App.vue                     ← shell: header + tab bar + dynamic tab routing (~50 lines)
  style.css                   ← global styles, CSS vars, shared utilities
  components/
    BasicTab.vue
    SelectionTab.vue
    CheckboxTab.vue
    FilterTab.vue
    SortingTab.vue
    KeyboardTab.vue
    EditingTab.vue
    DragDropTab.vue
    AsyncTab.vue
    CustomRenderingTab.vue
    EventsTab.vue
    shared/
      DemoSection.vue         ← h2 heading + optional subtitle wrapper
      InfoText.vue            ← blue left-bordered info paragraph
      StatusBox.vue           ← last-action status bar (Editing + DnD tabs)
      EventLog.vue            ← scrollable event log (Events tab)
```

## CSS Strategy

### `style.css` (global)
- CSS custom properties (`--color-primary`, `--color-accent`, etc.)
- Global reset: body margin, font, min-height
- App shell layout: `.app-container`, `.app-header`, `.tabs-container`, `.tabs`, `.tab`, `.tab-active`, `.tab-content`, `.demo-section`
- Shared utility classes used across multiple tabs: `.info-text`, `.filter-input`, `.clear-button`, `.sort-button`, `.keyboard-list`, `.editing-status`, `.dnd-status`

### Per-component `<style scoped>`
Each `.vue` keeps only styles that are unique to that component (e.g. EventsTab keeps `.events-container`, `.log-entry` color variants, etc.)

## Component Responsibilities

| Component | Data | Logic | Notes |
|-----------|------|-------|-------|
| `App.vue` | `tabs[]`, `activeTab` | tab switching | Shell only |
| `BasicTab.vue` | `basicData` | none | Static tree |
| `SelectionTab.vue` | `nestedData`, `multiSelectData` | none | Single + multi select |
| `CheckboxTab.vue` | `checkboxData` | none | Static tree |
| `FilterTab.vue` | `filterData` | `handleFilter`, `clearFilter` | Needs tree ref |
| `SortingTab.vue` | `sortData`, `originalSortData` | `sortAscending`, `sortDescending`, `resetSort` | Needs tree ref |
| `KeyboardTab.vue` | `nestedData` | none | Reuses same data shape |
| `EditingTab.vue` | `editingData` | `onMounted` event listener | Needs tree ref |
| `DragDropTab.vue` | `dndData` | `onDrop` callback | Reactive data |
| `AsyncTab.vue` | `asyncData`, `mockAsyncData` | `fetchData` | Options with async fn |
| `CustomRenderingTab.vue` | `customData1/2/3` | none | Slot-heavy template |
| `EventsTab.vue` | `eventsData` | `onMounted` listeners, `logEvent`, `clearEventLog` | Most complex |

## Shared Components

- **`DemoSection.vue`** — wraps a demo block with an `h2` title and optional subtitle slot
- **`InfoText.vue`** — renders the blue left-bordered info paragraph (`.info-text` style)
- **`StatusBox.vue`** — green/blue bordered status line showing last action text
- **`EventLog.vue`** — scrollable log panel with color-coded entries; accepts `modelValue` (entries array) and emits `clear`
