// @ts-ignore
import Application from '../app';
// @ts-ignore
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
// @ts-ignore
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';

setup(QUnit.assert);

// @ts-ignore
setApplication(Application.create(config.APP));

setup(QUnit.assert);
QUnit.done(async function () {
  forceModulesToBeLoaded();
  await sendCoverage();
});

start();

declare module 'ember-test-helpers' {
  interface TestContext {
    [key: string]: any;
  }
}
