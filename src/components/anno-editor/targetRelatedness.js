// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const isStr = require('is-string');


const EX = {

  urlProps: ['id', 'scope', 'source'],

  sameAsConfigTarget(cfgTgt, oneshotTgt) {
    if (isStr(cfgTgt)) {
      return EX.sameAsConfigTarget({ id: cfgTgt }, oneshotTgt);
    }
    // const tr = 'Anno-Editor: matchesConfigTarget:';
    const cfgUrls = EX.urlProps.map(k => cfgTgt[k]).filter(Boolean);
    // console.debug(tr, 'cfgUrls:', cfgUrls); }
    const cmp = function matchesConfigTarget(annoTgt) {
      if (isStr(annoTgt)) { return cmp({ id: annoTgt }); }
      const annoUrls = EX.urlProps.map(k => annoTgt[k]).filter(Boolean);
      const matches = annoUrls.some(u => cfgUrls.includes(u));
      // if (!matches) { console.debug(tr, 'nope:', annoUrls, annoTgt); }
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
