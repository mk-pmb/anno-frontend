// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const api22 = require('../../api22.js');
const eventBus = require('../../event-bus.js');

const validateEditorFields = require('./validateEditorFields.js');


const EX = async function saveCreate(editor) {
  const anno = editor.getCleanAnno();
  EX.neverSubmitFields.forEach(k => delete anno[k]);
  if (!validateEditorFields(editor, anno)) { return; }

  const { l10n } = editor;
  if (!window.confirm(l10n('confirm_publish'))) { return; }

  const { state, commit, dispatch } = editor.$store;
  console.debug('POSTing annotation:', anno);
  let saveResp;
  try {
    saveResp = await api22(state).aepPost('anno/', anno);
  } catch (saveFailed) {
    console.error('saveCreate API fail:', saveFailed);
    window.errSaveFailed = saveFailed;
    window.alert(l10n('error:') + '\n' + saveFailed);
    return;
  }
  console.info('saveCreate API success:', saveResp);
  commit('RESET_ANNOTATION');
  eventBus.$emit('close-editor');

  // In theory, since the new API 'should' return the effective annotation
  // representation, we could just add that to the list.
  // However, the legacy frontend instead just reloads the annotations list,
  // so let's continue that behavior for now.
  dispatch('fetchAnnoList');
};


EX.neverSubmitFields = [
  'as:deleted',
  'collection', // <- non-standard legacy prop used by ancient anno-fe
  'created',
  'dc:dateAccepted',
  'doi',
  'iana:latest-version',
  'iana:version-history',
  'iana:working-copy',
  'replyTo',
];


module.exports = EX;
