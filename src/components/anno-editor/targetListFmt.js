// -*- coding: utf-8, tab-width: 2 -*-

const arrayOfTruths = require('array-of-truths');
const isStr = require('is-string');

const guessPrimaryTargetUri = require('../../guessPrimaryTargetUri.js');

const {
  cwarn,
} = require('../../clog.js')('Anno-Viewer: targetsListFmt');


function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
// function ores(x) { return x || ''; }
function orf(x) { return x || false; }


const EX = {

  compileForTemplating(vueState, origAnno) {
    let anno = origAnno;
    let extra = anno;
    if (!anno) {
      anno = vueState.editing;
      if (!anno) { return false; }
      extra = orf(anno.extraFields);
    }
    const replyTo = arrayOfTruths(extra['as:inReplyTo']);

    let prevRec = false;
    let hadPrimary = false;

    function fmt(tgt, index) {
      if (isStr(tgt)) { return fmt({ id: tgt }, index); }
      const url = guessPrimaryTargetUri({ target: tgt }, vueState);
      const unconfirmed = tgt[':ANNO_FE:unconfirmed'];
      let tgtType = EX.getTypeSafe(vueState, replyTo, tgt, index, url);
      if (tgtType === 'primary') {
        if (hadPrimary) { tgtType = 'additional'; }
        hadPrimary = true;
      }
      const typeCls = [''].concat(arrayOfTruths([
        tgtType,
        (unconfirmed && 'unconfirmed'),
      ])).map(c => ('anno-target' + (c && '-') + c));
      const rec = {
        index,
        title: (tgt['dc:title'] || url),
        type: tgtType,
        typeCls,
        unconfirmed,
        url,
        sameTypeAsPrev: (prevRec.type === tgtType),
        sameTypeAsNext: false, // will be updated if there is a next entry.
      };
      if (prevRec) { prevRec.sameTypeAsNext = rec.sameTypeAsPrev; }
      prevRec = rec;
      return rec;
    }

    const input = jsonDeepCopy(arrayOfTruths(anno.target));
    // cdbg('compileTargetsListForTemplating <<', { replyTo, extra, input });
    const result = input.map(fmt);
    // cdbg('compileTargetsListForTemplating >>', jsonDeepCopy(result));
    return result;
  },


  getTypeSafe(vueState, replyTo, tgt, index, url) {
    const tt = tgt[':ANNO_FE:targetType'];
    if (tt === 'primary') { return tt; }
    if ((tt === 'anno') && replyTo.includes(url)) { return 'replyingTo'; }
    if ((url === vueState.targetSource) || (url === vueState.targetImage)) {
      const hints = { targetIdx: index, tt, expected: 'primary' };
      hints.id = (tgt.id || tgt);
      cwarn('compileTargetsListForTemplating: fixing:', hints);
      return 'primary';
    }
    return (tt || 'unknown');
  },


};


module.exports = EX;
