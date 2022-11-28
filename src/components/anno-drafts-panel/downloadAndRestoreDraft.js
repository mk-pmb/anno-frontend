// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const api22 = require('../../api22.js');
const eventBus = require('../../event-bus.js');


const EX = async function downloadAndRestoreDraft(fileName) {
  const panel = this;
  const { statusMsg } = panel.$refs;
  // const { l10n } = panel;
  statusMsg.setMsg({ text: '⏳ ' + fileName });

  let draftData;
  try {
    draftData = await api22(panel.$store.state).endpointRequest('draftStore',
      'GET', fileName);
  } catch (apiFail) {
    console.debug(EX.name, { apiFail });
    statusMsg.setMsg({ severity: 'fail', text: '❌ ' + apiFail });
    return;
  }

  await panel.$store.commit('INJECTED_MUTATION', [
    function upd(state) { state.editing = draftData; }
  ]);
  eventBus.$emit('switchEditorTabByRefName', 'commentTextTab');
};


module.exports = EX;
