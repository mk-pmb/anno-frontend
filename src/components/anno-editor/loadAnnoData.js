// -*- coding: utf-8, tab-width: 2 -*-
'use strict';


const decideTargetForNewAnno = require('./decideTargetForNewAnno.js');
const targetRelatedness = require('./targetRelatedness.js');


function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }


const EX = function loadAnnoData(origAnno) {
  const editor = this;
  const { commit, state } = editor.$store;
  const anno = jsonDeepCopy(origAnno);
  const cfgTgt = decideTargetForNewAnno(state);
  anno.target = EX.adjustMultiTarget(cfgTgt, anno.target);
  const tgtAdj = anno.target.primaryTargetAdjustHint;
  commit('RESET_ANNOTATION');
  commit('REPLACE_ANNOTATION', anno);

  const { l10n } = editor;
  editor.$refs.targetAdjustedMsg.setMsg(null,
    (tgtAdj && l10n('target_adjusted_' + tgtAdj)));

  editor.redisplayZoneEditorSvg();
};


Object.assign(EX, {

  adjustMultiTarget(appCfg, origTgt) {
    let primary;
    let adjusted = '';
    const matchesConfigTarget = targetRelatedness.sameAsConfigTarget(appCfg);

    function isAdditionalTarget(tgt, idx) {
      if (!tgt) { return false; }
      if (primary) { return true; }
      if (matchesConfigTarget(tgt)) {
        primary = tgt;
        if (idx !== 0) { adjusted = 'hoisted'; }
        return false;
      }
      return true;
    }
    const additional = [].concat(origTgt).filter(isAdditionalTarget);

    if (!primary) {
      primary = matchesConfigTarget.getConfiguredTarget();
      adjusted = 'added';
    }
    const targets = [primary, ...additional];
    targets.primaryTargetAdjustHint = adjusted;
    return targets;
  },

});


module.exports = EX;
