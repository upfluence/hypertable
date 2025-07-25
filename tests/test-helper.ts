// @ts-ignore
import Application from '../app';
// @ts-ignore
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';
import { setup } from 'qunit-dom';
// @ts-ignore
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';
import registerAssertions from '@upfluence/oss-components/test-support/register-assertions';

setup(QUnit.assert);
registerAssertions(QUnit.assert);

QUnit.done(async function () {
  forceModulesToBeLoaded();
  await sendCoverage();
});

// @ts-ignore
setApplication(Application.create(config.APP));
start();

declare module '@ember/test-helpers' {
  interface TestContext {
    [key: string]: any;
  }
}
