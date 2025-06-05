// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

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
  const origGroups = draftsPanelVueElem.draftGroups;

  /* We must not modify anything in the original groups, because that
    would cause an infinite re-render loop. Instead, we make a flat copy
    of each group and add the items only to that copy. */
  const byVoc = new Map();
  const groups = origGroups.map(function copyAndExtendOneGroup(origGr) {
    const gr = { ...origGr, items: [] };
    byVoc.set(gr.voc, gr);
    return gr;
  });
  const dfGr = byVoc.get('other');
  if (!dfGr) { throw new Error('listDraftsGrouped: Missing default group!'); }
  draftsPanelVueElem.allDrafts.forEach(function add(draftMeta) {
    const grVoc = decideVocGroup(draftMeta, eaHashes);
    (byVoc.get(grVoc) || dfGr).items.push(draftMeta);
  });
  return groups;
};


module.exports = EX;
