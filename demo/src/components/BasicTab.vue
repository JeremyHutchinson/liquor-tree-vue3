<template>
  <div class="demo-section">
    <h2>Basic Tree Example</h2>
    <p class="info-text">Simple tree with expand/collapse functionality.</p>
    <TreeRoot :data="basicData" />
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData } from '../../../src/types'

const basicData: TreeNodeData[] = [
  {
    text: 'Design System',
    state: { expanded: true },
    children: [
      {
        text: 'Components',
        state: { expanded: true },
        children: [
          {
            text: 'Inputs',
            children: [
              { text: 'Button' },
              { text: 'Text Field' },
              { text: 'Checkbox' },
              { text: 'Radio' }
            ]
          },
          {
            text: 'Layout',
            children: [
              { text: 'Grid' },
              { text: 'Stack' },
              { text: 'Divider' }
            ]
          },
          {
            text: 'Feedback',
            children: [
              { text: 'Alert' },
              { text: 'Toast' },
              { text: 'Progress' }
            ]
          }
        ]
      },
      {
        text: 'Tokens',
        children: [
          { text: 'Colors' },
          { text: 'Typography' },
          { text: 'Spacing' },
          { text: 'Shadows' }
        ]
      },
      {
        text: 'Guidelines',
        children: [
          { text: 'Accessibility' },
          { text: 'Motion' },
          { text: 'Writing' }
        ]
      }
    ]
  },
  {
    text: 'Platform',
    children: [
      {
        text: 'Web',
        children: [
          { text: 'React' },
          { text: 'Vue' },
          { text: 'Angular' }
        ]
      },
      {
        text: 'Mobile',
        children: [
          { text: 'iOS' },
          { text: 'Android' }
        ]
      }
    ]
  }
]
</script>
