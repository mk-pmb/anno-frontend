// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const crc32 = require('lighter-crc32');
const sortedJson = require('safe-sortedjson');

// const api22 = require('../../api22.js');
// const eventBus = require('../../event-bus.js');

function padStart(pad, text) { return (pad + text).slice(-pad.length); }
function hash(data) { return padStart('00000000', crc32(data).toString(16)); }

window.annoDraftHash = hash;


module.exports = {

  template: require('./drafts.html'),
  // style: require('./drafts.scss'),

  mixins: [
    require('../../mixin/l10n.js'),
  ],

  props: {
    editorApi: Object,
  },

  methods: {

    async saveNew() {
      // const { state } = editor.$store;
      const panel = this;
      const anno = panel.editorApi.getCleanAnno();

      const draftJson = sortedJson(anno) + '\n';
      const draftContentHash = hash(draftJson);
      window.alert('Stub! >>' + draftJson + '<< ' + draftContentHash);
    },

  },

};

setTimeout(() => window.annoApp.eventBus.$emit('create'), 1e3);
