// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const EX = function fixupVeryBrokenAnnos(origAnnos) {
  let annos = origAnnos.filter(Boolean);
  const missingIdBase = 'about:noid/@' + Date.now() + '/';
  annos = annos.map(function fix(origAnno, idx) {
    return {
      id: missingIdBase + idx,
      ...origAnno,
    };
  });
  return annos;
};


module.exports = EX;
