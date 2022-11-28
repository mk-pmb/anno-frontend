// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const jq = require('jquery');

const api22 = require('../../api22.js');


const EX = async function reloadDraftsList() {
  const panel = this;
  const { statusMsg } = panel.$refs;
  const { l10n } = panel;
  statusMsg.setMsg({ text: l10n('scan_draftslist_wip') });
  panel.refreshDraftsHintVoc = '';

  const { state } = panel.$store;
  let dirList;
  try {
    dirList = await api22(state).endpointRequest('draftStore', 'GET', '');
  } catch (apiFail) {
    console.debug(EX.name, { apiFail });
    statusMsg.setMsg({ severity: 'fail', text: '❌ ' + apiFail });
    return;
  }

  statusMsg.dismiss();

  dirList = dirList.match(/<a\s[\x00-;=\?-\uFFFF]+>/g
    ).map(a => jq(a).attr('href'));
  dirList = dirList.filter(Boolean).sort().reverse();
  const draftFilenameRgx = /^(?:\w+\-){4}\S+\.json$/;
  panel.allDrafts = dirList.map(function parseLink(href) {
    const fileName = (draftFilenameRgx.exec(href) || false)[0];
    if (!fileName) { return; }
    const [date, time, targetHash, annoIdUrlHash] = fileName.split(/\-/);
    return { fileName, date, time, targetHash, annoIdUrlHash };
  }).filter(Boolean);
};


module.exports = EX;
