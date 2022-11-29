// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const jq = require('jquery');

const api22 = require('../../api22.js');

const hash = require('./hash.js');


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

  const doneMsg = l10n('scan_draftslist_done').replace(/@@time@@/g,
    (new Date()).toTimeString().slice(0, 8));
  statusMsg.setMsg({ severity: 'ok', text: doneMsg });

  dirList = dirList.match(/<a\s[\x00-;=\?-\uFFFF]+>/g
    ).map(a => jq(a).attr('href'));
  dirList = dirList.filter(Boolean).sort().reverse();
  const draftFilenameRgx = new RegExp('^((?:\\w+\\-){'
    + hash.minusPartKeys.length + '})(\\S+)\\.json$');
  panel.allDrafts = dirList.map(function parseLink(href) {
    const m = draftFilenameRgx.exec(href);
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
};


module.exports = EX;
