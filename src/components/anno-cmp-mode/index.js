// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');


const oppoSides = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
};


const compoDef = {

  template: require('./cmp.html'),
  style: require('./style.scss'),

  mixins: [
    require('../../mixin/dateFmt.js'),
    require('../../mixin/l10n.js'),
  ],

  props: {
  },

  data() {
    const st = this.$store.state;
    return {
      baseId: (st.initCmpBaseId || ''),
      priSide: 'left',
      priVerChoice: { versNum: (+st.initCmpPrimarySideVersionNumber || 0) },
      secVerChoice: { versNum: (+st.initCmpSecondarySideVersionNumber || 0) },
      knownVersions: Array.from({ length: 8 }).map((x, i) => ({
        versNum: i + 1,
        hint: 'dummy',
        created: new Date('2023-03-30T1' + i + ':00:00Z'),
      })),
    };
  },

  mounted() {
  },

  computed: {

    secSide() { return getOwn(oppoSides, this.priSide) || 'bottom'; },

  },

  methods: {
  },

};


module.exports = compoDef;
