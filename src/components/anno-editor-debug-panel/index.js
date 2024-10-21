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

    configureApp(btn) { this.$store.commit('FLAT_UPDATE_APP_STATE', btn.a); },

    getEditorRef() {
      // debug panel -> debug tab -> tabs list -> editor
      return this.$parent.$parent.$parent;
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

    replaceWithEditorPropRawHtml(evt) {
      const dest = evt.target.parentNode;
      const key = dest.parentNode.dataset.editorProp;
      const val = this.getEditorRef()[key];
      // console.debug('replaceWithEditorPropRawHtml:', { dest, key, val });
      let html = String(val);
      html = (html ? '<code class="code-diff">' + html + '</div>'
        : '<i>(empty)</i>');
      dest.innerHTML = html;
    },

  },

};
