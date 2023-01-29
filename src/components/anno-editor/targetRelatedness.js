// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const sortedJson = require('safe-sortedjson');

const annoUrlsMixin = require('../../mixin/annoUrls.js');

const decideTargetForNewAnno = require('./decideTargetForNewAnno.js');


const { findResourceUrl } = annoUrlsMixin.methods;

function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }


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

  categorizeTargets(appCfg, origTgt) {
    const { annoEndpoint } = appCfg;
    if (!annoEndpoint) { throw new Error('Empty annoEndpoint?'); }

    const cfgTgt = decideTargetForNewAnno(appCfg);
    const matchesConfigTarget = EX.sameAsConfigTarget(cfgTgt);

    const report = {
      subjTgt: false,
      subjOrigIdx: -1,
      localAnnos: [],
      additional: [],
      ...EX.IMPL.categorizeTargetsApi,
      aux: {
        matchesConfigTarget,
      },
    };

    let plainOrigTgt = [].concat(origTgt);
    try {
      plainOrigTgt = jsonDeepCopy(plainOrigTgt);
    } catch (jsonErr) {
      throw new Error('Original targets list is not JSON-able');
    }
    plainOrigTgt.forEach(function scan(tgt, idx) {
      if (!tgt) { return; }
      const url = findResourceUrl(tgt);
      // console.debug('categorizeTargets', { idx, url, annoEndpoint });
      if (url) {
        if (url.startsWith(annoEndpoint)) {
          return report.localAnnos.push(tgt);
        }
      }
      if ((!report.subjTgt) && matchesConfigTarget(tgt)) {
        report.subjTgt = tgt;
        report.subjOrigIdx = idx;
        return;
      }
      report.additional.push(tgt);
    });
    return report;
  },

};


EX.IMPL = {

  categorizeTargetsApi: {

    guessSubjTgtIfMissing() {
      const report = this;
      if (report.subjTgt) { return false; }
      const st = report.aux.matchesConfigTarget.getConfiguredTarget();
      // console.debug('guessSubjTgtIfMissing:', st);
      report.subjTgt = st;
      return true;
    },

    recombine() {
      const report = this;
      const targets = [
        ...report.localAnnos,
        report.subjTgt,
        ...report.additional,
      ].filter(Boolean);
      return targets;
    },

  },

};


module.exports = EX;
