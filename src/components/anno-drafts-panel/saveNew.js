// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const dateFmt = require('now-yyyymmdd-hhmmss');
const pDelay = require('delay');
const sortedJson = require('safe-sortedjson');

const api22 = require('../../api22.js');

const hash = require('./hash.js');


const EX = async function saveNew() {
  const panel = this;
  const anno = panel.editorApi.getCleanAnno();

  const draftJson = sortedJson(anno).replace(/'/g, '\\u0027') + '\n';
  const draftContentHash = hash.weaklyHashAnnoDraft(draftJson);
  const fileName = (EX.compileMinusParts(anno, draftContentHash).join('-')
    + '-' + panel.draftFilenameCommentAdjusted
    + '.json');

  const { statusMsg } = panel.$refs;
  statusMsg.setMsg({ text: '💾 ⏳ ' + fileName });

  const { state } = panel.$store;
  try {
    await api22(state).endpointRequest('draftStore',
      'PUT', fileName, draftJson);
    statusMsg.setMsg({ severity: 'ok', text: '💾 ✅ ' + fileName });
    panel.refreshDraftsHintVoc = 'old';
  } catch (apiFail) {
    const debugSave = ('>' + fileName + ' '
      + draftJson.replace(/"/g, "'").replace(/\n/g, '¶'));
    Object.assign(apiFail, { '>': debugSave, fileName, draftJson });
    const text = '💾 ❌ ' + apiFail;
    console.debug(EX.name, { apiFail });
    if (state.debugPromptSaveOnPutFail) {
      await pDelay(1);
      if (window.prompt(text, debugSave) === 'ok') { return; }
    }
    statusMsg.setMsg({ severity: 'fail', text });
    throw apiFail;
  }
};


Object.assign(EX, {

  compileMinusParts(anno, contentHash) {
    const h = hash.fileNameHashes(anno);
    const p = dateFmt.parts();
    const m = {
      date: p.d,
      time: p.t,
      targetHash: h.target,
      annoIdUrlHash: h.annoIdUrl,
      contentHash,
    };
    return hash.minusPartKeys.map(function lookup(k) {
      const v = m[k];
      if (!v) { throw new Error('Mislabeled meta data slot: ' + k); }
      return v;
    });
  },

});


module.exports = EX;
