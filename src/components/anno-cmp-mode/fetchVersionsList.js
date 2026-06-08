// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

// const getOwn = require('getown');
const makeDeferred = require('promise-deferred');
const api22 = require('../../api22.js');

const decideAuxMeta = require('./decideAuxiliaryMetaData.js');

function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function orf(x) { return x || false; }


const cdbg = console.debug.bind(console, 'fetchVersionsList:');

const fvl = async function fetchVersionsList(cmpVueElem) {
  try {
    await fvl.fallibleCore(cmpVueElem);
  } catch (err) {
    err.hint = cmpVueElem.l10n('anno_list:loadfail');
    throw err;
  }
};


Object.assign(fvl, {

  guessVerNum(url) { return +orf(url && /\~(\d+)$/.exec(url))[1] || 0; },


  mustGuessVerNum(trace, urlOrDict, dictKey, descr) {
    const url = (dictKey ? urlOrDict[dictKey] : urlOrDict);
    const n = fvl.guessVerNum(url);
    if (n >= 1) { return n; }
    const e = new Error(trace + 'Cannot guess version number from '
      + (descr || ('URL in field "' + dictKey + '"')) + ': ' + url);
    throw e;
  },


  async fallibleCore(cmpVueElem) {
    const api = api22(cmpVueElem.$store.state);
    const { baseId } = cmpVueElem;
    const {
      defaultVerNum,
      defaultVerData,
      defaultVerErr,
      verHistUrl,
    } = await fvl.discoverInitialFacts({ api, baseId });
    if (!verHistUrl) { throw new Error('Cannot detect version history URL'); }
    const verHistRsp = await api.aepGet('://' + verHistUrl);
    const verHistItems = orf(verHistRsp.first).items;
    if (!Array.isArray(verHistItems)) {
      throw new Error('Received version history in unexpected data format.');
    }
    cdbg('Received official version history:', jsonDeepCopy(verHistItems));
    let versList = Array.from({ length: defaultVerNum });
    let latestVerNum = defaultVerNum;
    verHistItems.forEach(function learnVer(orig, histEntIdx) {
      if (!orig) { return; }
      const trace = 'Parse version history item #' + (histEntIdx + 1) + ': ';
      const rInfo = { anno: orig };
      rInfo.verNum = fvl.mustGuessVerNum(trace, orig, 'id');
      if (rInfo.verNum > latestVerNum) {
        /* It seems the version history had one more, potentially because
          of race condition or because the latest version redirect hid a
          not-yet-approved anno from us. */
        latestVerNum = rInfo.verNum;
      }
      const nowLoaded = makeDeferred();
      Object.assign(rInfo, {
        ...decideAuxMeta(orig, cmpVueElem),
        waitUntilLoaded() { return nowLoaded.promise; },
      });
      const plumbing = {
        receiveAnnoData(data) {
          delete plumbing.receiveAnnoData;
          rInfo.fetchedAt = Date.now();
          cdbg('receiveAnnoData:', jsonDeepCopy({ ...rInfo, '+': data }));
          Object.assign(rInfo.anno, data);
          Object.assign(rInfo, decideAuxMeta(rInfo.anno, cmpVueElem));
          const aclUpd = data['ubhd:aclPreviewBySubjectTargetUrl'];
          if (aclUpd) { cmpVueElem.$store.commit('UPDATE_ACL', aclUpd); }
          nowLoaded.resolve(rInfo);
        },
      };
      rInfo.internalPlumbing = Object.bind(null, plumbing);
      versList[rInfo.verNum - 1] = rInfo;
    });

    const vocNoData = cmpVueElem.l10n('no_data');
    const missing = { 'skos:note': vocNoData };
    versList = versList.map((r, i) => (r
      || { verNum: i + 1, anno: { ...missing } }));

    const defaultVerSlot = versList[defaultVerNum - 1];
    if (!defaultVerData) {
      const { anno } = defaultVerSlot;
      let err = String(defaultVerErr.message || defaultVerErr);
      err = err.trim().replace(/\n\s*/g, '¶ ').trim();
      err = cmpVueElem.l10n('error:') + ' ' + err;
      anno['dc:title'] = err;
      const hdr = orf(defaultVerErr.headers);
      if (hdr.sunset) { anno['as:deleted'] = hdr.sunset; }
    }

    cdbg('Before receiveAnnoData(defaultVerData)');
    defaultVerSlot.internalPlumbing().receiveAnnoData(defaultVerData); /*
      NB: Always call rAD even with false-y data, in order to do all meta
      data checks and mark it as already received in the cache. */
    cdbg('After receiveAnnoData(defaultVerData)');

    const meta = { latestVerNum, fetchedAt: defaultVerSlot.fetchedAt };
    Object.assign(versList, meta);

    cdbg('Consolidated versions list:', jsonDeepCopy(versList));
    cmpVueElem.knownVersions = versList;
    const reversed = Object.assign(versList.slice().reverse(), meta);
    cmpVueElem.reverseOrderKnownVersions = reversed;
    cmpVueElem.forceRerenderAnnos();
  },


  async discoverInitialFacts(ctx) {
    let defaultVerData = false;
    // cdbg('discoverInitialFacts: baseId:', ctx.baseId);
    try {
      defaultVerData = await ctx.api.getAnnoById(ctx.baseId);
    } catch (apiErr) {
      const { finalUrl } = apiErr;
      const linkRels = orf(apiErr.linkRels);
      // cdbg('discoverInitialFacts:', { apiErr, finalUrl, linkRels });
      let defaultVerNum = 0;
      const trace = ('While describing API error "' + String(apiErr)
        + '" that occurred when fetching the latest version: ');
      try {
        defaultVerNum = (fvl.guessVerNum(trace, linkRels, 'latest-version')
          || fvl.guessVerNum(trace, linkRels, 'original')
          || fvl.mustGuessVerNum(trace, finalUrl, null, 'URL after redirects'));
      } catch (verNumErr) {
        console.error(verNumErr);
      }
      let verHistUrl = (linkRels['version-history'] || '');
      if (finalUrl && (!verHistUrl.includes('://'))) {
        verHistUrl = (new URL(verHistUrl, finalUrl)).href;
      }
      return {
        defaultVerData,
        defaultVerErr: apiErr,
        defaultVerNum,
        verHistUrl,
      };
    }

    function lavStr(k) {
      const v = defaultVerData[k];
      if ((v && typeof v) === 'string') { return v; }
      const msg = 'Latest anno version lacks the ' + k + ' field!';
      console.error(msg, { defaultVerData });
      throw new Error(msg);
    }

    const defaultVerUrl = lavStr('id');
    const trace = ('While reporting meta data for '
      + 'the successfully fetched latest version: ');
    const defaultVerNum = fvl.mustGuessVerNum(trace, defaultVerUrl, null,
      "minimum latest version URL (i.e. the annotation's ID field)");
    return {
      defaultVerData,
      defaultVerErr: false,
      defaultVerNum,
      verHistUrl: lavStr('iana:version-history'),
    };
  },


});


module.exports = fvl;
