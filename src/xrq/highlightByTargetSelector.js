/* -*- tab-width: 2 -*- */
'use strict';

const getOwn = require('getown');
const autoDefault = require('require-mjs-autoprefer-default-export-pmb');
const loMapValues = require('lodash.mapvalues');

const annoDataApi = autoDefault(require('../annoDataApi'));



const selectorMatchers = {

  fragment(values, anno) {
    const fragId = annoDataApi.findTargetFragment(anno);
    if (!fragId) { return null; }
    return { isMatch: getOwn(values, fragId), value: fragId };
  },

};


async function doHighlightByTargetSelector(store, param) {
  const { eventBus } = this.annoApp;
  const { selector, values, others } = param;
  const matcher = getOwn(selectorMatchers, selector);
  if (!matcher) { throw new Error('Unsupported selector type: ' + selector); }
  const annos = [].concat(store.state.annotationList.list);
  // console.debug('hlBySel:', selector, matcher, values, others, annos);
  const matchedAnnoIds = {
    yes:    new Set(),  // highlighted by explicit match
    no:     new Set(),  // un-highlighted by explicit match
    other:  new Set(),  // not matched by any rule
  };
  const matchedValues = new Map();
  annos.forEach(function check(anno) {
    const annoIdUrl = anno.id;
    if (!annoIdUrl) { return; }
    const m = matcher(values, anno);
    let { isMatch } = (m || false);
    if (isMatch === undefined) {
      isMatch = others;
      matchedAnnoIds.other.add(annoIdUrl);
    } else {
      matchedAnnoIds[isMatch ? 'yes' : 'no'].add(annoIdUrl);
      const { value } = m;
      let reasons = matchedValues.get(value);
      if (!reasons) {
        reasons = new Map();
        matchedValues.set(value, reasons);
      }
      reasons.set(annoIdUrl, m);
    }
    if (typeof isMatch !== 'boolean') { return; }
    const ev = (isMatch ? 'startHighlighting' : 'stopHighlighting');
    eventBus.$emit(ev, annoIdUrl);
  });
  const report = {
    matchedAnnoIds: loMapValues(matchedAnnoIds,
      ids => (ids.size ? Array.from(ids.values()).sort() : false)),
    matchedSelectors: {
      // ^-- Planning ahead for supporting multiple selectors.
      [selector]: matchedValues,
    },
  };
  return report;
}


module.exports = {
  doHighlightByTargetSelector,
};
