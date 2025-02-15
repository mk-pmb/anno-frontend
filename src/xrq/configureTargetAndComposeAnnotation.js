﻿/* -*- tab-width: 2 -*- */
'use strict';

const checkAclAuth = require('../checkAclAuth.js');
const eventBus = require('../event-bus.js');


const hasOwn = Function.call.bind(Object.prototype.hasOwnProperty);


async function composeAnno(store, origParam) {
  const { state, commit } = store;
  const param = { ...origParam };

  const authMode = param.authorized;
  /* ^-- How to deal with potentially lacking authorization.
      `expect` (default): Throw an error if the user doesn't have permission.
      `silent`: Open the compose dialog only if we have permission.
      `check`: Return whether (boolean) the user currently has permission.
      `ignore`: Open the compose dialog anyway.
  */
  delete param.authorized;

  const updCfg = {
    targetFragment: null,
    targetImage: null,
  };
  Object.keys(param).forEach(function copy(key) {
    if (hasOwn(updCfg, key)) {
      updCfg[key] = param[key];
    } else {
      throw new Error('Unsupported target option: ' + key);
    }
  });

  const authAccept = checkAclAuth(state, 'create');
  if (authMode === 'check') { return Boolean(authAccept); }
  if (!authAccept) {
    if (authMode === 'silent') { return false; }
    if (authMode !== 'ignore') {
      throw new Error('AnnoApp lacks permission to compose this annotation.');
    }
  }

  if (state.editMode) {
    const err = new Error('Editor busy');
    err.name = 'ANNO_EDITOR_BUSY';
    throw err;
  }

  commit('FLAT_UPDATE_APP_STATE', updCfg);
  eventBus.$emit('create');
}


module.exports = {
  doConfigureTargetAndComposeAnnotation: composeAnno,
};
