// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
const autoDefault = require('require-mjs-autoprefer-default-export-pmb');
const parseCeson = require('ceson/parse.js');

const annoDataApi = autoDefault(require('../../../annoDataApi'));
const api22 = require('../../../api22.js');
const deepFreeze = autoDefault(require('deep-freeze-es6'), 'deepFreeze');
const eventBus = require('../../../event-bus.js');

const optimizeAnnoList = require('./optimizeAnnoList.js');
const fixupVeryBrokenAnnos = require('./fixupVeryBrokenAnnos.js');

function orf(x) { return x || false; }


const EX = async function fetchAnnoList(store) {
  const { state, commit } = store;
  await commit('ANNOLIST_UPDATE_STATE', {
    list: [],
    fetching: true,
    fetchFailed: false,
  });
  eventBus.$emit('fetching');
  try {
    let annos = await EX.collectAnnos(state);
    if (annos.acl) { commit('UPDATE_ACL', annos.acl); }
    Object.assign(annos, EX.rawAnnoListApi);
    try {
      annoDataApi.upgradeAnnoList.inplace(annos);
    } catch (err) {
      console.error(err);
      throw err;
    }
    deepFreeze(annos);
    eventBus.$emit('annoListFetchedRaw', annos);

    const nOrigAnnos = annos.length;
    annos = await optimizeAnnoList(annos, state);
    annos.nTotalAnnosIncludingNested = nOrigAnnos;
    deepFreeze(annos);
    eventBus.$emit('annoListFetchedOptimized', annos);
    eventBus.$emit('annoListFetchedCounts', Object.freeze({
      nTopLevelAnnos: annos.length,
      nTotalAnnosIncludingNested: nOrigAnnos,
    }));
    await commit('ANNOLIST_REPLACE', annos);
    /* No need for a "done" event here: ANNOLIST_REPLACE will fire an event
      very soon. (At time of writing, its name was "annoListReplaced".) */
  } catch (fetchFailed) {
    await commit('ANNOLIST_UPDATE_STATE', {
      fetching: false,
      fetchFailed,
    });
    eventBus.$emit('fetchListFailed', fetchFailed);
  }
};


Object.assign(EX, {

  async collectAnnos(appCfg) {
    const extras = {};
    let allAnnos = (await Promise.all([
      (async function loadFromUrl() {
        const url = (appCfg.annoListSearchUrl || (
          appCfg.annoListSearchPrefix + appCfg.targetSource));
        if (!url) { throw new Error('Missing annoListSearchUrl'); }
        if (url === 'about:blank') { return; }
        const apiReply = await api22(appCfg).aepGet(url);
        const parsed = EX.parseAnnoProtocolAnnos(apiReply);
        extras.acl = parsed.acl;
        return parsed;
      }()),

      [appCfg.annoListAddFromWindowGlobals].flat(99).map(g => g && window[g]),

      (async function loadFromDom() {
        const sel = appCfg.annoListAddFromDom;
        return sel && window.jQuery(sel).toArray().map(function found(elem) {
          const text = String(elem.value || elem.innerText || '').trim();
          if (!text) { return; }
          const parsed = parseCeson(text);
          // console.debug('annoListAddFromDom:', elem, parsed);
          return parsed;
        });
      }()),

    ])).flat(9000);
    allAnnos = fixupVeryBrokenAnnos(allAnnos);
    Object.assign(allAnnos, extras);
    return allAnnos;
  },


  parseAnnoProtocolAnnos(apiReply) {
    const annos = orf(orf(apiReply).first).items;
    if (!Array.isArray(annos)) {
      throw new TypeError('Received an invalid annotations list');
    }
    Object.assign(annos, {
      acl: apiReply['ubhd:aclPreviewBySubjectTargetUrl'],
    });
    return annos;
  },


});


module.exports = EX;
