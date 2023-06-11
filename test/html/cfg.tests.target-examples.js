/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function () {
  'use strict';
  var cfg = window.annoTestCfg;

  cfg.setTarget = {

    wikiCommons: function (w, h, imgSubUrl) {
      var baseUrl = 'https://upload.wikimedia.org/wikipedia/commons/';
      cfg.targetImage = baseUrl + imgSubUrl;
      cfg.targetThumbnail = baseUrl + 'thumb/' + imgSubUrl + '/200px-_.png';
      cfg.targetImageWidth = w;
      cfg.targetImageHeight = h;
    },

    uniHdKarlLange1896: function () {
      cfg.setTarget.wikiCommons(986, 732,
        'd/da/Universitaet_Heidelberg_%28Karl_Lange%29_1896.jpg');
    },

    ubHdDigLit: function (w, h, subUrl, origFileName, baseUrl) {
      var src = (baseUrl || cfg.diglitBaseUrl) + subUrl;
      cfg.targetSource = src;
      cfg.targetImage = src + '/_image';
      cfg.targetImageWidth = w;
      cfg.targetImageHeight = h;
      cfg.targetThumbnail = src + '/_thumb_image';
      cfg.iiifUrlTemplate = ('https://digi.ub.uni-heidelberg.de/iiif/2/'
        + subUrl.replace(/\/\w+$/, '') + ':' + origFileName
        + '/%ir/full/0/default.jpg');
    },

    ubHdJournal: function (zsKuerzel, submissionId) {
      cfg.targetSource = ('https://journals.ub.uni-heidelberg.de/index.php/'
        + zsKuerzel + '/article/view/' + submissionId);
    },

  };

}());
