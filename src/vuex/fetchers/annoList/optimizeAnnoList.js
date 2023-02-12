// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const mergeReplies = require('./mergeReplies.js');


const EX = async function optimizeAnnoList(orig, state) {
  let annos = orig;
  annos = annos.filter(Boolean);
  annos = mergeReplies(annos, state);

  // No other transformations yet, but here is where we would add them.

  return annos;
};


module.exports = EX;
