// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const api22 = require('../../api22.js');
const eventBus = require('../../event-bus.js');


const EX = {};
const vueMtd = {};


function validateVersionNumber(trace, verNum) {
  if (verNum === 0) { return; }
  function bad(m) { throw new Error(trace + ': Bad version number: ' + m); }
  const t = String(verNum && typeof verNum);
  if (t !== 'number') { bad('expected number, got ' + t); }
  if (verNum < 1) { bad('must be greater or equal to 1'); }
}


Object.assign(vueMtd, {

  lookupVerInfo(wantVerNum) {
    validateVersionNumber('lookupVerInfo', wantVerNum);
    const kn = this.knownVersions;
    if (!kn) { return false; }
    // First, try a fast lookup assuming the versions list has no gaps:
    const noGap = kn[wantVerNum - 1];
    if (noGap && (noGap.verNum === wantVerNum)) { return noGap; }
    // If that failed, we have to search:
    const found = kn.find(r => (r.verNum === wantVerNum));
    return (found || false);
  },


  lookupCachedVerAnno(verNum) {
    const cmpVueElem = this;
    const rInfo = cmpVueElem.lookupVerInfo(verNum);
    if (!rInfo) { return false; }
    if (rInfo.fetchedAt) { return rInfo; }

    const now = Date.now();
    const apiSubUrl = 'anno/' + cmpVueElem.baseId + '~' + verNum;
    const earliest = (+rInfo.fetchRetryNotBefore || 0);

    function dbg(msg, info) {
      console.debug('lookupCachedVerAnno:', msg, { apiSubUrl, ...info });
    }

    if (now < earliest) {
      dbg('still on cooldown. skip.', { earliest, now });
      return rInfo;
    }
    rInfo.fetchRetryNotBefore = now + (cmpVueElem.fetchRetryCooldownSec * 1e3);
    const fetchPr = (async function downloadVer() {
      dbg('fetch!');
      const reply = await api22(cmpVueElem.$store.state).aepGet(apiSubUrl);
      if (rInfo.fetchedAt) { return dbg('redundant late reply'); }
      EX.verifyFetchedAnno({ cmpVueElem, reply, apiSubUrl });
      dbg('reply looks acceptable.', { reply });
      const dest = rInfo.anno;
      if (!dest) { throw new Error('Bad destination in versions cache'); }
      rInfo.internalPlumbing().receiveAnnoData(reply);
      cmpVueElem.forceRerenderAnnos();
    }());
    eventBus.$emit('trackPromise', fetchPr);
    return rInfo;
  },


});


Object.assign(EX, {

  vueMtd,

  verifyFetchedAnno(ctx) {
    const { reply } = ctx;
    const fail = EX.refuseFetchedAnno;
    const annoIdUrl = (reply || false).id; // Anno ID
    if (!annoIdUrl) { fail(ctx, '<missing_required_field><annofield_id>'); }
    if (!annoIdUrl.endsWith('/' + ctx.apiSubUrl)) { fail(ctx, 'annofield_id'); }
  },

  refuseFetchedAnno(ctx, why) {
    const { l10n } = ctx.cmpVueElem;
    const msg = l10n('corrupt_data') + ' ' + ctx.apiSubUrl + ': ' + l10n(why);
    throw new Error(msg);
  },


});




module.exports = EX;
