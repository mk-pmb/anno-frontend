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

  function validateList(func, listName, items) {
    if (!items) { return; }

    function complain(idx, item, msg) {
      if (!msg) { return; }
      let trace = listName + ': #' + (idx + 1);
      const descr = (item['dc:title'] || item.value || '');
      if (descr) { trace += ' (' + JSON.stringify(descr) + ')'; }
      problems.push(trace + ': ' + l10n(msg));
    }

    [].concat(items).forEach(function check(item, idx) {
      func(item, complain.bind(null, idx, item), idx);
    });
  }

  validateList(function checkOneTarget(tgt, complain) {
    if (tgt[':ANNO_FE:unconfirmed']) {
      complain('generic_list_item_pls_confirm_or_remove');
    }
  }, l10n('targets_list_headline'), anno.target);

  let firstTextualBody = false;
  validateList(function checkOneBody(body, complain) {
    if ((!firstTextualBody) && (body.type === 'TextualBody')) {
      firstTextualBody = body;
    }
    if (body.purpose === 'classifying') {
      complain(vali.verifyClassifyingBody(body));
    }
  }, l10n('annofield_body'), anno.body);

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
