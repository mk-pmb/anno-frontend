// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const loMapValues = require('lodash.mapvalues');

const validateEditorFields = require('../anno-editor/validateEditorFields.js');

const nicerAnnoJson = require('./nicerAnnoJson.js');


function contextAsFirstArg(func) {
  return function proxy(...args) { return func(this, ...args); };
}


module.exports = {

  template: require('./debug.html'),
  style: require('./debug.scss'),

  mixins: [
    require('../../mixin/l10n.js'),
  ],

  props: {
    editorApi: Object,
  },

  methods: {

    nicerAnnoJson,

    ...loMapValues({
      validateEditorFields,
    }, contextAsFirstArg),

    updateAcl(btn) {
      this.$store.commit((btn.a ? 'UPDATE_ACL' : 'EMPTY_ACL'), btn.a);
    },

    dumpAppConfig() {
      const u = undefined;
      const cfg = {
        ...this.$store.state,
        acl: u,
        annotationList: u,
        editing: u,
        localizations: u,
      };
      Object.keys(cfg).forEach(function optimize(key) {
        const val = cfg[key];
        if (val === undefined) { return delete cfg[key]; }
      });
      return cfg;
    },

  },

};
