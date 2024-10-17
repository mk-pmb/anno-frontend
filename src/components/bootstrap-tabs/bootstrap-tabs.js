// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const jQuery = require('jquery');

const eventBus = require('../../event-bus.js');
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

  data() {
    return {
      currentActiveTabIndex: -1,
      currentActiveTabName: '',
      currentActiveTabTopic: '',
    };
  },

  props: {
    helpUrlTemplate:  { type: String, required: true },
    helpUrlManual:    { type: String, required: false },
  },


  mounted() {
    const tabMgr = this;
    const tabEventApi = {
      tabMgr: Object.bind(null, tabMgr),
      tabPaneVue() { return tabMgr.tabPanesAsVueElements(this.tabIndex); },
    };
    const jqTabs = jQuery(tabMgr.$refs.tabs);
    function installTabEvent(bsName, evBusName) {
      function bsTabEventProxy(domEvent) {
        const ds = domEvent.target.dataset;
        const tabIndex = ds.index;
        const topic = (ds.topic || '');
        if (evBusName === 'editorTabNowShowing') {
          tabMgr.currentActiveTabIndex = tabIndex;
          tabMgr.currentActiveTabName = ds.name;
          tabMgr.currentActiveTabTopic = topic;
        }
        const evBusEvent = {
          annoAppEventName: evBusName,
          bootstrapEventName: bsName,
          tabIndex,
          tabName: ds.name,
          domEvent() { return domEvent; },
          tabTopic: topic,
          ...tabEventApi,
        };
        // console.debug('Anno-Editor tab event:', evBusEvent);
        eventBus.$emit(evBusName, evBusEvent);
        if (topic) { eventBus.$emit(evBusName + ':' + topic, evBusEvent); }
      }
      jqTabs.on(bsName + '.bs.tab', 'a[data-toggle="tab"]', bsTabEventProxy);
    }
    installTabEvent('show', 'editorTabAboutToShow');
    installTabEvent('shown', 'editorTabNowShowing');
    installTabEvent('hide', 'editorTabAboutToHide');
    installTabEvent('hidden', 'editorTabNowHidden');
  },


  methods: {

    tabPanesAsVueElements() {
      const ctnr = this.$refs.panesContainer;
      const r = this.$children.filter(c => (c.$el.parentNode === ctnr));
      r.forEach(function updateIndex(c, i) { c.tabIndex = i; });
      return r;
    },

    switchToNthTab(n) {
      const tabMgr = this;
      const idx = (+n || 0) - 1;
      // console.debug({ switchToNthTab: n });
      const activate = jqSetSingularClass.bind(null, 'active', idx);
      // Highlight the correct tab in BS3:
      activate(tabMgr.$refs.tabs.children);
      // Highlight the correct tab in BS4:
      activate(tabMgr.$refs.tabs.querySelectorAll('.nav-link'));
      // Show only the relevant pane:
      activate(tabMgr.$refs.panesContainer.children);
      tabMgr.currentActiveTabIndex = idx;
    },

    switchToTabPaneByVueElem(elem) {
      const tabMgr = this;
      const panes = tabMgr.tabPanesAsVueElements();
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
      tabMgr.switchToNthTab(n);
    },

  },

};
