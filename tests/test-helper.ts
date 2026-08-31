import { setApplication } from '@ember/test-helpers';

import registerAssertions from '@upfluence/oss-components/test-support/register-assertions';
import Application from 'dummy/app';
import config from 'dummy/config/environment';
// @ts-expect-error - required due to legacy typing missing type definitions
import { forceModulesToBeLoaded, sendCoverage } from 'ember-cli-code-coverage/test-support';
import { start } from 'ember-qunit';
import QUnit from 'qunit';
import { setup } from 'qunit-dom';

setup(QUnit.assert);
registerAssertions(QUnit.assert);

QUnit.done(async function () {
  forceModulesToBeLoaded();
  await sendCoverage();
});

setApplication(Application.create(config.APP));
start();

declare module '@ember/test-helpers' {
  interface TestContext {
    [key: string]: any;
  }
}
