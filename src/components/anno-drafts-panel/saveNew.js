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
  let anno = panel.editorApi.getCleanAnno();
  if (panel.$refs.saveAsTemplateCkb.checked) {
    anno = EX.convertToTemplate(anno);
  }
  const draftJson = sortedJson(anno).replace(/'/g, '\\u0027') + '\n';
  const draftContentHash = hash.weaklyHashAnnoDraft(draftJson);
  const filename = (EX.compileMinusParts(anno, draftContentHash).join('-')
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

  convertToTemplate(origAnno) {
    // i.e. just discard the target:
    const { target, ...tmpl } = origAnno;
    return tmpl;
  },

});


module.exports = EX;
