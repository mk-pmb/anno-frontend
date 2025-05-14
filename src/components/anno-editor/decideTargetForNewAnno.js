// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const unpackSingleProp = require('unwrap-single-prop').default;

function ifNonEmptyObj(x) {
  return (x && Object.keys(x).length && x) || false;
}


const EX = function decideTargetForNewAnno(state) {
  const meta = ifNonEmptyObj(state.targetMetaData);
  const tgtSels = [];

  if (state.targetFragment) {
    tgtSels.push({
      type: 'FragmentSelector',
      value: state.targetFragment,
    });
  }

  if (!tgtSels.length) {
    // No selector means our target is most likely an External Web Resource
    // (ch 3.2.1) or Segment thereof (ch 3.2.3).
    // Since all of their extra data (e.g. ch 3.2.2 "Classes") is optional,
    // we can just provide the value of the "id" field directly:
    // … unless we have targetMetaData.
    if (meta) { return { ...meta, id: state.targetSource }; }
    return state.targetSource;
  }

  // Using any selector(s) means our target must be a Specific Resource (ch 4):
  const tgtSpec = {
    ...meta,
    source: state.targetSource,
    selector: unpackSingleProp(0, tgtSels),
  };
  return tgtSpec;
};


module.exports = EX;
