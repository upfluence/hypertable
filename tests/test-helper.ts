// @ts-ignore
import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

// @ts-ignore
setApplication(Application.create(config.APP));

start();

declare module 'ember-test-helpers' {
  interface TestContext {
    [key: string]: any;
  }
}
