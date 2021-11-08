﻿/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function () {
  'use strict';
  var jq = window.jQuery, cfg = {

    exportAppAsWindowProp: 'annoApp',
    // ^- In production, rather save the result of displayAnnotations.

    iiifUrlTemplate: ('http://iiif.anno.test/someProjectName'
      + ':_image/%ir/full/0/default.jpeg'),

    uiDebugMode: true,
    acl: {
      '*': { '*': true },
      // 'debug:skipFetchAcl': true,
      // 'debug:override:isLoggedIn': true,
    },

    events: {},
  };

  cfg.targetSource = ('http://anno.test/' + location.pathname.replace(/^\S+\//,
    '').replace(/\.\S+$/, ''));

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

    ubHdDigLit: function (w, h, subUrl, origFileName) {
      var src = 'https://digi.ub.uni-heidelberg.de/diglit/' + subUrl;
      cfg.targetSource = src;
      cfg.targetImage = src + '/_image';
      cfg.targetImageWidth = w;
      cfg.targetImageHeight = h;
      cfg.targetThumbnail = src + '/_thumb_image';
      cfg.iiifUrlTemplate = ('https://digi.ub.uni-heidelberg.de/iiif/2/'
        + subUrl.replace(/\/\w+$/, '') + ':' + origFileName
        + '/%ir/full/0/default.jpg');
    },

  };

  // cfg.setTarget.uniHdKarlLange1896();
  // cfg.setTarget.ubHdDigLit(1494, 2348, 'cpg389/0015', '002r.jpg');
  cfg.setTarget.ubHdDigLit(1494, 2348, 'cpg389/0055', '022r.jpg');

  jq().ready(function registerToolbarButtons() {
    var btn = window.testUtil.testButtonsToolbar.addBtn,
      fixt = window.annotations;
    btn(fixt && 'Load fixture annotations', function appendFixtureAnnots() {
      // window.annoApp.$store.commit('CHANGE_ACL', { '*': { '*': true } });
      function append(state) {
        var alSt = state.annotationList;
        alSt.list = alSt.list.concat(fixt);
      }
      window.annoApp.$store.commit('INJECTED_MUTATION', [append]);
    });
  });

  // cfg.events.appReady = function ready() {};

  window.annoTestCfg = cfg;
}());
