/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function prepareTargetExamples() {
  'use strict';
  var cfg = window.ubhdAnnoApp.configure, st = {};
  window.annoTestSetTarget = st;
  function stDef(f) { st[f.name] = f; }

  stDef(function wikiCommons(w, h, imgSubUrl) {
    var baseUrl = 'https://upload.wikimedia.org/wikipedia/commons/';
    cfg({
      targetImage: baseUrl + imgSubUrl,
      targetThumbnail: baseUrl + 'thumb/' + imgSubUrl + '/200px-_.png',
      targetImageWidth: w,
      targetImageHeight: h,
    });
  });

  stDef(function uniHdKarlLange1896() {
    st.wikiCommons(986, 732,
      'd/da/Universitaet_Heidelberg_%28Karl_Lange%29_1896.jpg');
  });

  st.ubHdDigLitBaseUrl = 'https://digi.ub.uni-heidelberg.de/diglit/';

  stDef(function ubHdDigLit(w, h, subUrl, origFileName, baseUrl) {
    var src = (baseUrl || st.ubHdDigLitBaseUrl) + subUrl, t;
    t = ('https://digi.ub.uni-heidelberg.de/iiif/2/'
      + subUrl.replace(/\/\w+$/, '') + ':' + origFileName
      + '/%ir/full/0/default.jpg');
    cfg({
      targetSource: src,
      targetImage: src + '/_image',
      targetImageWidth: w,
      targetImageHeight: h,
      targetThumbnail: src + '/_thumb_image',
      iiifUrlTemplate: t,
    });
  });

  stDef(function ubHdJournal(zsKuerzel, submissionId) {
    var t = 'https://journals.ub.uni-heidelberg.de/index.php/'
      + zsKuerzel + '/article/view/' + submissionId;
    cfg({ targetSource: t });
  });

}());
