// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const api22 = require('../../api22.js');
const eventBus = require('../../event-bus.js');


const EX = async function downloadAndRestoreDraft(meta) {
  const { filename } = meta;
  const panel = this;
  const { statusMsg } = panel.$refs;
  // const { l10n } = panel;
  statusMsg.setMsg({ text: '⏳ ' + filename });

  const store = panel.$store;
  let draftData;
  try {
    draftData = await api22(store.state).endpointRequest('draftStore',
      'GET', filename);
  } catch (apiFail) {
    console.debug(EX.name, { apiFail });
    statusMsg.setMsg({ severity: 'fail', text: '❌ ' + apiFail });
    return;
  }

  await store.commit('RESET_ANNOTATION');
  await store.commit('INJECTED_MUTATION', [
    function upd(state) { Object.assign(state.editing, draftData); }
  ]);
  eventBus.$emit('switchEditorTabByRefName', 'commentTextTab');
};


module.exports = EX;
