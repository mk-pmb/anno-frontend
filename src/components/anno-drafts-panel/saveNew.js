// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const dateFmt = require('now-yyyymmdd-hhmmss');
const pDelay = require('delay');
const sortedJson = require('safe-sortedjson');

const genericSimpleApiCall = require('./genericSimpleApiCall.js');

const hash = require('./hash.js');


const EX = async function saveNew() {
  const panel = this;
  const anno = panel.editorApi.getCleanAnno();
  const saveAsTemplate = panel.$refs.saveAsTemplateCkb.checked;
  if (saveAsTemplate) { delete anno.target; }
  const draftJson = sortedJson(anno).replace(/'/g, '\\u0027') + '\n';
  const contentHash = hash.weaklyHashAnnoDraft(draftJson);
  const filename = (
    EX.compileMinusParts({ panel, contentHash, saveAsTemplate }).join('-')
    + '-' + panel.draftFilenameCommentAdjusted
    + '.json');

  await genericSimpleApiCall({
    panel,
    actionDescrVoc: 'save_as_draft',
    apiVerb: 'PUT',
    filename,
    apiData: draftJson,
    async apiCatch(err) {
      const debugSave = ('>' + filename + ' '
        + draftJson.replace(/"/g, "'").replace(/\n/g, '¶'));
      Object.assign(err, { '>': debugSave, filename, draftJson });
      console.debug(EX.name, { err });
      if (panel.$store.state.debugPromptSaveOnPutFail) {
        await pDelay(1);
        if (window.prompt(String(err), debugSave) === 'ok') { return; }
      }
      throw err;
    },
  });
  await panel.scheduleAutoRescanDraftsList();
};


Object.assign(EX, {

  compileMinusParts(how) {
    const { panel, contentHash, saveAsTemplate } = how;
    const h = hash.fileNameHashes(panel);
    // console.debug('drafts/compileMinusParts: hashes:', h);
    const p = dateFmt.parts();
    const m = {
      date: p.d,
      time: p.t,
      targetHash: (saveAsTemplate ? 't' : h.target),
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
