# Liquor Tree

A Vue tree component that allows you to present hierarchically organized data in a nice and logical manner.

## Features
* drag&drop
* mobile friendly
* events for every action
* flexible configuration
* any number of instances per page
* multi selection
* keyboard navigation
* filtering
* sorting
* integration with Vuex

## Installation
**Npm:**

```shell
$ npm install liquor-tree
```

**Yarn:**

```shell
$ yarn add liquor-tree
```

## Documentation

Full feature documentation lives in the [`docs/`](./docs/README.md) folder:

- [Basic Tree](./docs/basic.md)
- [Selection](./docs/selection.md)
- [Checkboxes](./docs/checkboxes.md)
- [Filter & Search](./docs/filter.md)
- [Sorting](./docs/sorting.md)
- [Keyboard Navigation](./docs/keyboard.md)
- [Inline Editing](./docs/editing.md)
- [Drag & Drop](./docs/drag-drop.md)
- [Async Data](./docs/async.md)
- [Custom Rendering](./docs/custom-rendering.md)
- [Events](./docs/events.md)

## Live Demo

Run the interactive demo locally:

```bash
git clone <repo-url>
cd liquor-tree-vue3
npm install
npm run dev  # opens at http://localhost:8081
```

## Usage

```vue
<template>
  <LiquorTree :data="items" :options="options" />
</template>

<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData, TreeOptions } from 'liquor-tree'

const items: TreeNodeData[] = [
  { text: 'Item 1' },
  { text: 'Item 2' },
  { text: 'Item 3', children: [
    { text: 'Item 3.1' },
    { text: 'Item 3.2' }
  ]}
]

const options: TreeOptions = {
  checkbox: true
}
</script>
```

## Development

Check out the `package.json`s script section. There are 2 scripts:

- `npm run dev` - opens the interactive demo in the browser at http://localhost:8081
- `npm run build` - creates a module file in `production` mode


## License

[MIT](https://opensource.org/licenses/MIT)
