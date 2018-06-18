import test from 'ava';

import beautifier from './src/beautifier.js';
import loadConfig from './src/load-config.js';
import log from './src/log.js';

/* beautifier.js */
test('0.123KB', t => { t.is(beautifier.bytes(123), '0.123KB'); });
test('123.5KB', t => { t.is(beautifier.bytes(123456), '123.5KB'); });
test('123.5MB', t => { t.is(beautifier.bytes(123456789), '123.5MB'); });

test('123ms', t => { t.is(beautifier.time(123), '123ms'); });
test('123.5s', t => { t.is(beautifier.time(123456), '123.5s'); });

/* load-config.js */

test('Normal config', t => {
  const result = loadConfig('fixtures/normal-config.json');
  t.is(result.success, true);
});

test('Unexistent config file', t => {
  const result = loadConfig('_unexistent.json');
  t.is(result.success, false);
});

test('Invalid json file', t => {
  const result = loadConfig('fixtures/invalid-json.json');
  t.is(result.success, false);
});

test('Invalid extension config file', t => {
  const result = loadConfig('fixtures/invalid-ext.css');
  t.is(result.success, false);
});

/* log.js */

test('Set log level', t => {
  log.setLevel(2);
  t.is(log.getLevel(), 2);
});

test('Set negative level', t => {
  log.setLevel(-1);
  t.is(log.getLevel(), 0);
});
