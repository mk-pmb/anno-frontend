// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');

const api22 = require('../../api22.js');
const eventBus = require('../../event-bus.js');

const neverSubmitFields = require('./neverSubmitFields.js');
const validateEditorFields = require('./validateEditorFields.js');


const EX = async function saveCreate(editor) {
  const anno = editor.getCleanAnno();
  neverSubmitFields.forEach(k => delete anno[k]);
  const { state, commit, dispatch } = editor.$store;
  const cTrace = 'Anno-Frontend: saveCreate:';

  // window.relaEd = editor.$refs.relationLinkEditor;
  Object.assign(anno, EX.parseCustomToplevelAttributes(anno,
    editor.$refs.relationLinkEditor.customToplevelAttributes));

  if (state.authorIdentityOmitToPreserve) {
    if (editor.checkPreserveAuthorIdentity()) { delete anno.creator; }
  }

  if (!validateEditorFields(editor, anno)) { return; }

  const { l10n } = editor;
  console.debug(cTrace, 'Annotation about to be submitted:', anno);
  // console.debug(cTrace, '  ^-- keys:', Object.keys(anno).sort().join(', '));
  const confirmSend = l10n('confirm_publish');
  if (confirmSend) {
    if (!window.confirm(confirmSend)) { return; }
  }

  let saveResp;
  try {
    const saveImpl = (state.customSaveCreateApiFunc
      || EX.defaultSaveCreateApiFunc);
    saveResp = await saveImpl(anno, state);
  } catch (saveFailed) {
    console.error(cTrace, 'API fail:', saveFailed);
    // window.errSaveFailed = saveFailed;
    window.alert(l10n('error:') + '\n' + saveFailed);
    return;
  }
  console.info(cTrace, 'API success:', saveResp);
  commit('RESET_ANNOTATION');
  eventBus.$emit('close-editor');

  // In theory, since the new API 'should' return the effective annotation
  // representation, we could just add that to the list.
  // However, the legacy frontend instead just reloads the annotations list,
  // so let's continue that behavior for now.
  dispatch('fetchAnnoList');
};



Object.assign(EX, {

  defaultSaveCreateApiFunc(anno, appCfg) {
    return api22(appCfg).aepPost('anno/', anno);
  },

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
