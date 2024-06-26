// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const getOwn = require('getown');

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
    silent,
  } = how;

  const { l10n } = panel;
  if (confirmVoc && (!confirmed)) {
    if (!window.confirm(l10n(confirmVoc))) { return; }
  }

  function vocSlot(m, k) { return getOwn(vocSlot.s, k, '?' + m + '?'); }
  vocSlot.s = {
    filename,
    ...(how.vocSlots || false),
  };
  const spad = (' ' + l10n(actionDescrVoc).replace(/@@(\w+)@@/g, vocSlot));
  const { state } = panel.$store;
  const setMsg = (silent ? Boolean : panel.editorApi.setStatusMsg);
  setMsg('wait', l10n('generic_api_call_in_progress') + spad);
  try {
    const result = await api22(state).endpointRequest('draftStore',
      apiVerb, filename, apiData).then(refine).then(null, apiCatch);
    setMsg('ok', l10n('generic_api_call_success') + spad);
    return result;
  } catch (apiFail) {
    setMsg('fail', l10n('generic_api_call_failed') + spad + ': ' + apiFail);
    throw apiFail;
  }
};


module.exports = EX;
