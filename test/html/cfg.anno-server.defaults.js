/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function setDefaultAnnoServers() {
  'use strict';
  var cfg = window.ubhdAnnoApp.configure(), aux = {};
  aux.testDirBaseUrl = (window.document.URL.split(/\?|\#/
    )[0].replace(/\/html\/[\w\.]+$/, '') + '/');

  cfg.annoEndpoint = (function decide() {
    var host = location.hostname, port = (+location.port || 0),
      protoHost = location.protocol + '//' + host;
    if ((port === 80) || (port === 443)) { port = 0; }
    return protoHost + (port ? ':33321/' : '/anno/');
  }());

  cfg.annoByIdUrlPrefix = 'as/author/anno/';
  cfg.annoListSearchPrefix = cfg.annoByIdUrlPrefix + 'by/subject_target/';
  cfg.draftStoreEndpoint = aux.testDirBaseUrl + 'fixtures/drafts/';

  cfg.loginFormUrl = function guessLoginFormUrl(lateCfg) {
    return lateCfg.annoEndpoint.replace(/\w+\/$/, '') + 'session/login';
  };

  cfg.predictMintedDoiUrl = function doiOracleFactory() {
    var s = /^\S+\//,     // Server base URL
      r = /~(?=\d+$)/,    // Version separator
      p = 'https://doi.org/10.82109/anno.frontend.';  // DOI URI prefix
    return function doi(id) { return p + id.replace(s, '').replace(r, '_'); };
  };

}());
