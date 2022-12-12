// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const sortedJson = require('safe-sortedjson');

const eventBus = require('../../event-bus.js');

const decideMainTarget = require('../anno-editor/decideTargetForNewAnno.js');
const genericSimpleApiCall = require('./genericSimpleApiCall.js');


function jsonifyTarget(tgt) {
  return sortedJson(tgt, null, 2);
}


const EX = async function downloadAndRestoreDraft(meta) {
  const panel = this;
  const draftData = await genericSimpleApiCall({
    panel,
    actionDescrVoc: 'edit_draft_labeled',
    vocSlots: meta,
    apiVerb: 'GET',
    ...meta,
  });

  const store = panel.$store;
  const mainTarget = decideMainTarget(store.state);

  const mtJson = jsonifyTarget(mainTarget);
  const draftTargets = [].concat(draftData.target);
  let cmpReport = 'Editor config target: ' + mtJson;

  function sameness(drTgt, dtJson) {
    if (dtJson === mtJson) { return 'exact match'; }
    if (drTgt.scope === mainTarget) { return 'scope matches'; }
    if (drTgt.source === mainTarget) { return 'source matches'; }
    return 'unrelated';
  }

  draftTargets.forEach(function cmp(drTgt, idx) {
    const dtJson = jsonifyTarget(drTgt);
    cmpReport += ('\n\nDraft target ' + idx + ': '
      + sameness(drTgt, dtJson) + ': ' + dtJson);
  });
  setTimeout(() => window.alert(cmpReport), 5);

  await store.commit('RESET_ANNOTATION');
  await store.commit('INJECTED_MUTATION', [
    function upd(state) { Object.assign(state.editing, draftData); }
  ]);
  eventBus.$emit('switchEditorTabByRefName', 'commentTextTab');
};


module.exports = EX;
