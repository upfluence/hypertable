// Types for compiled templates
declare module '@upfluence/hypertable/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module 'ember-data-factory-guy' {
  function build(...args: any[]): any;
  function buildList(...args: any[]): any;
  function make(...args: any[]): any;
  function makeList(...args: any[]): any;
  function mock(...args: any[]): any;
  function mockFindRecord(...args: any[]): any;
  function mockFindAll(...args: any[]): any;
  function mockCreate(...args: any[]): any;
  function mockUpdate(...args: any[]): any;
  function mockQuery(...args: any[]): any;
  function getPretender(...args: any[]): any;
  function setupFactoryGuy(...args: any[]): any;
}
