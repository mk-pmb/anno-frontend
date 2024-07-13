// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const api22 = require('../../../api22.js');
const eventBus = require('../../../event-bus.js');

const optimizeAnnoList = require('./optimizeAnnoList.js');

function orf(x) { return x || false; }


const EX = async function fetchAnnoList(store) {
  const { state, commit } = store;
  await commit('ANNOLIST_UPDATE_STATE', {
    list: [],
    fetching: true,
    fetchFailed: false,
  });
  eventBus.$emit('fetching');
  const annoListSearchUrl = (state.annoListSearchUrl || (
    state.annoListSearchPrefix + state.targetSource));
  try {
    let annos = await api22(state).aepGet(annoListSearchUrl);

    const aclUpd = annos['ubhd:aclPreviewBySubjectTargetUrl'];
    if (aclUpd) { commit('UPDATE_ACL', aclUpd); }

    annos = orf(orf(annos).first).items;
    if (!Array.isArray(annos)) {
      throw new TypeError('Received an invalid annotations list');
    }
    eventBus.$emit('annoListFetchedRaw', annos);
    const nOrigAnnos = annos.length;
    annos = await optimizeAnnoList(annos, state);
    annos.nTotalAnnosIncludingNested = nOrigAnnos;
    eventBus.$emit('annoListFetchedOptimized', annos);
    eventBus.$emit('annoListFetchedCounts', {
      nTopLevelAnnos: annos.length,
      nTotalAnnosIncludingNested: nOrigAnnos,
    });
    await commit('ANNOLIST_REPLACE', annos);
  } catch (fetchFailed) {
    await commit('ANNOLIST_UPDATE_STATE', {
      fetching: false,
      fetchFailed,
    });
    eventBus.$emit('fetchListFailed', fetchFailed);
  }
};


module.exports = EX;
