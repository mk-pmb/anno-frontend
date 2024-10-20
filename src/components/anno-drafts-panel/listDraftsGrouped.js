// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const draftGroupsConfig = require('./cfg.draftGroups.js');
const hash = require('./hash.js');


function decideVocGroup(draftMeta, annoHashes) {
  if (!draftMeta) { return; }
  if (!annoHashes) { return; }
  const sameAnno = ((draftMeta.annoIdUrlHash === annoHashes.annoIdUrl)
    && (draftMeta.annoIdUrlHash !== '0')
    );
  if (sameAnno) { return 'same_anno'; }
  if (draftMeta.targetHash === '0') { return 'no_target'; }
  if (draftMeta.targetHash === annoHashes.target) { return 'same_subj'; }
}


const EX = function listDraftsGrouped() {
  const draftsPanelVueElem = this;
  const eaHashes = hash.fileNameHashes(draftsPanelVueElem);
  // console.debug('listDraftsGrouped:', { eaHashes });
  const byVoc = {};
  const appCfg = draftsPanelVueElem.$store.state;
  const groups = draftGroupsConfig(appCfg).map(function setup(grpCfg) {
    const gr = {
      ...grpCfg,
      items: [],
    };
    byVoc[grpCfg.voc] = gr;
    return gr;
  });
  // window.groups = groups;
  groups.byVoc = byVoc;
  draftsPanelVueElem.allDrafts.forEach(function add(draftMeta) {
    const grVoc = decideVocGroup(draftMeta, eaHashes);
    (byVoc[grVoc] || byVoc.other).items.push(draftMeta);
  });
  return groups;
};


module.exports = EX;
