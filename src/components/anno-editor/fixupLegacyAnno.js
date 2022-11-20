// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }


const EX = function fixupLegacyAnno(legacyEditorAnno) {
  const anno = jsonDeepCopy(legacyEditorAnno);
  if (!anno.id) { delete anno.id; }
  anno['@context'] = 'http://www.w3.org/ns/anno.jsonld';
  delete anno.doi;
  delete anno.collection;
  delete anno.replyTo;
  return anno;
};


module.exports = EX;
