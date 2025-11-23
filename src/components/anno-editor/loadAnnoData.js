// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const arrayOfTruths = require('array-of-truths');
const objPop = require('objpop');
const unpackSingleProp = require('unwrap-single-prop').default

const editorModelDef = require('../../vuex/module/editing.js');

const adjustMultiTarget = require('./adjustMultiTarget.js');
const fixupReplyMode = require('./fixupReplyMode.js');
const legacyFieldsMustAgree = require('./legacyFieldsMustAgree.js');


function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function keys2str(x) { return String(Object.keys(x).sort()); }

function wrapNonObj(x, k, u) {
  if (x === undefined) { return u; }
  if (typeof x === 'object') { return x; }
  return { [k]: x };
}

const expectedModelKeys = keys2str(editorModelDef.state);

const dummyHtml = ('<h2>Placeholder</h2>'
  + '<p><b>Error:</b> Use the HTML editor API instead!</p>');


const EX = async function loadAnnoData(origAnno) {
  const editor = this;
  const { l10n } = editor;
  const { commit, state } = editor.$store;

  const anno = jsonDeepCopy(origAnno);
  const draftReply = unpackSingleProp(0, anno['as:inReplyTo']);
  if (draftReply) { anno['as:inReplyTo'] = draftReply; }
  anno.target = adjustMultiTarget(state, anno.target, {
    omitByUrl: draftReply,
  });
  const primTgtAdj = anno.target.primaryTargetAdjustHint;

  function enforceTLF(k, v) { if (v) { anno[k] = v; } else { delete anno[k]; } }
  enforceTLF('dc:replaces', state.editEnforceReplaces);
  enforceTLF('dc:isVersionOf', state.editEnforceVersionOf);
  fixupReplyMode(state, anno); // ATTN: modifies the anno inplace!

  const popField = objPop.d(anno); /* <- can only be used safely after
    we're done with all in-place modifications, like fixupReplyMode. */
  function popStr(k) { return String(popField(k) || ''); }

  const title = (legacyFieldsMustAgree(popField, String, 'dc:title title')
    || '').replace(/\s+/g, ' ').trim();

  const creator = wrapNonObj(popField('creator') || {}, 'id' /* Agent ID */);
  editor.initialAuthorAgent = jsonDeepCopy(creator);

  // Snatch the HTML before we pop the bodies off the anno:
  const firstHtmlBody = editorModelDef.getters.firstHtmlBody(anno);
  let html = String((firstHtmlBody || false).value
    || popField('html') // <-- proprietary debug fallback for easier testing
    || '').trim();
  if (!html.startsWith('<')) { html = '<p>' + html + '</p>'; }
  if (firstHtmlBody) { firstHtmlBody.value = dummyHtml; }

  const editorFields = {
    doi: legacyFieldsMustAgree(popField, String, 'dc:identifier doi') || '',
    title,
    creator,
    target: popField('target'),
    versionOf: popStr('dc:isVersionOf'),
    body: arrayOfTruths(popField('body')),
    rights: '',
  };

  function copyStr(k) { editorFields[k] = popStr(k); }
  copyStr('id');
  copyStr('rights');
  copyStr('created');

  (function detectLanguage() {
    /* not-a-bug-230902-001:
      I tried making the language a regular property of editorFields, but
      that way it would be updated with strange delays, like changes taking
      effect only after you click "Discard", and then persisting after the
      discard. We also cannot directly use tbe `dc:language` property of
      `$store.state.editing.extraFields` b/c the latter is null initially.
      */
    const selected = popStr('dc:language');
    const langsInConfig = state.annoLanguageOptions;
    const isConfigured = langsInConfig.some(l => (l.bcp47 === selected));
    const keepOrigExtra = (isConfigured ? '' : selected);
    editor.annoLanguage = { keepOrigExtra, selected };
  }());

  // console.debug('loadAnnoData: editorFields:', editorFields, 'extra:', anno);
  const model = {
    ...editorFields,
    /*
      Originally, we tried using the anno itself as the vue model.
      It caused lots of trouble with data binding and exotic side effects.
      Most of the trouble stems from the fact that Vue cannot deal with
      assignments to propertries that have not been declared in the model.
      Thus, starting late January of 2023, we banish those into the
      extraFields property.
    */
    extraFields: anno, // = whatever is left over = not popField()ed
  };
  if (keys2str(model) !== expectedModelKeys) {
    throw new Error('Anno data key list differs from model');
  }

  commit('RESET_ANNOTATION');
  commit('FLAT_UPDATE_EDITOR_ANNO', model);

  function setMsgBoxOrAlert(box, msg) {
    if (box) { return box.setMsg(null, msg || ''); }
    if (msg) { window.alert(msg); }
  }
  const silentMultiTargetAdd = ((primTgtAdj === 'added')
    && state.userMustConfirmAdditionalSubjectTargets);
  setMsgBoxOrAlert(editor.$refs.targetAdjustedMsg, primTgtAdj
    && (!silentMultiTargetAdd)
    && l10n('target_adjusted_' + primTgtAdj));

  editor.$refs.htmlBodyEditor.setUserHtml(html);
  editor.updatePreview();
  editor.redisplayZoneEditorSvg();
};


module.exports = EX;
