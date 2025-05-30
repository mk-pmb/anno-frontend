// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const { minusPartKeys } = require('./hash.js');


function omitSuffix(orig, suf) {
  return ((suf && orig.endsWith(suf)) ? orig.slice(0, -suf.length) : orig);
}


const EX = function parseDraftFileName(fileName) {
  if (!fileName.endsWith(EX.draftFilenameSuffix)) { return false; }
  const m = EX.draftFilenameRgx.exec(fileName);
  if (!m) { return false; }
  if (m[0] !== fileName) { return false; }
  const meta = { fileName };
  const minusPartValues = m[1].split(/\-/);
  minusPartKeys.forEach((k, i) => { meta[k] = (minusPartValues[i] || ''); });
  meta.customNamePart = omitSuffix(m[2], EX.draftFilenameSuffix);
  (function dateFmt() {
    const t = meta.time;
    const d = meta.date;
    meta.humanDate = d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6);
    meta.humanTime = t.slice(0, 2) + ':' + t.slice(2, 4);
  }());
  return meta;
};


Object.assign(EX, {

  draftFilenameSuffix: '.json',

  draftFilenameRgx: new RegExp('^((?:\\w+\\-){'
    + minusPartKeys.length + '})(\\S+)$'),

});


module.exports = EX;
