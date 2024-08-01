/* -*- coding: UTF-8, tab-width: 2 -*- */
'use strict';
(function setup() {
  /* global define */

  function noClosingSlash(s) { return s.replace(/\s*\/?$/, ''); }

  const EX = function preparePluginSanitizeHtml(pluginCtx) {
    const { sani } = pluginCtx.injected;
    if (typeof sani !== 'function') {
      console.debug('preparePluginSanitizeHtml: injected:', pluginCtx.injected);
      throw new TypeError('preparePluginSanitizeHtml: Bad Injection.');
    }
    const s = function sanitizeHtml(dirtyHTML) {
      let h = sani(dirtyHTML, s.rules);
      h = h.replace(/<(?:img|br)[^<>]+/g, noClosingSlash);
      h = h.replace(/\u00A0/g, '&nbsp;');
      // h = h.replace(/&#34;/g, '&quot;');
      return h;
    };
    s.rules = JSON.parse(JSON.stringify(EX.rules));
    return s;
  };

  EX.injectModules = {
    sani: 'sanitize-html',
  };

  EX.okEmptyHtmlTags = {
    block: [
      'li',
      'ol',
      'p',
      'ul',
    ],
    inline: [
      'br',
      'em',
      'i',
      's',
      'strong',
      'sub',
      'sup',
      'u',
    ],
    all() { return [...this.block, ...this.inline]; },
  };


  EX.superset = function superset(...args) {
    const s = {};
    (function add(a) {
      if (!a) { return; }
      if (a.forEach) { return a.forEach(add); }
      a.replace(/\S+/g, function one(x) { s[x] = true; });
    }(args));
    return Object.keys(s).sort();
  };


  EX.rules = (function compileRules() {
    const r = {
      allowedAttributes: {
        '*': ['data-*'],
        a: ['href', 'id', 'name'],
        img: ['alt', 'src'],
        small: [],
      },
      allowedClasses: {
        'p': ['text-center', 'text-justify', 'text-left', 'text-right'],
      },
      allowedSchemes: ['http', 'https'],
      allowProtocolRelative: false,
      disallowedTagsMode: 'escape',
      nestingLimit: 8,
    };
    r.allowedTags = EX.superset(Object.keys(r.allowedAttributes),
      EX.okEmptyHtmlTags.all());
    r.allowedSchemesByTag = { img: EX.superset(r.allowedSchemes, 'data') };
    return r;
  }());




  (function unifiedExport(e) {
    const d = ((typeof define === 'function') && define);
    if (d && d.amd) { d(function f() { return e; }); }
    const m = ((typeof module === 'object') && module);
    if (m && m.exports) { m.exports = e; }
    // eslint-disable-next-line no-undef
    const w = ((typeof window === 'object') && window);
    const a = w && w.ubhdAnnoApp;
    if (a && a.getPluginFactories) { a.getPluginFactories().sanitizeHtml = e; }
  }(EX));
}());
