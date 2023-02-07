// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const api22 = require('../../../api22.js');
const eventBus = require('../../../event-bus.js');

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
    const annos = await api22(state).aepGet(
      'anno/by/subject-target/' + state.targetSource);
    const list = orf(orf(annos).first).items;
    if (!Array.isArray(list)) {
      throw new TypeError('Received an invalid annotations list');
    }
    await commit('ANNOLIST_REPLACE', list);
    eventBus.$emit('fetched', list);
  } catch (fetchFailed) {
    await commit('ANNOLIST_UPDATE_STATE', {
      fetching: false,
      fetchFailed,
    });
    eventBus.$emit('fetchListFailed', fetchFailed);
  }
};


module.exports = EX;
