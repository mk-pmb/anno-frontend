// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function orf(x) { return x || false; }


const vali = function validateEditorFields(onBehalfOfVueComponent) {
  console.debug('validateEditorFields', onBehalfOfVueComponent);
  window.onBehalf = onBehalfOfVueComponent;
  const {
    $store,
  } = onBehalfOfVueComponent; // <-- May or may not be the editor
  let {
    l10n,
  } = onBehalfOfVueComponent;

  const problems = [];
  if (!l10n) {
    l10n = String;
    problems.push('Validation component should provide l10n');
  }
  function mf(x) { problems.push(mf.pre + l10n(x)); }
  mf.pre = l10n('missing_required_field');

  const anno = $store.state.editing;
  if (!anno.title) { mf('annofield_title'); }
  if (!anno.rights) { mf('License'); }
  if (!orf(anno.creator).id /* Agent ID */) { mf('author_identity'); }

  [].concat(anno.body || []).forEach(function verifyBody(body) {
    let problem;
    if (body.purpose === 'classifying') {
      problem ||= vali.verifyClassifyingBody(body);
    }
    if (!problem) { return; }
    problems.push(l10n(problem) + ' ' + JSON.stringify(body.value || ''));
  });

  if (!problems.length) { return true; }
  const ind = '• ';
  const msg = ind + problems.join('\n' + ind);
  window.alert(msg); // eslint-disable-line no-undef,no-alert
  return false;
};



Object.assign(vali, {

  verifyClassifyingBody(body) {
    if (!body.source) { return 'semtag_no_source_for'; }
    const { label, value } = body;
    if (label && (label !== value)) { return 'semtag_rogue_label'; }
    return '';
  },


});


module.exports = vali;
