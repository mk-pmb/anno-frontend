// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const api22 = require('../../api22.js');


const EX = async function genericSimpleApiCall(how) {
  const {
    actionDescrVoc,
    apiCatch,
    apiData,
    apiVerb,
    confirmed,
    confirmVoc,
    filename,
    panel,
    refine,
  } = how;

  const { l10n } = panel;
  if (confirmVoc && (!confirmed)) {
    if (!window.confirm(l10n(confirmVoc))) { return; }
  }

  const spad = l10n(actionDescrVoc).replace(/<<filename>>/g, filename) + ' ';
  const { state } = panel.$store;
  const { statusMsg } = panel.$refs;
  statusMsg.setMsg('wait', l10n('generic_api_call_in_progress') + spad);
  try {
    const result = await api22(state).endpointRequest('draftStore',
      apiVerb, filename, apiData).then(refine).then(null, apiCatch);
    statusMsg.setMsg('ok', l10n('generic_api_call_success') + spad);
    panel.scheduleAutoRescanDraftsList();
    return result;
  } catch (apiFail) {
    statusMsg.setMsg('fail', l10n('generic_api_call_failed') + spad
      + ': ' + apiFail);
    throw apiFail;
  }

};


module.exports = EX;
