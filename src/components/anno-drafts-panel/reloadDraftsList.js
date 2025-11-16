// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const genericSimpleApiCall = require('./genericSimpleApiCall.js');
const parseDraftFileName = require('./parseDraftFileName.js');

const jq = window.jQuery;


const EX = async function reloadDraftsList(opt) {
  const {
    silent,
  } = (opt || false);
  const panel = this;
  panel.refreshDraftsHintVoc = '';
  const apiRequest = {
    panel,
    actionDescrVoc: 'scan_draftslist',
    apiVerb: 'GET',
    filename: '',
    refine: EX.dirIndexHtmlToFilesList,
    silent,
  };
  try {
    panel.allDrafts = await genericSimpleApiCall(apiRequest);
  } catch (scanErr) {
    // genericSimpleApiCall should already have notified the user.
    console.error('Anno-Editor: reloadDraftsList failed', { scanErr });
  }
};


Object.assign(EX, {

  dirIndexHtmlToFilesList(origHtml) {
    const hrefs = origHtml.match(/<a\s[\x00-;=\?-\uFFFF]+>/g)
    .map(a => jq(a).attr('href'));
    const sortedHrefs = hrefs.filter(Boolean).sort().reverse();
    const allDrafts = sortedHrefs.map(parseDraftFileName).filter(Boolean);
    return allDrafts;
  },

});


module.exports = EX;
