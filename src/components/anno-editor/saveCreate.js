// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');

const api22 = require('../../api22.js');
const eventBus = require('../../event-bus.js');

const validateEditorFields = require('./validateEditorFields.js');


const EX = async function saveCreate(editor) {
  const anno = editor.getCleanAnno();
  EX.neverSubmitFields.forEach(k => delete anno[k]);
  const { state, commit, dispatch } = editor.$store;

  // window.relaEd = editor.$refs.relationLinkEditor;
  Object.assign(anno, EX.parseCustomToplevelAttributes(anno,
    editor.$refs.relationLinkEditor.customToplevelAttributes));

  if (state.authorIdentityOmitToPreserve) {
    if (editor.checkPreserveAuthorIdentity()) { delete anno.creator; }
  }

  if (!validateEditorFields(editor, anno)) { return; }

  const { l10n } = editor;
  // console.debug('Annotation about to be POSTed:', anno);
  if (!window.confirm(l10n('confirm_publish'))) { return; }
  console.debug('Confirmed. Gonna POST.');

  let saveResp;
  try {
    saveResp = await api22(state).aepPost('anno/', anno);
  } catch (saveFailed) {
    console.error('saveCreate API fail:', saveFailed);
    // window.errSaveFailed = saveFailed;
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



Object.assign(EX, {

  neverSubmitFields: [
    'as:deleted',
    'collection', // <- non-standard legacy prop used by ancient anno-fe
    'created',
    'dc:dateAccepted',
    'doi',
    'iana:latest-version',
    'iana:version-history',
    'iana:working-copy',
    'replyTo',
    'ubhd:aclPreviewBySubjectTargetUrl',
  ],

  parseCustomToplevelAttributes(anno, ctaText) {
    const ctaDict = {};
    let key;
    ctaText.split(/\n/).forEach(function each(origLn) {
      const parts = origLn.trim().split(/^([\w:\-]*)\s*=\s*/);
      if (parts[1]) { key = parts[1]; }
      const val = (parts[0] + (parts[2] || '')).trim();
      if (!val) { return; }
      if (!key) { return; }
      const old = getOwn(ctaDict, key) || '';
      ctaDict[key] = (old && []).concat(old, val);
    });
    return ctaDict;
  },

});


module.exports = EX;
