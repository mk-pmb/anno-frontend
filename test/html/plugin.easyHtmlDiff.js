/* -*- coding: UTF-8, tab-width: 2 -*- */
'use strict';
(function setup() {
  /* global define */

  const EX = function preparePluginEasyHtmlDiff(pluginCtx) {
    const { nwdiff } = pluginCtx.injected;
    if (typeof nwdiff !== 'function') {
      console.debug('preparePluginEasyHtmlDiff: injected:', pluginCtx.injected);
      throw new TypeError('preparePluginEasyHtmlDiff: Bad Injection.');
    }
    const f = function easyHtmlDiff(before, after) {
      const b = EX.defuseInput(before);
      const a = EX.defuseInput(after);
      return EX.diff2html(nwdiff(b, a, EX.nwdiffOpt));
    };
    return f;
  };

  EX.injectModules = {
    nwdiff: 'nwdiff',
  };

  EX.nwdiffOpt = {
    color: false,
    delimiters: true,
    startInsert:  '\x06', // ack
    endInsert:    '\x18\x06', // can + ack
    startDelete:  '\x7F', // del
    endDelete:    '\x18\x7F', // can + del
  };

  EX.defuseInput = function defuse(t) {
    return String(t || '').replace(/\x06|\x18|\x7F/g, '');
  };

  EX.diff2html = function diff2html(d) {
    let h = d;
    h = h.replace(/&/g, '&amp;');
    h = h.replace(/</g, '&lt;');
    h = h.replace(/>/g, '&gt;');
    h = h.replace(/'/g, '&#39;');
    h = h.replace(/"/g, '&quot;');
    h = h.replace(/\x06/g, '<ins>');
    h = h.replace(/\x7F/g, '<del>');
    h = h.replace(/\x18<(ins|del)>/g, '</$1>');
    h = h.replace(/\xA0/g, ' ');
    h = h.replace(/\n/g, '<i>¶</i><br>\n');
    h = h.replace(/ (<|\n|$)/g, '&nbsp;$1');
    h = h.replace(/(^|>|\n) /g, '$1&nbsp;');
    h = h.replace(/ {2}/g, '&nbsp; ');
    return h;
  };


  (function unifiedExport(e) {
    const d = ((typeof define === 'function') && define);
    if (d && d.amd) { d(function f() { return e; }); }
    const m = ((typeof module === 'object') && module);
    if (m && m.exports) { m.exports = e; }
    // eslint-disable-next-line no-undef
    const w = ((typeof window === 'object') && window);
    const a = w && w.ubhdAnnoApp;
    if (a && a.getPluginFactories) { a.getPluginFactories().easyHtmlDiff = e; }
  }(EX));
}());
