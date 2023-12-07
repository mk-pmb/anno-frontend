/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function () {
  'use strict';
  var cfg = {}, host = location.hostname, port = (+location.port || 0),
    protoHost = location.protocol + '//' + host, testDirBaseUrl;
  if ((port === 80) || (port === 443)) { port = 0; }

  cfg.annoEndpoint = protoHost + (port ? ':33321/' : '/anno/');
  cfg.annoByIdUrlPrefix    = 'as/author/anno/';
  cfg.annoListSearchPrefix = cfg.annoByIdUrlPrefix + 'by/subject_target/';

  testDirBaseUrl = (window.document.URL.split(/\?|\#/
    )[0].replace(/\/html\/[\w\.]+$/, '') + '/');
  cfg.draftStoreEndpoint = testDirBaseUrl + 'fixtures/drafts/';
  cfg.loginFormUrl = () => (cfg.annoEndpoint.replace(/\w+\/$/, '')
    + 'session/login');

  cfg.predictMintedDoiUrl = function factory() {
    var s = /^\S+\//,     // Server base URL
      r = /~(?=\d+$)/,    // Version separator
      p = 'https://doi.org/10.82109/anno.frontend.';  // DOI URI prefix
    return function doi(id) { return p + id.replace(s, '').replace(r, '_'); };
  };

  (function compile() {
    var l = document.createElement('a');
    cfg.resolveURL = function resolveURL(url) {
      l.href = url;
      return l.href;
    };
  }());

  cfg.fixBogusRemoteAnnoEndpoint = function (badEndpointRgx) {
    if (!badEndpointRgx) { badEndpointRgx = /^\S+?\/anno\//; }
    var r = cfg.resolveURL;
    function fix(u) { return u.replace(badEndpointRgx, r(cfg.annoEndpoint)); }
    cfg.customSaveLegacyPreArgsFactories = {
      reply: function reply(anno) { return [fix(anno.replyTo)]; },
      revise: function revise(anno) { return [fix(anno.id)]; },
    };
  };

  window.annoServerCfg = cfg;
}());
