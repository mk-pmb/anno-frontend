/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
/*

Example config-override file

*/
(function ubhdDiglitServerConfig() {
  'use strict';
  var cfg = window.annoServerCfg;

  cfg.annoEndpoint = 'https://anno.ub.uni-heidelberg.de/anno/';

  cfg.predictMintedDoiUrl = function factory() {
    var s = /^\S+\//,     // Server base URL
      r = /~(?=\d+$)/,    // Version separator
      p = 'https://doi.org/10.11588/anno.diglit.';  // DOI URI prefix
    return function doi(id) { return p + id.replace(s, '').replace(r, '_'); };
  };

}());
