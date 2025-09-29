/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function decideTargetByQueryString() {
  'use strict';
  var cfg = window.ubhdAnnoApp.configure(), q = {},
    s = window.annoTestSetTarget;
  location.search.replace(/[\?&](\w+)=([\w\.\-\~]*)/g,
    function r(m, k, v) { q[k] = m && v; });

  if (q.cmp1) {
    cfg.initAppMode = 'cmp';
    cfg.initCmpBaseId = q.cmp1;
    if (q.cmp2) {
      cfg.initCmpSecondarySideVersionNumber = (+q.cmp2 || 0);
    } else {
      cfg.initCmpLayout = 'only';
    }
  }
  if (q.approval) {
    cfg.initCmpApprovalMode = true; // effective only with &cmp1=…
    cfg.annoByIdUrlPrefix = 'as/approver/anno/';
  }

  switch (q.t) {
  case '31mh':
    cfg.initAppMode = 'cmp';
    cfg.initCmpBaseId = 'VSdzSBZpRBqH6FrA2jx_Jg';
    cfg.initCmpPrimarySideVersionNumber = 3;
    return s.ubHdDigLit(1676, 2622, 'lange1937_12_06/0005', '004.jpg');
  case 'famw': // Finanzamt Moabit-West, Auktion Hans W. Lange 12.-13.5.1942
    cfg.purlId = 'O2ANg_gMTd2wkQumHBEIcQ';
    return s.ubHdDigLit(1676, 2622, 'lange1942_05_12/0005', '004.jpg');
  case 'alteuni':
    return s.uniHdKarlLange1896();
  case 'at1':
    cfg.targetMetaData = { 'dc:title': 'Seite 1 von Anno-Test-Projekt' };
    return s.ubHdDigLit(1996, 3453, 'annotationen_test/0001');
  case 'engel':
    // One of our few old annotation with lots of versions.
    cfg.initAppMode = 'cmp';
    cfg.initCmpBaseId = 'EOEXrHgLT3GfoXYnQ6es6g';
    cfg.initCmpPrimarySideVersionNumber = 4;
    return s.ubHdDigLit(1528, 2353, 'sauer1941/0012', '219.jpg');
  case 'esau':
    return s.ubHdDigLit(1233, 1901, 'cpg148/0074', '033v.jpg');
  case 'kdmkk':
    return s.ubHdDigLit(1611, 2469, 'kraus1924/0026', '011.jpg');
  case 'perl':
    return s.ubHdDigLit(1765, 3044, 'perl1937_03_18/0036', '034.jpg');
  case 'wat':
    return s.ubHdJournal('arch-inf', 69356);
  case 'wg15':
    return s.ubHdDigLit(1494, 2348, 'cpg389/0015', '002r.jpg');
  case 'wg55':
    return s.ubHdDigLit(1494, 2348, 'cpg389/0055', '002r.jpg');
  case 'petau-smk': // Petau, Paul: Satyressa mit Knaben in Vorderansicht
    cfg.purlId = 'cb4d76aa-aec9-4668-9bae-6dc012caa1ab';
    // ^-- Leo's favorite example for a multi target anno accross books.
    return s.ubHdDigLit(1498, 2217, 'petau1757/0019', '00_Tafel_04.jpg');
  }
  return s.uniHdKarlLange1896();
}());
