﻿/* -*- tab-width: 2 -*- */
'use strict';

const getOwn = require('getown');

const mixins = [
  /* eslint-disable global-require */

  require('./configureTargetAndComposeAnnotation.js'),
  require('./highlightByTargetSelector.js'),
  require('./importAnnosFromCeson.js'),
  require('./updateEditorTarget.js'),

  /* eslint-enable global-require */
];

const EX = async function externalRequest(annoApp, action, ...args) {
  const impl = getOwn(EX, 'do' + action);
  if (!impl) { throw new Error('Unsupported action: ' + action); }
  async function proxy(store) {
    const ctx = { annoApp, store, action, args };
    return impl.call(ctx, store, ...args);
  }
  return annoApp.$store.dispatch('runInjectedFunc', proxy);
};


Object.assign(EX, ...mixins);


module.exports = EX;
