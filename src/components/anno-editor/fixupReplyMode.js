// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const arrayOfTruths = require('array-of-truths');


function ifHasKeys(x) { return x && Boolean(Object.keys(x).length) && x; }


const EX = function fixupReplyMode(state, anno) {
  const enfReply = state.editEnforceReplying;
  const tgtList = arrayOfTruths(anno.target);
  const vueStoreUpdates = {};

  function upd(k, v) {
    if (v) {
      if (anno[k] !== v) {
        anno[k] = v; // eslint-disable-line no-param-reassign
        vueStoreUpdates[k] = v;
      }
    } else if (anno[k] !== undefined) {
      delete anno[k]; // eslint-disable-line no-param-reassign
      vueStoreUpdates[k] = null;
      // ^-- For compatibility with commit('FLAT_UPDATE_EDITOR_ANNO', …);
    }
  }

  upd('as:inReplyTo', enfReply);
  if (enfReply) {
    upd('motivation', 'replying');
    const hasReplyTgt = tgtList.some(t => (t.id || t) === enfReply);
    if (!hasReplyTgt) {
      tgtList.unshift({ id: enfReply, ':ANNO_FE:targetType': 'inReplyTo' });
      upd('target', tgtList);
    }
  } else if (anno.motivation === 'replying') {
    upd('motivation');
  }

  return ifHasKeys(vueStoreUpdates);
};






module.exports = EX;
