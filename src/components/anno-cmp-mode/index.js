// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');

const eventBus = require('../../event-bus.js');

const fetchVersionsList = require('./fetchVersionsList.js');
const verCache = require('./verCache.js');


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

    // Usually a base ID means it explicitly does _not_ contain a
    // version number, but here we're a bit lenient to make some
    // config scenarios a bit easier.
    const [baseId, verSuffixStr] = (st.initCmpBaseId || '').split(/~(\d+)$/);
    const initVerSuffixNum = (+verSuffixStr || 0);

    const priSide = (st.initCmpLayout
      || (st.initCmpApprovalMode && 'only')
      || 'left');
    // const { l10n } = this;
    return {
      baseId,
      priSide,
      priVerChoice: { versNum: (+st.initCmpPrimarySideVersionNumber || initVerSuffixNum) },
      secVerChoice: { versNum: (+st.initCmpSecondarySideVersionNumber || initVerSuffixNum) },
      knownVersions: false,
      reverseOrderKnownVersions: false, // because Vue2 v-for cannot reverse
      fetchRetryCooldownSec: 5,
      forcedRerenderTs: 0,
    };
  },

  mounted() {
    const cmp = this;
    eventBus.$emit('trackPromise', fetchVersionsList(cmp));
    window.cmp = cmp;
  },

  computed: {

    secSide() { return getOwn(oppoSides, this.priSide) || 'hidden'; },

  },

  methods: {

    ...verCache.vueMtd,

    getSideAnnoData(side) {
      const cmp = this;
      const { versNum } = cmp[side + 'VerChoice'];
      const rData = cmp.lookupCachedVerAnno(versNum);
      const vueKey = [side, versNum, cmp.forcedRerenderTs].join('|');
      return { vueKey, ...rData };
    },

    forceRerenderAnnos() {
      setTimeout(() => { this.forcedRerenderTs = Date.now(); }, 5);
    },

  },

};


module.exports = compoDef;
