// -*- coding: utf-8, tab-width: 2 -*-

const EX = function findTargetUri(t) {
  if (!t) { return ''; }
  return (t.source || t.id /* Anno ID */ || t);
};


module.exports = EX;
