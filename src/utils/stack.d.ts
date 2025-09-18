export class List extends Array<any> {
  add(item: any): this;
  remove(item: any): this;
  empty(): this;
  top(): any;
}