// Temporary TypeScript stub for TreeRoot component
// This is a placeholder for Phase 1 to allow the build to work
// Will be replaced with proper Vue 3 composition API in Phase 3

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LiquorTree',
  props: {
    data: Array,
    options: {
      type: Object,
      default: () => ({})
    },
    filter: String,
    tag: {
      type: String,
      default: 'div'
    }
  },
  setup() {
    return {
      // Placeholder - will be implemented in Phase 3
    };
  },
  template: `
    <div class="tree">
      <div class="tree-placeholder">
        LiquorTree - Vue 3 migration in progress
      </div>
    </div>
  `
});