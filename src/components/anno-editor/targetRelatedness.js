// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const sortedJson = require('safe-sortedjson');


function jsonifyTarget(tgt) {
  return sortedJson(tgt, null, 2);
}


const EX = {

  sameAsConfigTarget(cfgTgt, oneshotTgt) {
    const ctJson = jsonifyTarget(cfgTgt);
    const cmp = function matchesConfigTarget(annoTgt) {
      const atJson = jsonifyTarget(annoTgt);
      if (atJson === ctJson) { return 'exact match'; }
      if (annoTgt.scope === ctJson) { return 'scope matches'; }
      if (annoTgt.source === ctJson) { return 'source matches'; }
      return false;
    };
    if (oneshotTgt) { return cmp(oneshotTgt); }
    return cmp;
  },

};


module.exports = EX;
