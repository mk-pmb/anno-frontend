// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

// const getOwn = require('getown');
const makeDeferred = require('promise-deferred');
const api22 = require('../../api22.js');

const decideAuxMeta = require('./decideAuxiliaryMetaData.js');

function orf(x) { return x || false; }


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
      latestVerNum,
      latestVerData,
      latestVerErr,
      verHistUrl,
    } = await fvl.discoverInitialFacts({ api, baseId });
    if (!verHistUrl) { throw new Error('Cannot detect version history URL'); }
    const verHistRsp = await api.aepGet('://' + verHistUrl);
    const verHistItems = orf(verHistRsp.first).items;
    if (!Array.isArray(verHistItems)) {
      throw new Error('Received version history in unexpected data format.');
    }
    console.debug('Obtained version history:', verHistItems);
    let versList = Array.from({ length: latestVerNum });
    verHistItems.forEach(function learnVer(orig, histEntIdx) {
      if (!orig) { return; }
      const trace = 'Parse version history item #' + (histEntIdx + 1) + ': ';
      const rInfo = { anno: orig };
      rInfo.verNum = fvl.mustGuessVerNum(trace, orig, 'id');
      const nowLoaded = makeDeferred();
      Object.assign(rInfo, {
        ...decideAuxMeta(orig, cmpVueElem),
        waitUntilLoaded() { return nowLoaded.promise; },
      });
      const plumbing = {
        receiveAnnoData(data) {
          delete plumbing.receiveAnnoData;
          rInfo.fetchedAt = Date.now();
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

    const [lastSlot] = versList.slice(-1);
    if (!latestVerData) {
      const { anno } = lastSlot;
      let err = String(latestVerErr.message || latestVerErr);
      err = err.trim().replace(/\n\s*/g, '¶ ').trim();
      err = cmpVueElem.l10n('error:') + ' ' + err;
      anno['dc:title'] = err;
      const hdr = orf(latestVerErr.headers);
      if (hdr.sunset) { anno['as:deleted'] = hdr.sunset; }
    }
    lastSlot.internalPlumbing().receiveAnnoData(latestVerData);
    const meta = { latestVerNum, fetchedAt: lastSlot.fetchedAt };
    Object.assign(versList, meta);

    cmpVueElem.knownVersions = versList;
    const reversed = Object.assign(versList.slice().reverse(), meta);
    cmpVueElem.reverseOrderKnownVersions = reversed;
    cmpVueElem.forceRerenderAnnos();
  },


  async discoverInitialFacts(ctx) {
    let latestVerData = false;
    // console.debug('discoverInitialFacts: baseId:', ctx.baseId);
    try {
      latestVerData = await ctx.api.getAnnoById(ctx.baseId);
    } catch (apiErr) {
      const { finalUrl } = apiErr;
      const linkRels = orf(apiErr.linkRels);
      // console.debug('discoverInitialFacts:', { apiErr, finalUrl, linkRels });
      let latestVerNum = 0;
      const trace = ('While describing API error "' + String(apiErr)
        + '" that occurred when fetching the latest version: ');
      try {
        latestVerNum = (fvl.guessVerNum(trace, linkRels, 'latest-version')
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
        latestVerData,
        latestVerErr: apiErr,
        latestVerNum,
        verHistUrl,
      };
    }

    function lavStr(k) {
      const v = latestVerData[k];
      if ((v && typeof v) === 'string') { return v; }
      const msg = 'Latest anno version lacks the ' + k + ' field!';
      console.error(msg, { latestVerData });
      throw new Error(msg);
    }

    const latestVerUrl = lavStr('id');
    const trace = ('While reporting meta data for '
      + 'the successfully fetched latest version: ');
    const latestVerNum = fvl.mustGuessVerNum(trace, latestVerUrl, null,
      "latest version URL (i.e. the annotation's ID field)");
    return {
      latestVerData,
      latestVerErr: false,
      latestVerNum,
      verHistUrl: lavStr('iana:version-history'),
    };
  },


});


module.exports = fvl;
