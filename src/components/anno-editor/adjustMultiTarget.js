// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const categorizeTargets = require('./categorizeTargets.js');

function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }



const EX = function adjustMultiTarget(appCfg, orig) {
  const report = categorizeTargets(appCfg, orig);
  let summary = '';
  if (report.subjOrigIdx > report.localAnnos.length) { summary = 'hoisted'; }
  if (!report.subjTgt) {
    if (!report.aux.matchesConfigTarget) {
      throw new Error('adjustMultiTarget: Target does not match config!');
    }
    report.subjTgt = report.aux.getConfigTargetUsedForComparison();
    if (!report.subjTgt) {
      throw new Error('adjustMultiTarget: Cannot generate default target!');
    }
    summary = 'added';
  }
  const updated = report.recombine();
  updated.primaryTargetAdjustHint = summary;
  console.debug('Anno-Editor: adjustMultiTarget:', { orig, report, summary });
  return jsonDeepCopy(
    // ^-- Protect the log message in the browser console from retroactive
    //     getter/setter proxification by vue.
    updated);
};


module.exports = EX;
