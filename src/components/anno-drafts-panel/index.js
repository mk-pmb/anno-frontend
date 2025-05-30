// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const loMapValues = require('lodash.mapvalues');

const eventBus = require('../../event-bus.js');

const downloadAndRestoreDraft = require('./downloadAndRestoreDraft.js');
const genericSimpleApiCall = require('./genericSimpleApiCall.js');
const listDraftsGrouped = require('./listDraftsGrouped.js');
const parseDraftFileName = require('./parseDraftFileName.js');
const reloadDraftsList = require('./reloadDraftsList.js');
const saveNew = require('./saveNew.js');


module.exports = {

  template: require('./drafts.html'),
  style: require('./style.scss'),

  mixins: [
    require('../../mixin/datasetActionButton.js'),
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
  ],

  data() { return {
    draftFilenameCommentCustom: '',
    allDrafts: [],
    refreshDraftsHintVoc: 'init',
  }; },

  props: {
    editorAnnoId: String,
    editorAnnoPrimaryTargetUrl: String,
    editorAnnoTitle: String,
    editorApi: Object,
  },

  mounted() {
    const panel = this;
    eventBus.$on('autoReloadDraftsList', panel.autoReloadDraftsList);
    eventBus.$on('userReloadDraftsList', panel.reloadDraftsList);

    // Defer draft list loading until editor is opened: If we'd laod it
    // before we know the editor's target, groups will be wrong.
    eventBus.$on('open-editor', panel.autoReloadDraftsList);

    eventBus.$on('loadDraftFile', panel.loadDraftFile);
  },

  computed: {

    draftFilenameCommentMaxLen() {
      const n = (+this.$store.state.draftFilenameCommentMaxLen || 0);
      return (n >= 1 ? n : 64);
    },

    draftFilenameCommentAdjusted() {
      const appCfg = this.$store.state;
      let v = this.draftFilenameCommentCustom
        || this.editorAnnoTitle
        || this.l10n('no_data');
      v = String(v);
      loMapValues(appCfg.draftFilenameCommentOptimizers, function apply(f) {
        let b = f(v);
        if (b) { b = String(b); }
        if (b) { v = b; }
      });
      v = (v.match(/[\w\-]+/g) || []).join(' ');
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

    autoReloadDraftsList() { return this.reloadDraftsList({ silent: true }); },

    scheduleAutoRescanDraftsList() {
      setTimeout(() => eventBus.$emit('autoReloadDraftsList'), 100);
    },


    async reallyDeleteDraft(meta) {
      return genericSimpleApiCall({
        ...meta,
        panel: this,
        confirmVoc: 'delete_draft_confirm',
        actionDescrVoc: 'delete_draft',
        apiVerb: 'DELETE',
      }).then(this.scheduleAutoRescanDraftsList);
    },


    draftMetaToApiMeta(dm) {
      const am = {
        filename: dm.fileName,
        draftDate: dm.humanDate,
        draftName: dm.customNamePart,
        draftTime: dm.humanTime,
      };
      return am;
    },


    loadDraftFile(fileName) {
      const panel = this;
      const draftMeta = parseDraftFileName(fileName);
      if (!draftMeta) { throw new Error('Invalid draft file name!'); }
      const apiMeta = panel.draftMetaToApiMeta(draftMeta);
      return panel.downloadAndRestoreDraft(apiMeta);
    },

  },

};

/*
window.name = 'ubhdAnnoApp:autoEmitQ:' + JSON.stringify(['create',
  ['loadDraftFile', '20221128-120200-ec611702-0-9f85f583-pferdekopf.json']])
*/
