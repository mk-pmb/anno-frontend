// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const eventBus = require('../../event-bus.js');

const genericSimpleApiCall = require('./genericSimpleApiCall.js');


const EX = async function downloadAndRestoreDraft(meta) {
  const panel = this;
  const draftData = await genericSimpleApiCall({
    panel,
    actionDescrVoc: 'edit_draft_labeled',
    vocSlots: meta,
    apiVerb: 'GET',
    ...meta,
  });

  await panel.editorApi.loadAnnoData(draftData);
  eventBus.$emit('switchEditorTabByRefName', 'commentTextTab');
};


module.exports = EX;
