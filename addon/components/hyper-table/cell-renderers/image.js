import Component from '@glimmer/component';
import { get } from '@ember/object';

export default class ImageCellRenderer extends Component {
  get imageURL() {
    return get(this.args.item, this.args.column.key);
  }

  get initials() {
    return (
      (get(this.args.item, this.args.column.labels[0]) || '')
        .match(/\b[a-zA-Z]/g)
        ?.slice(0, 2)
        .join('')
        .toUpperCase() || ''
    );
  }
}
