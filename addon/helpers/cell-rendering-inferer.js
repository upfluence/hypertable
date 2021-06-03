import { helper } from '@ember/component/helper';

const AVAILABLE_RENDERERS = [
  'text', 'numeric', 'money', 'date', 'image', 'list', 'link'
];

export function cellRenderingInferer(params/*, hash*/) {
  let [ column ] = params;

  if (column.renderingComponent) {
    return column.renderingComponent;
  } else if (AVAILABLE_RENDERERS.includes(column.type)) {
    return `hyper-table/cell-renderers/${column.type}`;
  } else {
    return `hyper-table/cell-renderers/text`;
  }
}

export default helper(cellRenderingInferer);
