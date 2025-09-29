// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');
const jQuery = require('jquery');

// const eventBus = require('../event-bus.js');


function orf(x) { return x || false; }


module.exports = {
  methods: {

    clickedListItemDatasetActionButton(domEvent) {
      const vueElem = this;
      const parents = jQuery(domEvent.target).parentsUntil('ul, ol').toArray();
      const lineage = parents.reverse().concat(domEvent.target);
      const datasets = lineage.map(x => x.dataset);
      const ctx = Object.assign({ domEvent }, ...datasets);
      const { action } = ctx;
      const impl = getOwn(vueElem, action);
      if (!impl) { throw new Error('Action not implemented: ' + action); }
      return impl.call(vueElem, ctx);
    },

    editListItemStringProp(ctx) {
      const vueElem = this;
      let msg = ctx.prompt || '';
      if (msg.startsWith('$$')) { msg = ctx[msg.slice(2)]; }
      const { list, index, prop } = ctx;
      const old = orf(orf(vueElem.$store.state.editing[list])[index])[prop];
      const val = window.prompt(msg, old);
      if (val === undefined) { return; }
      if (val === null) { return; }
      const a = { prop: list, idx: +index };
      if (val === '') { a.del = [prop]; } else { a.upd = { [prop]: val }; }
      vueElem.$store.commit('UPDATE_EDITOR_ANNO_LIST_PROP', a);
      // eventBus.$emit('editorShouldUpdatePreview');
    },

    mutateList(ctx) {
      const vueElem = this;
      const muta = vueElem[ctx.muta];
      if (!muta) { return; }
      const a = { prop: ctx.list, idx: +ctx.index, ctx };
      a.injectedMutation = muta;
      vueElem.$store.commit('UPDATE_EDITOR_ANNO_LIST_PROP', a);
    },

    deleteListItemProp(ctx) {
      const vueElem = this;
      const { list, index, prop } = ctx;
      const a = { prop: list, idx: +index, del: [prop] };
      vueElem.$store.commit('UPDATE_EDITOR_ANNO_LIST_PROP', a);
      // eventBus.$emit('editorShouldUpdatePreview');
    },

  },
};
