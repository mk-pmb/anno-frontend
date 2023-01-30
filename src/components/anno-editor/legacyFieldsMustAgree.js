// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const EX = function legacyFieldsMustAgree(pop, convert, fieldNames) {
  // k1, v1: First key with acceptable value, and its value.
  let k1;
  let v1;
  fieldNames.replace(/\S+/g, function compare(ck) {
    let cv = pop(ck);
    // ck, cv = candidate key/value

    if (cv === undefined) { return; }
    // We don't need to consider nuances of undefined vs. missing
    // because annotations are imported from JSON.

    if (convert) { cv = convert(cv); }

    if (!k1) {
      k1 = ck;
      v1 = cv;
      return;
    }
    if (cv === v1) { return; }

    const msg = ('Conflicting fields: '
      + k1 + '=' + JSON.stringify(v1)
      + ' (higher priority) contradicts (lower priority) '
      + ck + '=' + JSON.stringify(cv));
    throw new Error(msg);
  });
  return v1;
};


module.exports = EX;
