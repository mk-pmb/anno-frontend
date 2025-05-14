// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const fixupReplyMode = require('./fixupReplyMode.js');


function orf(x) { return x || false; }


const vali = function validateEditorFields(editor, anno) {
  const problems = [];
  const appCfg = orf(orf(editor.$store).state);
  let { l10n } = editor;
  if (!l10n) {
    l10n = String;
    problems.push('Validation component should provide l10n');
  }
  function mf(x) { problems.push(mf.pre + l10n(x)); }
  mf.pre = l10n('missing_required_field');

  if (!anno['dc:title']) { mf('annofield_title'); }
  if (!anno.rights) { mf('annofield_rights'); }
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

  if (appCfg.editMode) {
    const vueStoreUpdates = fixupReplyMode(appCfg, anno);
    if (vueStoreUpdates) {
      editor.$store.commit('FLAT_UPDATE_EDITOR_ANNO', vueStoreUpdates);
      problems.push(l10n('reply_target_restored'));
    }
  }

  if (editor.previewWarnings.found) {
    if (editor.activeTabTopic !== 'preview') {
      problems.push(l10n('preview:sus:mustView'));
    }
  }

  if (!problems.length) { return true; }
  let msg = '• ';
  msg += problems.join('\n' + msg);

  if (appCfg.uiDebugMode) {
    msg += ('\n\n<uiDebugMode> Enter "!" to '
      + 'ignore and continue despite validation failure');
    return (window.prompt(msg, '') === '!');
  }

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
