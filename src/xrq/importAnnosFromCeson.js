/* -*- tab-width: 2 -*- */
'use strict';

const isStr = require('is-string');
const mergeOptions = require('merge-options');
const parseCeson = require('ceson/parse.js');

const api22 = require('../api22.js');
const optimizeList = require('../vuex/fetchers/annoList/optimizeAnnoList.js');


const xrqDo = {};
const impl = {};


xrqDo.doImportAnnosFromCeson = async function importRaw(store, how) {
  const oldState = store.state;
  let annos = (how.data
    || (await impl.importAnnosFromUrl(how, oldState))
    || null);
  if (!annos) { return; }
  if (isStr(annos)) { annos = parseCeson(annos); }
  annos = [].concat(annos);
  // console.debug('xrq: ImportAnnosFromCeson:', { cesonText, cesonData, annos });
  if (how.prepareEach) { annos = annos.map(how.prepareEach.bind(how)); }
  const srcUrl = (how.url || 'data:');
  const noIdBase = srcUrl + '#' + Date.now() + '#';
  annos.forEach(function annotateSource(origAnno, annoIdx) {
    const anno = origAnno;
    anno['ubhd:sourceUrl'] = srcUrl;
    if (!anno.id) { anno.id = noIdBase + annoIdx; }
  });
  if (how.mergeIntoEach) {
    annos = annos.map(a => (a && mergeOptions(a, how.mergeIntoEach.bind(how))));
  }
  if (how.refineEach) { annos = annos.map(how.refineEach.bind(how)); }
  annos = await optimizeList(annos, oldState);

  function append(tmpState) {
    const alSt = tmpState.annotationList;
    alSt.list = (function combine() {
      const befIdx = how.insertBeforeIndex;
      const old = alSt.list;
      const nOld = old.length;
      if (!nOld) { return annos; }
      if (!Number.isFinite(befIdx)) { return [...old, ...annos]; }
      if (befIdx === 0) { return [...annos, ...old]; }
      if (befIdx >= nOld) { return [...old, ...annos]; }
      return [...old.slice(0, befIdx), ...annos, ...old.slice(befIdx)];
      // ^-- 2026-05-28: Verified slice() with befIdx = 1: Works.
    }());
  }
  store.commit('INJECTED_MUTATION', [append]);
};


Object.assign(impl, {

  couldBeEndpointSubUrl(url) {
    if (url.includes('://')) { return false; }
    if (url.startsWith('/')) { return false; }
    if (url.startsWith('./')) { return false; }
    if (url.startsWith('../')) { return false; }
    return true;
  },

  async importAnnosFromUrl(how, oldState) {
    let url = String(how.url || '');
    if (!url) { return; }
    if (impl.couldBeEndpointSubUrl(url)) { url = oldState.annoEndpoint + url; }
    console.debug('ImportAnnosFromCesonUrl: req:', { url });
    const data = await api22.webRequest('GET', url);
    console.debug('ImportAnnosFromCesonUrl: got:', { url, data });
    return data;
  },


});

















module.exports = xrqDo;
