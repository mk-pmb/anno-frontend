// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const draftGroupsConfig = require('./cfg.draftGroups.js');


function decideVocGroup(draft, editorAnno) {
  if (!draft) { return; }
  if (!editorAnno) { return; }
  if (draft.id === editorAnno.id) { return 'same_anno'; }
  console.debug('decideVocGroup', draft, editorAnno.$store.state);
}


const EX = function listDraftsGrouped() {
  const panel = this;
  const editorAnno = panel.editorApi.getCleanAnno();
  const byVoc = {};
  const groups = draftGroupsConfig.map(function setup(grpCfg) {
    const gr = {
      ...grpCfg,
      items: [],
    };
    byVoc[grpCfg.voc] = gr;
    return gr;
  });
  groups.byVoc = byVoc;
  panel.allDrafts.forEach(function add(draft) {
    const gr = decideVocGroup(draft, editorAnno);
    const { items } = (groups.byVoc[gr] || groups.other);
    items.push(draft);
  });
  return groups;
};


module.exports = EX;
