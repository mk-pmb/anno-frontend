// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const jq = require('jquery');

const genericSimpleApiCall = require('./genericSimpleApiCall.js');
const hash = require('./hash.js');


const EX = async function reloadDraftsList(opt) {
  const {
    silent,
  } = (opt || false);
  const panel = this;
  panel.refreshDraftsHintVoc = '';
  panel.allDrafts = await genericSimpleApiCall({
    panel,
    actionDescrVoc: 'scan_draftslist',
    apiVerb: 'GET',
    filename: '',
    refine: EX.dirIndexHtmlToFilesList,
    silent,
  });

};


Object.assign(EX, {

  draftFilenameRgx: new RegExp('^((?:\\w+\\-){'
    + hash.minusPartKeys.length + '})(\\S+)\\.json$'),

  dirIndexHtmlToFilesList(origHtml) {
    const hrefs = origHtml.match(/<a\s[\x00-;=\?-\uFFFF]+>/g)
    .map(a => jq(a).attr('href'));
    const sortedHrefs = hrefs.filter(Boolean).sort().reverse();
    const draftFileNames = sortedHrefs.map(function parseLink(href) {
      const m = EX.draftFilenameRgx.exec(href);
      if (!m) { return; }
      const meta = { fileName: m[0] };
      const splat = m[1].split(/\-/);
      hash.minusPartKeys.forEach((k, i) => { meta[k] = (splat[i] || ''); });
      meta.customNamePart = m[2];
      (function dateFmt() {
        const t = meta.time;
        const d = meta.date;
        meta.humanDate = d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6);
        meta.humanTime = t.slice(0, 2) + ':' + t.slice(2, 4);
      }());
      return meta;
    }).filter(Boolean);
    return draftFileNames;
  },

});


module.exports = EX;
