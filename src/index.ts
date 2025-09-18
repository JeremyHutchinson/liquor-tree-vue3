// Main entry point for liquor-tree library
// Phase 2: Core classes with TypeScript + mitt event system

export * from './types';
export * from './core';

// Placeholder component export - will be updated in Phase 3
// For now, we'll create a minimal stub to allow the build to work
export { default as LiquorTree } from './components/TreeRoot';

// Library version
export const version = '1.0.0';
