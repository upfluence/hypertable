import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

export default class Application extends Route {
  @service declare intl: IntlService;

  beforeModel() {
    this.intl.setLocale('en-us');
  }
}
