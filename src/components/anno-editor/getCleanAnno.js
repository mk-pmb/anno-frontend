// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const editorModelDef = require('../../vuex/module/editing.js');


function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }

// eslint-disable-next-line no-param-reassign
function deleteIf(o, k, c) { if (c) { delete o[k]; } }


const omitFieldsIfFalsey = [
  'created',
  'id', /* Anno ID */
];


const htmlBodyDefaultProps = {
  type: 'TextualBody',
  format: 'text/html',
};


const EX = function getCleanAnno() {
  const editor = this;
  const vueAnno = jsonDeepCopy(editor.$store.state.editing);
  // console.debug('getCleanAnno: vueAnno:', vueAnno);
  // window.getCleanAnnoDebug = { vueAnno };
  const {
    title,
    versionOf,
    extraFields,
    ...anno
  } = vueAnno;
  Object.assign(anno, extraFields);

  function setAnnoPropIf(k, v) { if (v) { anno[k] = v; } }

  EX.deleteNonEditableFieldsInplace(anno);

  anno['@context'] = 'http://www.w3.org/ns/anno.jsonld';
  anno.type = ['Annotation'];
  setAnnoPropIf('dc:isVersionOf', versionOf);
  setAnnoPropIf('dc:language', editor.annoLanguage.selected);
  setAnnoPropIf('dc:title', title);
  if (anno['dc:dateAccepted'] === false) { delete anno['dc:dateAccepted']; }

  const oldFirstHtmlBody = editorModelDef.getters.firstHtmlBody(anno);
  if (oldFirstHtmlBody) {
    oldFirstHtmlBody.value = ''; // <-- i.e. mark for deletion
  }
  const cleanHtml = editor.getCleanHtml();
  const newFirstHtmlBody = (cleanHtml && {
    ...htmlBodyDefaultProps,
    ...oldFirstHtmlBody,
    value: cleanHtml,
  });
  let bodies = [newFirstHtmlBody].concat(anno.body);
  bodies = bodies.map(b => EX.checkOneTextualBody(b, editor)).filter(Boolean);
  EX.setOrDeleteMultiProp(anno, 'body', bodies);
  EX.setOrDeleteMultiProp(anno, 'target', anno.target);

  return anno;
};


Object.assign(EX, {

  deleteNonEditableFieldsInplace(a) {
    omitFieldsIfFalsey.forEach(k => deleteIf(a, k, !a[k]));
    Object.keys(a).forEach(k => deleteIf(a, k,
      k.startsWith(':ANNO_FE:')
      || k.startsWith('_')
      || k.startsWith('ubhd:')
      ));
  },

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

  checkOneTextualBody(body/* , editor */) {
    if (!body) { return false; }
    if (body.type && (body.type !== 'TextualBody')) { return body; }
    const { value } = body;
    if (!value) {
      // console.debug('getCleanAnno: discard empty TextualBody:', body);
      return false;
    }

    if (value.includes('<img src="data:')) {
      console.warn('getCleanAnno: Body contains an inline blob image!');
    }
    return body;
  },

});


module.exports = EX;
