// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const sortedJson = require('safe-sortedjson');


function jsonifyTarget(tgt) {
  try {
    return sortedJson(tgt, null, 2);
  } catch (err) {
    console.error('jsonifyTarget failed:', err, tgt);
    throw err;
  }
}


const EX = {

  sameAsConfigTarget(cfgTgt, oneshotTgt) {
    const ctJson = jsonifyTarget(cfgTgt);

    function cmpCore(annoTgt, atJson) {
      if (atJson === ctJson) { return 'exact match'; }
      function propMatch(prop) {
        const av = annoTgt[prop];
        if ((av === cfgTgt) || (av === cfgTgt[prop])) { return prop; }
        return false;
      }
      return propMatch('scope') || propMatch('source');
    }

    const cmp = function matchesConfigTarget(annoTgt) {
      const atJson = jsonifyTarget(annoTgt);
      const r = cmpCore(annoTgt, atJson);
      // console.debug('matchesConfigTarget', { annoTgt, cfgTgt, r });
      return r;
    };

    if (oneshotTgt) { return cmp(oneshotTgt); }
    Object.assign(cmp, {
      getConfiguredTarget() { return cfgTgt; },
    });
    return cmp;
  },


};


module.exports = EX;
