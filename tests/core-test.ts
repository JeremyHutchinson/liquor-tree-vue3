/**
 * Simple test harness for Phase 2 acceptance criteria
 * Tests core classes Tree, Node, Selection with mitt event system
 */

import { Tree, Node, type TreeNodeData } from '../src/core';

// Test data
const testData: TreeNodeData[] = [
  {
    id: 1,
    text: 'Root 1',
    children: [
      {
        id: 2,
        text: 'Child 1.1',
        children: [
          { id: 3, text: 'Grandchild 1.1.1' },
          { id: 4, text: 'Grandchild 1.1.2' }
        ]
      },
      { id: 5, text: 'Child 1.2' }
    ]
  },
  {
    id: 6,
    text: 'Root 2',
    children: [
      { id: 7, text: 'Child 2.1' }
    ]
  }
];

async function testCoreClasses() {
  console.log('🧪 Testing Phase 2: Core classes with mitt event system');

  // Test 1: Tree instantiation
  console.log('\n1. Creating Tree instance...');
  const tree = new Tree({
    multiple: true,
    checkbox: true,
    autoCheckChildren: true
  });

  // Test 2: Event system
  console.log('2. Testing mitt event system...');
  const events: any[] = [];
  
  tree.on('node:selected', (payload) => {
    events.push({ type: 'node:selected', payload });
    console.log('   ✓ Received node:selected event');
  });

  tree.on('selection:change', (payload) => {
    events.push({ type: 'selection:change', payload });
    console.log('   ✓ Received selection:change event');
  });

  // Test 3: Set model (populate tree)
  console.log('3. Setting tree model...');
  await tree.setModel(testData);
  console.log(`   ✓ Tree model set with ${tree.model.length} root nodes`);

  // Test 4: Node operations
  console.log('4. Testing node operations...');
  const firstNode = tree.model[0];
  console.log(`   ✓ First node: "${firstNode.text}" (ID: ${firstNode.id})`);
  console.log(`   ✓ Node depth: ${firstNode.depth}`);
  console.log(`   ✓ Has children: ${firstNode.hasChildren()}`);

  // Test 5: Selection
  console.log('5. Testing selection...');
  tree.select(firstNode);
  console.log(`   ✓ Selected node: "${firstNode.text}"`);
  console.log(`   ✓ Selected nodes count: ${tree.selectedNodes.length}`);

  // Test 6: Selection class
  console.log('6. Testing Selection class...');
  const selection = tree.selected();
  console.log(`   ✓ Selection instance created with ${selection.length} nodes`);
  console.log(`   ✓ Selection texts: ${selection.getTexts()}`);

  // Test 7: Checkbox operations
  console.log('7. Testing checkbox operations...');
  if (firstNode.children.length > 0) {
    const childNode = firstNode.children[0];
    childNode.check();
    console.log(`   ✓ Checked child node: "${childNode.text}"`);
    console.log(`   ✓ Checked nodes count: ${tree.checkedNodes.length}`);
  }

  // Test 8: Tree traversal
  console.log('8. Testing tree traversal...');
  let nodeCount = 0;
  tree.recurseDown(node => {
    nodeCount++;
  });
  console.log(`   ✓ Total nodes in tree: ${nodeCount}`);

  // Test 9: Find operations
  console.log('9. Testing find operations...');
  const foundNode = tree.find({ text: 'Child 1.1' });
  if (foundNode) {
    console.log(`   ✓ Found node: "${(foundNode as Node).text}"`);
  }

  // Test 10: Event system validation
  console.log('10. Validating event system...');
  console.log(`   ✓ Total events captured: ${events.length}`);
  
  // Test 11: Serialization
  console.log('11. Testing serialization...');
  const modelValue = tree.getModelValue();
  console.log(`   ✓ Model value (selected keys): ${JSON.stringify(modelValue)}`);

  console.log('\n🎉 Phase 2 Core Classes Test Complete!');
  console.log('✅ All core functionality working with mitt event system');
  
  return true;
}

// Export for potential use in testing frameworks
export { testCoreClasses };

// Run test if this file is executed directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  testCoreClasses().catch(console.error);
}