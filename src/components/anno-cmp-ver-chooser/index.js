// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const compoDef = {

  template: require('./versions.html'),
  style: require('./style.scss'),

  mixins: [
    require('../../mixin/dateFmt.js'),
    require('../../mixin/l10n.js'),
  ],

  data() { return { lastModifiedAt: false }; },

  props: {
    choice: Object,
    api: Object,
  },

  methods: {

    chooserChanged(vueEvent) {
      const chooser = this;
      const { choice } = chooser;
      if (!choice.onchange) { return; }
      const verNum = +choice.verNum;
      // ^- Take snapshot of the current value because it might have
      //    changed at the time the event handler effectively runs.
      //    Also for number conversion.
      const latestVerNum = (+chooser.api.getVersions().latestVerNum || 0);
      const evt = {
        choice,
        chooser,
        latestVerNum,
        verNum,
        vueEvent,
      };
      setTimeout(() => choice.onchange(evt), 1);
    },

  },

};


module.exports = compoDef;
