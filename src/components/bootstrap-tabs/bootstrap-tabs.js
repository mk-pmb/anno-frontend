'use strict';
/* eslint-disable global-require */

const eventBus = require('../../event-bus.js');
const HelpButton = require('../help-button');

const { jQuery } = window;


function orf(x) { return x || false; }


module.exports = {
  mixins: [
    require('../../mixin/l10n.js'),
    require('./shadyDomWorkaroundNoHide251130.js'),
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
    function installTabEvent(bsName, evBusEvName) {
      function bsTabEventProxy(domEvent) {
        const ds = domEvent.target.dataset;
        const tabIndex = +ds.index;
        const topic = (ds.topic || '');
        if (evBusEvName === 'editorTabNowShowing') {
          tabMgr.tabWasSwitchedTo(tabIndex);
        }
        const evBusEvInfo = {
          annoAppEventName: evBusEvName,
          bootstrapEventName: bsName,
          tabIndex,
          tabName: ds.name,
          domEvent() { return domEvent; },
          tabTopic: topic,
          ...tabEventApi,
        };
        // console.debug('Anno-Editor tab event:', evBusEvInfo);
        eventBus.$emit(evBusEvName, evBusEvInfo);
        if (topic) { eventBus.$emit(evBusEvName + ':' + topic, evBusEvInfo); }
      }
      jqTabs.on(bsName + '.bs.tab', 'a[data-toggle="tab"]', bsTabEventProxy);
    }
    installTabEvent('show', 'editorTabAboutToShow');
    installTabEvent('shown', 'editorTabNowShowing');
    installTabEvent('hide', 'editorTabAboutToHide');
    installTabEvent('hidden', 'editorTabNowHidden');
    tabMgr.switchToNthTab(1);
  },


  methods: {

    tabClicked(evt) {
      const tabMgr = this;
      if (evt.target.parentNode.parentNode !== tabMgr.$refs.tabs) { return; }
      // console.debug(tabMgr, 'tabClicked', evt.target.dataset);
      setTimeout(tabMgr.shadyDomWorkaroundNoHide251130, 50);
    },

    tabPanesAsVueElements() {
      const tabMgr = this;
      const ctnr = tabMgr.$refs.panesContainer;
      const r = [];

      const maybeTabDef = function maybeTabDef(depth, c) {
        if (depth > 5) { return; }
        if (c.$el.parentNode !== ctnr) { return; }
        if (c.isBootstrapTab) { return r.push(c); }
        maybeTabDef.dive(depth + 1, c);
      };
      maybeTabDef.dive = function dive(depth, el) {
        el.$children.forEach(c => maybeTabDef(depth, c));
      };
      maybeTabDef.dive(0, tabMgr);

      r.byTopic = Object.create(null);
      r.forEach(function each(c, i) {
        c.tabIndex = i;
        if (c.topic) { r.byTopic[c.topic] = c; }
      });
      return r;
    },

    getTabButtons(nth) {
      const b = this.$refs.tabs.querySelectorAll('.nav-link');
      const i = (+nth || 0);
      if (i >= 1) { return orf(b[i - 1]); }
      return Array.from(b);
    },

    switchToNthTab(nth) {
      jQuery(this.getTabButtons(nth)).click();
      // jQuery(some_falsey_argument).click() is a safe no-op.
    },

    getTabButtonByDataSetProp(key, val) {
      return orf(this.getTabButtons().find(t => t.dataset[key] === val));
    },

    switchToTabByDataSetProp(key, val) {
      jQuery(this.getTabButtonByDataSetProp(key, val)).click();
    },

    tabWasSwitchedTo(idx) {
      if (!Number.isFinite(idx)) {
        const e = ('tabWasSwitchedTo: '
          + 'New tab index must be a finite number, not '
          + (typeof idx) + ' ' + String(idx));
        throw new TypeError(e);
      }
      const tabMgr = this;
      tabMgr.currentActiveTabIndex = idx;
      const panes = tabMgr.tabPanesAsVueElements();
      const activePane = orf(panes[idx]);
      const { name, topic } = activePane;
      tabMgr.currentActiveTabName = name;
      tabMgr.currentActiveTabTopic = topic;
      panes.forEach((c) => { c.active = (c.tabIndex === idx); });
      // console.debug('tabWasSwitchedTo', { idx, name, topic, activePane });
    },

    switchToTabByVueElem(elem) {
      const tabMgr = this;
      const panes = tabMgr.tabPanesAsVueElements();
      let n = 0;
      // console.debug('switchToTabByVueElem:', elem);
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
