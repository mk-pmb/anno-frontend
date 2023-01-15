// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const targetRelatedness = require('./targetRelatedness.js');


const EX = function adjustMultiTarget(appCfg, origTgt) {
  const report = targetRelatedness.categorizeTargets(appCfg, origTgt);
  let adjusted = '';
  if (report.subjOrigIdx > report.localAnnos.length) { adjusted = 'hoisted'; }
  if (report.guessSubjTgtIfMissing()) { adjusted = 'added'; }
  const targets = report.recombine();
  targets.primaryTargetAdjustHint = adjusted;
  return targets;
};


module.exports = EX;
