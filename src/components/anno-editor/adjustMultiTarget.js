// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const isStr = require('is-string');
const loMapValues = require('lodash.mapvalues');

const categorizeTargets = require('./categorizeTargets.js');
const decideTargetForNewAnno = require('./decideTargetForNewAnno.js');

function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }


// const dbgp = console.debug.bind(console, 'Anno-Editor: adjustMultiTarget:');
const dbgp = false;



const EX = function adjustMultiTarget(appCfg, orig) {
  const report = categorizeTargets(appCfg, orig);
  const oldSubjTgt = (report.subjTgt || false);
  const summary = (function summarize() {
    if (report.subjOrigIdx > report.localAnnos.length) { return 'hoisted'; }
    if (oldSubjTgt) { return ''; }
    /* Both of the above imply that matchesConfigTarget() said yes.
      This means the draft has a target equal to the editor's config,
      but still its metadata may be outdated. Thus, let's replace it
      with what the config currently says. */
    /* At this point, i.e. when report.subjTgt is false-y, we will
      replace this false-y value with what the config currently says
      should be our target. */
    return 'added';
  }());

  // As described above, all potential cases have the same conclusion:
  // We should replace the old subjTgt, but preserve metadata for which
  // we have no update, and the selector of course.
  report.subjTgt = (function preserve() {
    let st = decideTargetForNewAnno(appCfg);
    if (isStr(st)) { st = { id: st }; }
    loMapValues(oldSubjTgt, function maybeCopy(v, k) {
      if (k === 'id') { return; }
      if (st[k] === undefined) { st[k] = v; }
    });
    if (st.scope === st.id) { delete st.id; }
    if (st.source === st.id) { delete st.id; }
    if (st.id && (st.scope || st.source)) {
      console.warn('W: Adjusted target has'
        + ' an ID different from both scope and source:', st);
    }
    return st;
  }());

  const updated = report.recombine({ addTypeHints: true });
  updated.primaryTargetAdjustHint = summary;

  if (dbgp) { dbgp(jsonDeepCopy({ orig, report, summary })); } /*
    jsonDeepCopy: Protect the log message in the browser console
    from retroactive getter/setter proxification by vue. */

  return updated;
};


module.exports = EX;
