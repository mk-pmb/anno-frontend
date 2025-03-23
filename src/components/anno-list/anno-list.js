// -*- coding: utf-8, tab-width: 2 -*-
/*
 * ### anno-list
 *
 * List of [anno-viewer](#anno-viewer) components.
 *
 * #### Methods
 *
 * ##### `collapseAll(state)`
 *
 * - `@param {String} state` Either `show` or `hide`
 *
 */
'use strict';

const applyDebugCheats = require('../../cheats.js');
const eventBus = require('../../event-bus.js');
const HelpButton = require('../help-button');
const sessionStore = require('../../browserStorage.js').session;
const sorting = require('./sort/index.js');


function orf(x) { return x || false; }


/* Install event listener for debugging with autoEmitQ, e.g.
  window.name = 'ubhdAnnoApp:autoEmitQ:' + JSON.stringify([
    '-creator', '-rights'].map(c => ['list:sort', c])); /* */
eventBus.$on('list:sort', sorting.setPrimarySortCriterion);



/* eslint-disable global-require */
module.exports = {

  template: require('./anno-list.html'),
  style: require('./anno-list.scss'),

  mixins: [
    require('../../checkAclAuth.js').vueMixin,
    require('../../mixin/bootstrap-compat.js'),
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
  ],

  debugCheatsReport() { return applyDebugCheats.report; },

  components: {
    HelpButton,
  },

  data() {
    return {
      collapsed: (sessionStore.get('anno-list:collapsed') !== false),
      debugCheatsReportCache: '',
    };
  },

  mounted() {
    const annoList = this;
    annoList.collapseAll('apply');
    eventBus.$on('annoListReplaced', () => {
      if (!annoList.verifySorted()) {
        /* verifySorted had to sort just now, which should have fired another
          annoListReplaced event already => abondon this one. */
        return;
      }
      annoList.collapseAll('apply')
    });

    const sortedByPref = sessionStore.get('anno-list:sortedBy');
    if (sortedByPref) { sorting.setPrimarySortCriterion(sortedByPref); }

    // When permissions have been updated, force an update.
    eventBus.$on('updatedPermissions', () => annoList.$forceUpdate());

    const { state } = annoList.$store;

    // Initially open the list if there was an annotation persistently adressed
    const expandPurlAnno = state.purlAnnoInitiallyOpen && state.purlId;
    if (expandPurlAnno) {
      eventBus.$once('annoListReplaced', () => setTimeout(() => {
        console.debug('anno-list: Emitting expandAnno for', [expandPurlAnno]);
        eventBus.$emit('expandAnno', expandPurlAnno);
      }, 1));
    }
  },
  computed: {
    annos() { return this.$store.state.annotationList.list; },

    purlId() { return this.$store.state.purlId; },
    numberOfAnnotations() { return this.$store.getters.numberOfAnnotations; },

    isLoggedIn() { return this.$store.getters.isLoggedIn; },
    userSessionInfo() { return orf(this.$store.state.userSessionInfo); },

    logoutButtonVisible() {
      return Boolean(this.userSessionInfo.userId
        && this.$store.state.logoutPageUrl);
    },

    logoutButtonUrl() {
      const ep = this.$store.state.logoutPageUrl;
      if (ep === 'fake://insecure') { return ''; }
      return ep;
    },

  },


  methods: {

    logoutButtonClicked() {
      window.error(':TODO: Confirm logout');
      // UBHD GitLab issue #10
    },

    collapseAll(action) {
      const annoList = this;
      let st = annoList.collapsed;
      if (action === 'hide') { st = true; }
      if (action === 'show') { st = false; }
      if (action === 'toggle') { st = !st; }
      annoList.collapsed = st;
      // console.debug('collapseAll: ', { action });
      if (action !== 'apply') { sessionStore.put('anno-list:collapsed', st); }

      const verb = (st ? 'hide' : 'show');
      annoList.$children.forEach(function maybeCollapse(viewer) {
        if (viewer.collapse) { viewer.collapse(verb); }
      });
    },

    tryRenewSession() {
      console.debug('tryRenewSession: stub!');
    },

    userSessionDropDownToggled() {
      applyDebugCheats();
      this.debugCheatsReportCache = applyDebugCheats.report;
    },


    verifySorted() { return sorting.verifySorted(this); },


    generateSortOptionsMenuItems() {
      const az = { invert: false, letterOrder: 'az', plusMinus: '+' };
      const za = { invert: true, letterOrder: 'za', plusMinus: '-' };
      const menu = [];
      const curCrit = sorting.currentCriteriaAndWheterhInverted;
      const [ccName] = Object.keys(curCrit);
      const ccInvert = curCrit[ccName];
      const mme = function makeMenuEntry(name, order) {
        const isCC = ((name === ccName) && (order.invert === ccInvert));
        const ent = { name, ...order };
        if (isCC) { ent.isCurrentPrimaryCriterion = true; }
        menu.push(ent);
      };
      Object.keys(sorting.availableCriteria).forEach(
        name => mme(name, az) + mme(name, za));
      return menu;
    },


    setPrimarySortCriterionAndSort(spec) {
      const annoList = this;
      annoList.collapseAll('hide');
      const ssKey = 'anno-list:sortedBy';
      if (spec) {
        const ccStr = sorting.setPrimarySortCriterion(spec);
        sessionStore.put(ssKey, ccStr);
      } else {
        sorting.restoreCriteriaStackFromString('');
        sessionStore.del(ssKey);
      }
      annoList.verifySorted();
    },





  },

};
