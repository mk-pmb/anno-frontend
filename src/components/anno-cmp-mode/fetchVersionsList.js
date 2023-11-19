// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

// const getOwn = require('getown');
const makeDeferred = require('promise-deferred');
const mustBe = require('typechecks-pmb/must-be.js');

const api22 = require('../../api22.js');

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


  mustGuessVerNum(url) {
    const n = fvl.guessVerNum(url);
    if (n >= 1) { return n; }
    throw new Error('Cannot guess version number from URL: ' + url);
  },


  async fallibleCore(cmpVueElem) {
    const api = api22(cmpVueElem.$store.state);
    const { baseId } = cmpVueElem;
    const {
      latestVerNum,
      latestVerData,
      verHistUrl,
    } = await fvl.discoverInitialFacts({ api, baseId });
    if (!verHistUrl) { throw new Error('Cannot detect version history URL'); }
    const verHistRsp = await api.aepGet('://' + verHistUrl);
    const verHistItems = orf(verHistRsp.first).items;
    if (!Array.isArray(verHistItems)) {
      throw new Error('Received version history in unexpected data format.');
    }
    let versList = Array.from({ length: latestVerNum });
    verHistItems.forEach(function learnVer(orig) {
      if (!orig) { return; }
      const verNum = fvl.mustGuessVerNum(orig.id /* Anno ID URL */);
      // if (verNum % 2) { return; }
      const nowLoaded = makeDeferred();
      const rInfo = {
        verNum,
        anno: orig,
        waitUntilLoaded() { return nowLoaded.promise; },
      };
      const plumbing = {
        receiveAnnoData(data) {
          delete plumbing.receiveAnnoData;
          rInfo.fetchedAt = Date.now();
          Object.assign(rInfo.anno, data);
          nowLoaded.resolve(rInfo);
        },
      };
      rInfo.internalPlumbing = Object.bind(null, plumbing);
      versList[verNum - 1] = rInfo;
    });

    const missing = { 'skos:note': cmpVueElem.l10n('no_data') };
    versList = versList.map((r, i) => (r
      || { verNum: i + 1, anno: { ...missing } }));

    const [lastSlot] = versList.slice(-1);
    Object.assign(lastSlot.anno, latestVerData);
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
    try {
      latestVerData = await ctx.api.getAnnoById(ctx.baseId);
    } catch (apiErr) {
      const { finalUrl, linkRels } = apiErr;
      const latestVerNum = (fvl.guessVerNum(linkRels['latest-version'])
        || fvl.guessVerNum(linkRels['original'])
        || fvl.guessVerNum(finalUrl));
      let verHistUrl = (linkRels['version-history'] || '');
      if (finalUrl && (!verHistUrl.includes('://'))) {
        verHistUrl = (new URL(verHistUrl, finalUrl)).href;
      }
      return {
        latestVerNum,
        latestVerData: false,
        verHistUrl,
      };
    }
    const lavStr = mustBe.tProp('Latest anno version ',
      latestVerData, 'nonEmpty str');
    const latestVerUrl = lavStr('id' /* Anno ID URL */);
    const latestVerNum = fvl.mustGuessVerNum(latestVerUrl);
    return {
      latestVerData,
      latestVerNum,
      verHistUrl: lavStr('iana:version-history'),
    };
  },


});


module.exports = fvl;
