/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function () {
  'use strict';
  var cfg = window.annoTestCfg;

  (function setTargetFromUrl() {
    var s = cfg.setTarget, q = {};
    location.search.replace(/[\?&](\w+)=([\w\.\-\~]*)/g,
      function (m, k, v) { q[k] = m && v; });
    switch (q.t) {
    case 'alteuni':
      return s.uniHdKarlLange1896();
    case 'engel':
      cfg.initAppMode = 'cmp';
      cfg.initCmpBaseId = 'EOEXrHgLT3GfoXYnQ6es6g';
      cfg.initCmpPrimarySideVersionNumber = 4;
      return s.ubHdDigLit(1528, 2353, 'sauer1941/0012', '219.jpg');
    case 'esau':
      return s.ubHdDigLit(1233, 1901, 'cpg148/0074', '033v.jpg');
    case 'siggi':
      cfg.initAppMode = 'cmp';
      cfg.initCmpApprovalMode = true;
      cfg.initCmpBaseId = (q.a || 'c4e8663e-9eef-41e3-b138-bda2c862e195~1');
      return s.ubHdDigLit(1528, 2353, 'sauer1941/0012', '219.jpg');
    case 'wat':
      return s.ubHdJournal('arch-inf', 69356);
    case 'wg15':
      return s.ubHdDigLit(1494, 2348, 'cpg389/0015', '002r.jpg');
    case 'wg55':
      return s.ubHdDigLit(1494, 2348, 'cpg389/0055', '002r.jpg');
    }
    return s.uniHdKarlLange1896();
  }());

}());
