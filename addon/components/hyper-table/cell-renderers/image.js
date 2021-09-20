import Component from '@glimmer/component';
import { get } from '@ember/object';

export default class ImageCellRenderer extends Component {
  get imageURL() {
    return get(this.args.item, this.args.column.key);
  }
}
