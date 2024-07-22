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

const eventBus = require('../../event-bus.js');
const HelpButton = require('../help-button');
const sessionStore = require('../../browserStorage.js').session;


function orf(x) { return x || false; }


/* eslint-disable global-require */
module.exports = {

  template: require('./anno-list.html'),
  style: require('./anno-list.scss'),

  mixins: [
    require('../../checkAclAuth.js').vueMixin,
    require('../../mixin/api.js'),
    require('../../mixin/bootstrap-compat.js'),
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
  ],

  components: {
    HelpButton,
  },

  data() {
    return {
      collapsed: (sessionStore.get('anno-list:collapsed') !== false),
    };
  },

  mounted() {
    const annoList = this;
    annoList.collapseAll('apply');

    // Sort the list initially and after every fetch
    annoList.sort();
    eventBus.$on('fetched', async function onFetched() {
      await annoList.sort();
      await annoList.collapseAll('apply');
    });

    // When permissions have been updated, force an update.
    eventBus.$on('updatedPermissions', () => annoList.$forceUpdate());

    // Initially open the list if there was an annotation persistently adressed
    if (annoList.purlId && annoList.purlAnnoInitiallyOpen) {
      eventBus.$once('fetched', () => {
        setTimeout(() => eventBus.$emit('expand', annoList.purlId), 1);
      });
    }
  },
  computed: {
    annos() { return this.$store.state.annotationList.list; },
    sortedBy() { return this.$store.state.annotationList.sortedBy; },

    purlId() { return this.$store.state.purlId; },
    purlAnnoInitiallyOpen() { return this.$store.state.purlAnnoInitiallyOpen; },
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
    sort(...args) {
      return this.$store.dispatch('sort', ...args);
      // Implemented in src/vuex/module/annotationList.js
    },

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
      if (action !== 'apply') { sessionStore.put('anno-list:collapsed', st); }

      const verb = (st ? 'hide' : 'show');
      annoList.$children.forEach(function maybeCollapse(viewer) {
        if (viewer.collapse) { viewer.collapse(verb); }
      });
    },

    tryRenewSession() {
      console.debug('tryRenewSession: stub!');
    },

  },
};
