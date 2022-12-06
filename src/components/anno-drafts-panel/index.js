// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const jQuery = require('jquery');

const eventBus = require('../../event-bus.js');

const downloadAndRestoreDraft = require('./downloadAndRestoreDraft.js');
const genericSimpleApiCall = require('./genericSimpleApiCall.js');
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
    panel.scheduleAutoRescanDraftsList();
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

    scheduleAutoRescanDraftsList() {
      setTimeout(() => eventBus.$emit('reloadDraftsList'), 100);
    },

    clickedDraftActionButton(evt) {
      const parents = jQuery(evt.target).parentsUntil('ul, ol').toArray();
      const datasets = parents.reverse().map(x => x.dataset);
      const meta = Object.assign({}, ...datasets);
      console.debug('clickedDraftActionButton', meta);
      const { action } = meta;
      const impl = this[action];
      if (!impl) { throw new Error('Draft action not implemented: ' + action); }
      return impl.call(this, meta);
    },

    async reallyDeleteDraft(meta) {
      return genericSimpleApiCall({
        ...meta,
        panel: this,
        confirmVoc: 'delete_draft_confirm',
        actionDescrVoc: 'delete_draft',
        apiVerb: 'DELETE',
      });
    },

  },

};

setTimeout(() => eventBus.$emit('create'), 1e3);
setTimeout(() => eventBus.$emit('switchEditorTabByRefName',
  'draftsPanel'), 2e3);
