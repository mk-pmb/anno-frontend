// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const api22 = require('../../api22.js');
const eventBus = require('../../event-bus.js');

function orf(x) { return x || false; }

const usiKey = 'userSessionInfo';

function updateStoredUsi(state, replace, updates) {
  // eslint-disable-next-line no-param-reassign
  state[usiKey] = { ...(replace || state[usiKey]), ...updates };
}


const EX = async function fetchUserSessionInfo(store) {
  const { state, commit } = store;
  let url = state.myIdentitiesEndpoint;
  if (!url) { return; }
  if (url.startsWith('%ae')) {
    url = url.slice(3);
  } else {
    console.error('Anno-Frontend: myIdentitiesEndpoint:',
      'Currently, only URLs within the annoEndpoint are supported.');
    return;
  }

  let { fetching } = orf(state[usiKey]);
  if (fetching) {
    console.warn('fetchUserSessionInfo: Another request is already pending.',
      ':TODO: Abort the other request.');
  }
  fetching = {};
  await commit('INJECTED_MUTATION', [updateStoredUsi, false, { fetching }]);
  const mutateUpdate = {
    fetchQueryTs: Date.now(),
    // ^-- Using a number in order to reduce Vue store proxification.
  };
  const fetchPr = api22(state).aepGet(url);
  fetching.getPr = Object.bind(null, fetchPr);
  // ^- Wrapping the PR in a getter function will protect it from
  //    the vue store's proxification.

  let mutateReplace;
  try {
    const usi = await fetchPr;
    mutateReplace = (usi || {});
  } catch (fetchFailed) {
    mutateUpdate.fetchFailed = fetchFailed;
  }
  mutateUpdate.fetchReplyTs = Date.now();

  fetching = orf(state[usiKey]).fetching;
  const superseded = ((fetching && fetching.getPr()) !== fetchPr);
  // ^- We cannot just compare (state.fetching !=== fetching) because the
  //    vue store will always replace it with a deeply proxified stand-in.

  if (superseded) {
    // Another fetch attempt has superseded ours while we were waiting for
    // the reply. Our reply might have stale old data, so we just drop it.
    return;
  }

  mutateUpdate.fetching = false;
  // ^-- Using a number in order to reduce Vue store proxification.

  await commit('INJECTED_MUTATION',
    [updateStoredUsi, mutateReplace, mutateUpdate]);
  eventBus.$emit('userSessionInfoUpdated');
};


module.exports = EX;
