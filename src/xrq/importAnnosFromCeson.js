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
  if (how.prepareEach) { annos = annos.map(how.prepareEach); }
  annos.forEach(function annotateSource(anno) {
    // eslint-disable-next-line no-param-reassign
    anno['ubhd:sourceUrl'] = (how.url || 'data:');
  });
  if (how.mergeIntoEach) {
    annos = annos.map(a => (a && mergeOptions(a, how.mergeIntoEach)));
  }
  if (how.refineEach) { annos = annos.map(how.refineEach); }
  annos = await optimizeList(annos, oldState);

  function append(tmpState) {
    const alSt = tmpState.annotationList;
    alSt.list = alSt.list.concat(annos);
    // console.debug('xrq: ImportAnnosFromCeson: added.');
  }
  store.commit('INJECTED_MUTATION', [append]);
};


Object.assign(impl, {

  async importAnnosFromUrl(how, oldState) {
    let url = String(how.url || '');
    if (!url) { return; }
    if ((!url.includes('://')) && (!url.startsWith('/'))) {
      url = oldState.annoEndpoint + url;
    }
    console.debug('ImportAnnosFromCesonUrl: req:', { url });
    const data = await api22.webRequest('GET', url);
    console.debug('ImportAnnosFromCesonUrl: got:', { url, data });
    return data;
  },


});

















module.exports = xrqDo;
