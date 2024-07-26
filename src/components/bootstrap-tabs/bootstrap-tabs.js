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
      // console.debug({ switchToNthTab: n });
      const activate = jqSetSingularClass.bind(null, 'active', idx);
      // Highlight the correct tab in BS3:
      activate(refs.tabs.children);
      // Highlight the correct tab in BS4:
      activate(refs.tabs.querySelectorAll('.nav-link'));
      // Show only the relevant pane:
      activate(refs.panesContainer.children);
    },

    switchToTabPaneByVueElem(elem) {
      const tabs = this;
      const panes = tabs.tabPanesAsVueElements();
      let n = 0;
      // console.debug('switchToTabPaneByVueElem:', elem);
      if (elem) {
        panes.some(function compare(p, i) {
          const same = ((p === elem)
            || (p === elem.$parent)
            || (p.$el === elem)
            || (p.$el === elem.parentNode)
            );
          if (same) { n = i + 1; }
          // console.debug('compare:', [same, p, p.$el, elem.$parent]);
          return same;
        });
      }
      tabs.switchToNthTab(n);
    },

  },

  props: {
    helpUrlTemplate:  {type: String, required: true},
    helpUrlManual:    {type: String, required: false},
  },

};
