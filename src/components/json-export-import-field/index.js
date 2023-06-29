/* -*- tab-width: 2 -*- */
'use strict';
/* eslint-disable global-require */

const loGet = require('lodash.get');
const loSet = require('lodash.set');
const sortedJson = require('safe-sortedjson');

const eventBus = require('../../event-bus.js');

// eslint-disable-next-line no-alert,no-undef
function panic(msg) { window.alert(msg); }

module.exports = {

  template: require('./exim.html'),
  style: require('./exim.scss'),

  props: {
    extraButtons:   Array,
    path:           String,
    importEvent:    String,
    importFunc:     Function,
    dumpFunc:       Function,
    nicerJsonFunc:  Function,
  },

  data() {
    const attr = this.$props;
    return {
      baseCls: 'json-export-import-field',
      redumpedAt: 0,
      wrapTextBox: !!attr.wrapTextBox,
    };
  },

  methods: {

    decideButtons() {
      const exim = this;
      const buttons = [].concat(exim.extraButtons, [
        { c: '⤦', n: 'wrap', h: 'toggle text wrap', f: exim.toggleTextWrap },
        ((exim.path || exim.dumpFunc)
          && { c: '✍', n: 'dump', h: 'export', f: exim.redumpJson }),
        ((exim.path || exim.importFunc || exim.importEvent)
          && { c: '⏎', n: 'load', h: 'import', f: exim.importJson }),
      ]).filter(Boolean);
      return buttons;
    },

    extraButtonClicked(btn) {
      console.log('extraButtonClicked', btn);
      return btn.f.call(this, btn);
    },

    toggleTextWrap() { this.wrapTextBox = !this.wrapTextBox; },

    redumpJson() {
      this.redumpedAt = Date.now();
    },

    dumpJson() {
      const exim = this;
      const { path, dumpFunc } = exim;
      const { state } = exim.$store;
      const data = (dumpFunc || loGet)(state, path);
      const defaultJson = sortedJson(data) + '\n';
      const nicerJson = (exim.nicerJsonFunc || String)(defaultJson);
      return nicerJson;
    },

    async importJson() {
      const exim = this;
      const { path, importEvent, importFunc } = exim;
      const inputJson = exim.$refs.txa.value;
      try {
        const data = JSON.parse(inputJson);
        if (importEvent) { return eventBus.$emit(importEvent, data); }
        await exim.$store.commit('INJECTED_MUTATION', [function upd(state) {
          return (importFunc || loSet)(state, path, data);
        }]);
        panic('Imported into: ' + path);
      } catch (err) {
        err.inputJson = inputJson;
        console.error('Error while trying to import JSON:', err);
        panic('Error while trying to import JSON:\n' + err);
      }
    },

  },

};
