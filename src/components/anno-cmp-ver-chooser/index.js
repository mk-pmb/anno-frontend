// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const compoDef = {

  template: require('./versions.html'),
  style: require('./style.scss'),

  mixins: [
    require('../../mixin/dateFmt.js'),
    require('../../mixin/l10n.js'),
  ],

  props: {
    choice: Object,
    api: Object,
  },

};


module.exports = compoDef;
