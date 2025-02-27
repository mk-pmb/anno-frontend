// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function orf(x) { return x || false; }
function countKeys(x) { return (x && +Object.keys(x).length) || 0; }


const EX = {

  asEditorMixin() {
    return {
      methods: {
        updatePreviewWarnings: EX.updateNow,
        compilePreviewWarningsListForTemplating: EX.renderAsVueList,
      },
    };
  },


  initializeDataApi() {
    const da = {
      getLinterFuncs() { return EX.linterFuncs; },
    };
    da.reset = function reset() {
      da.found = 0;
      da.ignored = {};
    };
    da.reset();
    return da;
  },


  linterFuncs: {
  },


  updateNow() {
    const editor = this;
    const bodyHtml = editor.cachedSanitizedHtmlBodyValue;
    const ignored = orf(editor.previewWarningsIgnored);
    const found = {};
    Object.values(EX.linterFuncs).forEach(
      lint => Object.assign(found, lint(bodyHtml, ignored)));
    editor.previewWarnings.found = countKeys(found) && found;
  },


  renderAsVueList() {
    const editor = this;
    const { found } = editor.previewWarnings;
    if (!found) { return []; }
    const list = Object.keys(found).map(function fmt(key, idx) {
      const val = orf(found[key]);
      return { idx, key, val };
    });
    return [list];
  },





};


module.exports = EX;
