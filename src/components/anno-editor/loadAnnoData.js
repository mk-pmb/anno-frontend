// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const arrayOfTruths = require('array-of-truths');
const objPop = require('objpop');

const editorModelDef = require('../../vuex/module/editing.js');

const adjustMultiTarget = require('./adjustMultiTarget.js');
const legacyFieldsMustAgree = require('./legacyFieldsMustAgree.js');


function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function keys2str(x) { return String(Object.keys(x).sort()); }

function wrapNonObj(x, k, u) {
  if (x === undefined) { return u; }
  if (typeof x === 'object') { return x; }
  return { [k]: x };
}

const expectedModelKeys = keys2str(editorModelDef.state);


const EX = async function loadAnnoData(origAnno) {
  const editor = this;
  const { commit, state } = editor.$store;
  const anno = jsonDeepCopy(origAnno);
  const popField = objPop.d(anno);
  function popStr(k) { return String(popField(k) || ''); }

  const target = adjustMultiTarget(state, popField('target'));
  const tgtAdj = target.primaryTargetAdjustHint;

  const replyTo = '';
  // :TODO: replyTo: Detect here or remove globally.

  const title = (legacyFieldsMustAgree(popField, String, 'dc:title title')
    || '').replace(/\s+/g, ' ').trim();

  const creator = wrapNonObj(popField('creator') || {}, 'id' /* Agent ID */);
  editor.initialAuthorAgent = jsonDeepCopy(creator);

  const editorFields = {
    doi: legacyFieldsMustAgree(popField, String, 'dc:identifier doi') || '',
    title,
    creator,
    target,
    replyTo,
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

  const { l10n } = editor;
  editor.$refs.targetAdjustedMsg.setMsg(null,
    (tgtAdj && l10n('target_adjusted_' + tgtAdj)));

  editor.sanitizeHtmlNow();
  editor.redisplayZoneEditorSvg();
  editor.reloadAnnoHtml();
};


module.exports = EX;
