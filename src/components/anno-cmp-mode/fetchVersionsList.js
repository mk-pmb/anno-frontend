// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

// const getOwn = require('getown');
const mustBe = require('typechecks-pmb/must-be.js');

const api22 = require('../../api22.js');

// function orf(x) { return x || false; }


const fvl = async function fetchVersionsList(cmpVueElem) {
  try {
    await fvl.fallibleCore(cmpVueElem);
  } catch (err) {
    err.hint = cmpVueElem.l10n('anno_list:loadfail');
    throw err;
  }
};


Object.assign(fvl, {

  guessVerNum(url) {
    const m = /\~(\d+)$/.exec(url);
    const n = +(m && m[1]);
    if (n >= 1) { return n; }
    throw new Error('Cannot guess version number from URL: ' + url);
  },


  async fallibleCore(cmpVueElem) {
    const api = api22(cmpVueElem.$store.state);
    const latestVerData = await api.aepGet('anno/' + cmpVueElem.baseId);
    const lavStr = mustBe.tProp('Latest anno version ',
      latestVerData, 'nonEmpty str');
    const latestVerNum = fvl.guessVerNum(lavStr('id' /* Anno ID URL */));
    cmpVueElem.latestVerNum = latestVerNum;
    const verHistUrl = lavStr('iana:version-history');
    const verHistRsp = await api.aepGet('://' + verHistUrl);
    const verHistItems = (verHistRsp.first || false).items;
    if (!Array.isArray(verHistItems)) {
      throw new Error('Received version history in unexpected data format.');
    }
    let versList = Array.from({ length: latestVerNum });
    verHistItems.forEach(function learnVer(ver) {
      if (!ver) { return; }
      const versNum = fvl.guessVerNum(ver.id /* Anno ID URL */);
      // if (versNum % 2) { return; }
      const ent = { versNum, created: ver.created };
      const hint = String(ver['skos:note'] || '');
      if (hint) { ent.hint = hint; }
      versList[versNum - 1] = ent;
    });
    const missing = { created: null, hint: cmpVueElem.l10n('no_data') };
    versList = versList.map((r, i) => (r || { ...missing, versNum: i + 1 }));
    versList[latestVerNum - 1].data = latestVerData;
    cmpVueElem.knownVersions = versList;
    cmpVueElem.reverseOrderKnownVersions = versList.slice().reverse();
    cmpVueElem.forceRerenderAnnos();
  },


});


module.exports = fvl;
