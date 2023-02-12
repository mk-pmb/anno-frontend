// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const findAnnoRelations = require('./findAnnoRelations.js');
const flattenSubAnnos = require('./flattenSubAnnos.js');


const EX = function mergeReplies(allAnnosFlat, state) {
  const { topLevelAnnos } = findAnnoRelations(allAnnosFlat);
  const ds = state.replyDisplayStyle;
  if (ds === 'nested') { return topLevelAnnos; }
  if (ds === 'flat') { return topLevelAnnos.map(flattenSubAnnos); }
  throw new Error('Invalid option for replyDisplayStyle: ' + ds);
};


module.exports = EX;
