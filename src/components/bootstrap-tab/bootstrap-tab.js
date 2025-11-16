// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

module.exports = {

  mixins: require('../../mixin/l10n.js'),
  template: require('./bootstrap-tab.html'),

  props: {
    title:    {type: String, required: true},
    name:     {type: String, required: true},
    topic:    String,
    tabCls:   String,
    paneCls:  String,
    visible:  { type: Boolean, default: true },
  },

  data() {
    return {
      active: false,
      tabIndex: -1,
    };
  },

  mounted() {
    this.$el.getVueRef = Object.bind(null, this);
  },

};
