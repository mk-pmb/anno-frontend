// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const isStr = require('is-string');

const annoUrlsMixin = require('../../mixin/annoUrls.js');
const guessPrimaryTargetUri = require('../../guessPrimaryTargetUri.js');

const decideTargetForNewAnno = require('./decideTargetForNewAnno.js');
const targetRelatedness = require('./targetRelatedness.js');


const { findResourceUrl } = annoUrlsMixin.methods;

function arrayIfAny(x) { return x && [].concat(x); }
function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function orf(x) { return x || false; }

const optUnrank = { checkTargetMatchesConfigTarget() { return false; } };


const EX = function categorizeTargets(appCfg, rawTarget, origOpt) {
  const opt = orf(origOpt);
  const { annoEndpoint } = appCfg;
  if (!annoEndpoint) { throw new Error('Empty annoEndpoint?'); }

  const report = {
    subjTgt: false,
    subjOrigIdx: -1,
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
  const omitByUrl = arrayIfAny(opt.omitByUrl);
  plainOrigTgt.forEach(function scan(tgt, idx) {
    if (!tgt) { return; }
    if (typeof tgt === 'string') { return scan({ id: tgt }, idx); }
    const url = findResourceUrl(tgt);
    if (omitByUrl && omitByUrl.includes(url)) { return; }
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
  report.subjTgtUrl = (function detect() {
    const annoStub = { target: report.subjTgt };
    const u = guessPrimaryTargetUri(annoStub, appCfg);
    if (u === annoStub) { return ''; }
    return u || '';
  }());
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

    recombine(origOpt) {
      const opt = { ...origOpt };
      const report = this;
      const targets = [];
      let curType;

      function addTgt(origTgt) {
        if (!origTgt) { return; }
        let tgt = origTgt;
        if (isStr(tgt)) { tgt = { id: tgt }; }
        if (opt.addTypeHints) { tgt[':ANNO_FE:targetType'] = curType; }
        targets.push(tgt);
      }

      curType = 'anno';
      report.localAnnos.forEach(addTgt);
      curType = 'primary';
      addTgt(report.subjTgt);
      curType = 'additional';
      report.additional.forEach(addTgt);
      return targets;
    },

  },


  unranked(appCfg, rawTarget) {
    // "unranked" = no primary target in any category.
    // Return each category as a potentially-empty array whose entries
    // are guaranteed to be resource objects.
    const editorCategs = EX({ ...appCfg, ...optUnrank }, rawTarget);
    const report = {
      localAnnos: editorCategs.localAnnos,
      subjects: editorCategs.additional,
    };
    return report;
  },



});


module.exports = EX;
