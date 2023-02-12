/* -*- tab-width: 2 -*- */
'use strict';

const mergeOptions = require('merge-options');
const parseCeson = require('ceson/parse.js');

const optimizeList = require('../vuex/fetchers/annoList/optimizeAnnoList.js');


async function doImportAnnosFromCeson(store, how) {
  const oldState = store.state;
  const cesonData = parseCeson(how.data);
  let annos = [].concat(cesonData);
  // console.debug('xrq: ImportAnnosFromCeson:', { cesonText, cesonData, annos });
  if (how.prepareEach) { annos = annos.map(how.prepareEach); }
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
}

module.exports = {
  doImportAnnosFromCeson,
};
