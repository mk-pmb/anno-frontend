// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const dateFmt = require('now-yyyymmdd-hhmmss');
const sortedJson = require('safe-sortedjson');

const api22 = require('../../api22.js');

const hash = require('./hash.js');


const EX = async function saveNew() {
  const panel = this;
  const anno = panel.editorApi.getCleanAnno();
  const fileNameHashes = hash.fileNameHashes(anno);

  const draftJson = sortedJson(anno).replace(/'/g, '\\u0027') + '\n';
  const draftContentHash = hash.weaklyHashAnnoDraft(draftJson);
  const fileName = (dateFmt()
    + '-' + fileNameHashes.target
    + '-' + fileNameHashes.annoIdUrl
    + '-' + draftContentHash
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
    statusMsg.setMsg({ severity: 'fail', text });
    console.debug(EX.name, { apiFail });
    if (state.debugPromptSaveOnPutFail) {
      setTimeout(() => window.prompt(text, debugSave), 1);
    }
  }
};


module.exports = EX;
