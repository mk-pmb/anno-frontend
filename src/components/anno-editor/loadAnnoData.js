// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const assert = require('assert');

const objPop = require('objpop');

const editorModelDef = require('../../vuex/module/editing.js');

const adjustMultiTarget = require('./adjustMultiTarget.js');
const legacyFieldsMustAgree = require('./legacyFieldsMustAgree.js');


function arrayOfTruths(...x) { return [].concat(...x).filter(Boolean); }
function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function keys2str(x) { return String(Object.keys(x).sort()); }

const expectedModelKeys = keys2str(editorModelDef.state);


const EX = async function loadAnnoData(origAnno) {
  const editor = this;
  const { commit, state } = editor.$store;
  const anno = jsonDeepCopy(origAnno);
  const popField = objPop.d(anno);

  const target = adjustMultiTarget(state, popField('target'));
  const tgtAdj = target.primaryTargetAdjustHint;

  const replyTo = '';
  // :TODO: replyTo: Detect here or remove globally.

  const editorFields = {
    doi: legacyFieldsMustAgree(popField, String, 'dc:identifier doi'),
    title: legacyFieldsMustAgree(popField, String, 'dc:title title'),
    target,
    replyTo,
    body: arrayOfTruths(popField('body')),
    rights: '',
  };

  function copyStr(k) { editorFields[k] = String(popField(k) || ''); }
  copyStr('id');
  copyStr('rights');

  console.debug('loadAnnoData: editorFields:', editorFields, 'extra:', anno);
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
  assert.strictEqual(keys2str(model), expectedModelKeys);

  commit('RESET_ANNOTATION');
  commit('FLAT_UPDATE_EDITOR_ANNO', model);

  const { l10n } = editor;
  editor.$refs.targetAdjustedMsg.setMsg(null,
    (tgtAdj && l10n('target_adjusted_' + tgtAdj)));

  editor.redisplayZoneEditorSvg();
};


module.exports = EX;
