// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');

const eventBus = require('../../event-bus.js');
const fetchVersionsList = require('./fetchVersionsList.js');


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
    // const { l10n } = this;
    return {
      baseId: (st.initCmpBaseId || ''),
      priSide: 'left',
      priVerChoice: { versNum: (+st.initCmpPrimarySideVersionNumber || 0) },
      secVerChoice: { versNum: (+st.initCmpSecondarySideVersionNumber || 0) },
      knownVersions: false,
      latestVerNum: 0,
    };
  },

  mounted() {
    const cmp = this;
    eventBus.$emit('trackPromise', fetchVersionsList(cmp));
  },

  computed: {

    secSide() { return getOwn(oppoSides, this.priSide) || 'bottom'; },

  },

  methods: {

    forceRerenderAnnos() {
    },

  },

};


module.exports = compoDef;
