// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function orf(x) { return x || false; }


const vali = function validateEditorFields(onBehalfOfVueComponent, anno) {
  // console.debug('validateEditorFields', anno, { onBehalfOfVueComponent });
  // onBehalfOfVueComponent.$el.debugValidate = () => onBehalfOfVueComponent;
  const problems = [];
  let { l10n } = onBehalfOfVueComponent;
  if (!l10n) {
    l10n = String;
    problems.push('Validation component should provide l10n');
  }
  function mf(x) { problems.push(mf.pre + l10n(x)); }
  mf.pre = l10n('missing_required_field');

  if (!anno['dc:title']) { mf('annofield_title'); }
  if (!anno.rights) { mf('License'); }
  if (!orf(anno.creator).id /* Agent ID */) { mf('author_identity'); }

  let firstTextualBody = false;
  [].concat(anno.body || []).forEach(function verifyBody(body) {
    let problem;
    if ((!firstTextualBody) && (body.type === 'TextualBody')) {
      firstTextualBody = body;
    }
    if (body.purpose === 'classifying') {
      problem ||= vali.verifyClassifyingBody(body);
    }
    if (!problem) { return; }
    const descr = (body['dc:title'] || body.value || '');
    problems.push(l10n(problem) + ' ' + JSON.stringify(descr));
  });

  if (firstTextualBody.value) {
    if (!anno['dc:language']) { mf('text_body_language'); }
  }

  if (!problems.length) { return true; }
  const ind = '• ';
  const msg = ind + problems.join('\n' + ind);
  window.alert(msg); // eslint-disable-line no-undef,no-alert
  return false;
};



Object.assign(vali, {

  verifyClassifyingBody(body) {
    if (!body.source) { return 'semtag_no_source_for'; }
    return '';
  },


});


module.exports = vali;
