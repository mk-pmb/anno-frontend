// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const eventBus = require('../../event-bus.js');
const { neverSubmitFields } = require('../anno-editor/saveCreate.js');

const genericSimpleApiCall = require('./genericSimpleApiCall.js');

function ores(x) { return x || ''; }


const EX = async function downloadAndRestoreDraft(meta) {
  // see also: eventBus.$on('loadDraftFile', …) in index.js
  const panel = this;
  const draftData = await genericSimpleApiCall({
    panel,
    actionDescrVoc: 'edit_draft_labeled',
    vocSlots: meta,
    apiVerb: 'GET',
    ...meta,
  });

  const { state } = panel.$store;
  const hints = [];

  if (ores(draftData['as:inReplyTo']) !== ores(state.editEnforceReplying)) {
    hints.push(panel.l10n('draft_reply_target_differs'));
  }

  EX.neverRestoreFields.forEach(k => delete draftData[k]);
  // console.debug('Anno-Editor: downloadAndRestoreDraft:', draftData);

  await panel.editorApi.loadAnnoData(draftData);
  eventBus.$emit('switchEditorTabByRefName', 'preview');
  if (hints.length) { window.alert('• ' + hints.join('• ')); }
};


EX.neverRestoreFields = [
  ...neverSubmitFields,
  'dc:replaces',
];


module.exports = EX;
