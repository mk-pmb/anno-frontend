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
    draftFilenameCommentCustom: '',
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

  computed: {

    draftFilenameCommentMaxLen() {
      const n = (+this.$store.state.draftFilenameCommentMaxLen || 0);
      return (n >= 1 ? n : 64);
    },

    draftFilenameCommentAdjusted() {
      let v = this.draftFilenameCommentCustom
        || this.editorApi.getAnnoTitle()
        || this.l10n('no_data');
      v = (String(v).match(/[\w\-]+/g) || []).join(' ');
      v = v.replace(/ (?=_)/g, '').replace(/_ /g, '_').replace(/ /g, '_');
      v = v.slice(0, this.draftFilenameCommentMaxLen).toLowerCase();
      return v;
    },

  },

  methods: {

    downloadAndRestoreDraft,
    listDraftsGrouped,
    reloadDraftsList,
    saveNew,

    clickedRestoreDraft(evt) {
      window.restoreTgt = evt.target;
      const { filename } = evt.target.parentElement.parentElement.dataset;
      return this.downloadAndRestoreDraft(filename);
    },

  },

};

setTimeout(() => eventBus.$emit('create'), 1e3);
setTimeout(() => eventBus.$emit('switchEditorTabByRefName',
  'draftsPanel'), 2e3);
