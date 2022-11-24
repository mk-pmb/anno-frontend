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

  let bodies = [].concat(anno.body);
  bodies = bodies.map(function cleanupBody(body) {
    if (body.value) { return body; }
    if (body.type && (body.type !== 'TextualBody')) { return body; }
    return null;
  }).filter(Boolean);
  if (bodies.length === 0) { bodies = false; }
  if (bodies.length === 1) { bodies = bodies[0]; }
  anno.body = bodies;
  if (!bodies) { delete anno.body; }

  return anno;
};


module.exports = EX;
