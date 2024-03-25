// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');

const eventBus = require('../../event-bus.js');
// const findTargetUri = require('../../findTargetUri.js');
const categorizeTargets = require('../anno-editor/categorizeTargets.js');

const fetchVersionsList = require('./fetchVersionsList.js');
const verCache = require('./verCache.js');


function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }


const oppoSides = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
};

const defaultSidePadCls = 'container container-mandatory-for-bootstrap-rows';


function categorizeTargetsEventMethod() {
  const event = this;
  const { annoEndpoint, rawTarget } = event;
  return categorizeTargets.unranked({ annoEndpoint }, rawTarget);
}


function cfgRetarget(vueStore, anno) {
  const subjTgtUrl = categorizeTargets(vueStore.state, anno.target).subjTgt.id;
  const cfgUpd = { targetSource: subjTgtUrl };
  console.debug('AnnoApp: Version selection changed => reconfigure', cfgUpd);
  vueStore.commit('FLAT_UPDATE_APP_STATE', cfgUpd);
}


const compoDef = {

  template: require('./cmp.html'),
  style: require('./style.scss'),

  mixins: [
    require('../../mixin/dateFmt.js'),
    require('../../mixin/l10n.js'),
  ],

  props: {
    sideBoxCls:   { type: String, default: '' },
    sidePadCls:   { type: String, default: defaultSidePadCls },
  },

  data() {
    const cmp = this;
    const st = cmp.$store.state;

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
      priVerChoice: {
        onchange(evt) { return cmp.versionSelected(1, evt); },
        verNum: (+st.initCmpPrimarySideVersionNumber || initVerSuffixNum),
      },
      secVerChoice: {
        onchange(evt) { return cmp.versionSelected(2, evt); },
        verNum: (+st.initCmpSecondarySideVersionNumber || initVerSuffixNum),
      },
      knownVersions: false,
      reverseOrderKnownVersions: false, // because Vue2 v-for cannot reverse
      fetchRetryCooldownSec: 5,
      forcedRerenderTs: 0,
    };
  },

  mounted() {
    const cmp = this;
    const rllPr = fetchVersionsList(cmp);
    rllPr.then(() => {
      cmp.versionSelected(1, { verNum: cmp.priVerChoice.verNum });
      cmp.versionSelected(2, { verNum: cmp.secVerChoice.verNum });
    });
    Object.assign(cmp.$el, {
      getKnownVersions() { return jsonDeepCopy(cmp.knownVersions); },
    });
    eventBus.$emit('trackPromise', rllPr);
  },

  computed: {

    secSide() { return getOwn(oppoSides, this.priSide) || 'hidden'; },

  },

  methods: {

    ...verCache.vueMtd,

    getSideAnnoData(side) {
      const cmp = this;
      const verNum = ((+cmp[side + 'VerChoice'].verNum)
        || (+cmp.knownVersions.latestVerNum));
      // console.debug('getSideAnnoData:', { side, verNum });
      if (!verNum) { return false; }
      const vueKey = [side, verNum, cmp.forcedRerenderTs].join('|');
      const rData = ((verNum && cmp.lookupCachedVerAnno(verNum)) || false);
      return { vueKey, ...rData };
    },

    forceRerenderAnnos() {
      setTimeout(() => { this.forcedRerenderTs = Date.now(); }, 5);
    },

    async versionSelected(sideNum, origEvt) {
      const cmp = this;
      const { annoEndpoint } = cmp.$store.state;
      const verNum = (origEvt.verNum || origEvt.latestVerNum
        // ^-- origEvt is constructed in anno-cmp-ver-chooser.
        || +cmp.knownVersions.latestVerNum);
      const hook = cmp.$store.state.initCmpOnVersionSelected;
      // console.debug('versionSelected:', { sideNum, verNum, origEvt, hook });
      if (!hook) { return; }
      const rInfo = cmp.lookupCachedVerAnno(verNum);
      if (!rInfo) { throw new Error('Failed lookupCachedVerAnno #' + verNum); }
      await rInfo.waitUntilLoaded();
      const anno = jsonDeepCopy(rInfo.anno);
      const evt = {
        adjustConfiguredTargetSource() { cfgRetarget(cmp.$store, anno); },
        annoEndpoint,
        categorizeTargets: categorizeTargetsEventMethod,
        getFullAnno() { return anno; },
        rawTarget: anno.target,
        sideNum,
        sideVisible: ((sideNum === 1) || (cmp.priSide !== 'only')),
        type: 'cmpViewVersionSelected',
        verNum,
      };
      // console.debug('Version selected', sideNum, verNum, { evt });
      setTimeout(() => hook(evt), 1);
    },

  },

};


module.exports = compoDef;
