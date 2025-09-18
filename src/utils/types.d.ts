// Type declarations for utility functions

declare module './find' {
  function find(source: any, criteria: any, deep?: boolean): any;
  export default find;
}

declare module './objectToNode' {
  function objectToNode(tree: any, item: any): any;
  export default objectToNode;
}

declare module './stack' {
  export class List extends Array<any> {
    add(item: any): this;
    remove(item: any): this;
    empty(): this;
    top(): any;
  }
}

declare module './treeParser' {
  export class TreeParser {
    [key: string]: any;
  }
}

declare module './recurse' {
  export function recurseDown(source: any, fn: (node: any) => void): void;
}

declare module './request' {
  export function get(url: string): Promise<any>;
  export function createTemplate(template: string): (node: any) => string;
}

declare module './sort' {
  function sort(array: any[], compareFn?: (a: any, b: any) => number): any[];
  export default sort;
}

declare module './fetchDelay' {
  function fetchDelay(delay: number): Promise<void>;
  export default fetchDelay;
}

declare module './uuidV4' {
  function uuidV4(): string;
  export default uuidV4;
}