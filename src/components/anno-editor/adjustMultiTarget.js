// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const targetRelatedness = require('./targetRelatedness.js');


const EX = function adjustMultiTarget(appCfg, origTgt) {
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
};


module.exports = EX;
