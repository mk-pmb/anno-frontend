// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const isStr = require('is-string');


const EX = {

  urlProps: ['id', 'scope', 'source'],

  sameAsConfigTarget(cfgTgt, oneshotTgt) {
    if (isStr(cfgTgt)) {
      return EX.sameAsConfigTarget({ id: cfgTgt }, oneshotTgt);
    }
    // const tr = 'Anno-Editor: matchesConfigTarget';
    const cmp = function matchesConfigTarget(annoTgt) {
      if (isStr(annoTgt)) { return cmp({ id: annoTgt }); }
      let matches = false;
      // console.debug(tr + '? anno:', annoTgt, 'cfg:', cfgTgt);
      EX.urlProps.forEach((annoKey) => {
        if (matches) { return; }
        const annoVal = annoTgt[annoKey];
        if (!annoVal) { return; }
        EX.urlProps.forEach((cfgKey) => {
          if (matches) { return; }
          const cfgVal = cfgTgt[cfgKey];
          if (!cfgVal) { return; }
          if (cfgVal === annoVal) {
            // console.debug(tr + '!', { annoKey, cfgKey, annoVal, cfgVal });
            matches = true;
          }
        });
      });
      // if (!matches) { console.debug(tr + ': Nope.'); }
      return matches;
    };

    if (oneshotTgt) { return cmp(oneshotTgt); }
    Object.assign(cmp, {
      getConfiguredTarget() { return cfgTgt; },
    });
    return cmp;
  },


};


module.exports = EX;
