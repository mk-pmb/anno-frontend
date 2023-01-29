// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const adjustMultiTarget = require('./adjustMultiTarget.js');


function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }


const EX = async function loadAnnoData(origAnno) {
  const editor = this;
  const { commit, state } = editor.$store;
  const anno = jsonDeepCopy(origAnno);

  anno.target = adjustMultiTarget(state, anno.target);
  const tgtAdj = anno.target.primaryTargetAdjustHint;
  commit('RESET_ANNOTATION');
  commit('REPLACE_ANNOTATION', anno);

  const { l10n } = editor;
  editor.$refs.targetAdjustedMsg.setMsg(null,
    (tgtAdj && l10n('target_adjusted_' + tgtAdj)));

  editor.redisplayZoneEditorSvg();
};


module.exports = EX;
