// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const eventBus = require('../../event-bus.js');

const downloadAndRestoreDraft = require('./downloadAndRestoreDraft.js');
const listDraftsGrouped = require('./listDraftsGrouped.js');
const reloadDraftsList = require('./reloadDraftsList.js');
const saveNew = require('./saveNew.js');


module.exports = {

  template: require('./drafts.html'),
  style: require('./style.scss'),

  mixins: [
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
  ],

  data() { return {
    allDrafts: [],
    refreshDraftsHintVoc: 'init',
  }; },

  props: {
    editorApi: Object,
  },

  mounted() {
    const panel = this;
    eventBus.$on('reloadDraftsList', () => panel.reloadDraftsList());
  },

  methods: {

    downloadAndRestoreDraft,
    listDraftsGrouped,
    reloadDraftsList,
    saveNew,

    clickedRestoreDraft(evt) {
      const { filename } = evt.target.parentElement.dataset;
      return this.downloadAndRestoreDraft(filename);
    },

  },

};

setTimeout(() => eventBus.$emit('create'), 1e3);
setTimeout(() => eventBus.$emit('switchEditorTabByRefName',
  'draftsPanel'), 2e3);
