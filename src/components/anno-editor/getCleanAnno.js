// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }


const EX = function getCleanAnno() {
  const editor = this;
  const { extraFields, ...anno } = jsonDeepCopy(editor.$store.state.editing);
  Object.assign(anno, extraFields);

  if (!anno.id) { delete anno.id; }
  anno['@context'] = 'http://www.w3.org/ns/anno.jsonld';
  delete anno.doi;
  delete anno.collection;
  delete anno.replyTo;

  let bodies = [].concat(anno.body);
  bodies = bodies.map(function cleanupBody(body) {
    if (!body) { return; }
    // Discard empty `TextualBody`s:
    if (body.value) { return body; }
    if (body.type && (body.type !== 'TextualBody')) { return body; }
    console.debug('getCleanAnno: discard empty TextualBody:', body);
    return null;
  }).filter(Boolean);
  EX.setOrDeleteMultiProp(anno, 'body', bodies);
  EX.setOrDeleteMultiProp(anno, 'target', anno.target);

  return anno;
};


Object.assign(EX, {

  setOrDeleteMultiProp(anno, prop, values) {
    let v = values;
    if (v) {
      const n = v.length;
      if (n === 0) { v = false; }
      if (n === 1) { v = v[0]; }
    }
    // eslint-disable-next-line no-param-reassign
    if (v) { anno[prop] = v; } else { delete anno[prop]; }
  },

});


module.exports = EX;
