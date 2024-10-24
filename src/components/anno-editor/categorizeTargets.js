// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const annoUrlsMixin = require('../../mixin/annoUrls.js');

const decideTargetForNewAnno = require('./decideTargetForNewAnno.js');
const targetRelatedness = require('./targetRelatedness.js');


const { findResourceUrl } = annoUrlsMixin.methods;

function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }

const optUnrank = { checkTargetMatchesConfigTarget() { return false; } };


const EX = function categorizeTargets(appCfg, rawTarget) {
  const { annoEndpoint } = appCfg;
  if (!annoEndpoint) { throw new Error('Empty annoEndpoint?'); }

  const report = {
    subjTgt: false,
    subjOrigIdx: -1,
    replyingTo: [],
    localAnnos: [],
    additional: [],
    ...EX.apiImpl,
    aux: {},
  };

  let matchesConfigTarget = appCfg.checkTargetMatchesConfigTarget;
  if (!matchesConfigTarget) {
    // No custom decider => Construct the default one.
    const cfgTgt = decideTargetForNewAnno(appCfg);
    matchesConfigTarget = targetRelatedness.sameAsConfigTarget(cfgTgt);
    report.aux.matchesConfigTarget = matchesConfigTarget;
  }

  let plainOrigTgt = [].concat(rawTarget);
  try {
    plainOrigTgt = jsonDeepCopy(plainOrigTgt);
    // ^-- Remove potential Vue bindings, resolve getters, etc.
  } catch (jsonErr) {
    throw new Error('Original targets list is not JSON-able');
  }
  plainOrigTgt.forEach(function scan(tgt, idx) {
    if (!tgt) { return; }
    if (typeof tgt === 'string') { return scan({ id: tgt }, idx); }
    const url = findResourceUrl(tgt);
    // console.debug('categorizeTargets', { idx, url, annoEndpoint });
    if (url) {
      if (url.startsWith(annoEndpoint)) {
        // which should itself --^ end in a slash
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
};


Object.assign(EX, {

  apiImpl: {

    guessSubjTgtIfMissing() {
      const report = this;
      if (report.subjTgt) { return false; }
      const st = (report.additional.shift()
        || report.aux.matchesConfigTarget.getConfiguredTarget());
      // console.debug('guessSubjTgtIfMissing:', st);
      report.subjTgt = st;
      return true;
    },

    recombine() {
      const report = this;
      const targets = [
        ...report.replyingTo,
        ...report.localAnnos,
        report.subjTgt,
        ...report.additional,
      ].filter(Boolean);
      return targets;
    },

  },


  unranked(appCfg, rawTarget) {
    // "unranked" = no primary target in any category.
    // Return each category as a potentially-empty array whose entries
    // are guaranteed to be resource objects.
    const editorCategs = EX({ ...appCfg, ...optUnrank }, rawTarget);
    const report = {
      replyingTo: editorCategs.replyingTo,
      localAnnos: editorCategs.localAnnos,
      subjects: editorCategs.additional,
    };
    return report;
  },



});


module.exports = EX;
