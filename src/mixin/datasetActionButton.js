// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');
const jQuery = require('jquery');

// const eventBus = require('../event-bus.js');


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

  },
};
