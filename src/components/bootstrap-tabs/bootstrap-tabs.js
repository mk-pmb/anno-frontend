// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const jQuery = require('jquery');

const HelpButton = require('../help-button');


function jqSetSingularClass(cls, idx, list) {
  jQuery(list).removeClass(cls).eq(idx).addClass(cls);
}


module.exports = {
  mixins: [
    require('@/mixin/l10n'),
  ],
  template: require('./bootstrap-tabs.html'),
  style: require('./bootstrap-tabs.scss'),
  components: {
    HelpButton,
  },

  methods: {

    tabPanesAsVueElements() {
      const { panesContainer } = this.$refs;
      return this.$children.filter(c => (c.$el.parentNode === panesContainer));
    },

    switchToNthTab(n) {
      const refs = this.$refs;
      const idx = (+n || 0) - 1;
      const activate = jqSetSingularClass.bind(null, 'active', idx);
      // Highlight the correct tab in BS3:
      activate(refs.tabs.children);
      // Highlight the correct tab in BS4:
      activate(refs.tabs.querySelectorAll('.nav-link'));
      // Show only the relevant pane:
      activate(refs.panesContainer.children);
    },

    switchToTabPaneByVueElem(elem) {
      const panes = this.tabPanesAsVueElements();
      let n = 0;
      if (elem) {
        n = panes.findIndex(p => (
          (p === elem)
          || (p === elem.$parent)
        )) + 1;
      }
      this.switchToNthTab(n);
    },

  },

  props: {
    helpUrlTemplate:  {type: String, required: true},
    helpUrlManual:    {type: String, required: false},
  },

};
