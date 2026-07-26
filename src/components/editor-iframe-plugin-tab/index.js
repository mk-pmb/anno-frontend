/* -*- tab-width: 2 -*- */
'use strict';
/* eslint-disable global-require */

const rpcHost = require('iframe-plugin-base-2606-pmb/rpc/host.mjs').default;

const eventBus = require('../../event-bus.js');

// eslint-disable-next-line no-alert,no-undef
// function panic(msg) { window.alert(msg); }

function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function lc1st(s) { return s.slice(0, 1).toLowerCase() + s.slice(1); }


const EX = {

  mixins: [
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
  ],

  template: require('./plugtab.html'),
  style: require('./style.scss'),

  props: {
    pluginName:       String,     // PascalCase
    pluginDef:        Object,
  },

  data() {
    // const plugTab = this;
    const initData = {
      helpTopic: '',
      refName: '',
      rpcAdapter: null,
      tabOpenSince: 0,
      tabTitle: '',
    };
    return initData;
  },

  mounted() {
    const plugTab = this;
    const appCfg = plugTab.$store.state;
    const { pluginName, pluginDef } = plugTab;
    const refName = plugTab.pluginNameCamelCase + 'EditorTab';
    const tabTitle = (pluginDef.forceTitle
      || plugTab.l10n(refName + 'Voc', '')
      || plugTab.l10n(refName, '')
      || ('??' + refName));
    const helpTopic = (pluginDef.helpTopic
      || (plugTab.pluginNameLowerCase + '-editor'));
    const updates = {
      refName,
      tabTitle,
      helpTopic,
    };
    // console.debug('editor-iframe-plugin-tab mounted:', plugTab.$el, updates);
    Object.assign(plugTab, updates);

    (async function jsonRpcInit() {
      const { iframe } = plugTab.$refs;
      iframe.getPluginTabVueElem = () => plugTab;
      let { url } = pluginDef;
      url = url.replace(/^plugnm:\/{2}/, appCfg.pluginsNodeModulesUrl);
      iframe.dataset.urlSpec = url;
      iframe.src = url;
      const rpcOpt = {
        name: 'anno-frontend:plugin:' + pluginName,
        iframe,
        method: 'init',
        params: {
          hostType: 'ubhd-anno-frontend',
          pluginName,
          displayLang: appCfg.language,
          config: { ...pluginDef.config },
        },
        fallbackRequestHandler: plugTab.serveRpcRequest,
      };
      try {
        plugTab.rpcAdapter = await rpcHost.connectToIframe(rpcOpt);
      } catch (rpcInitErr) {
        eventBus.$emit('error', rpcInitErr);
      }
    }());

    eventBus.$on('open-editor', plugTab.rpcEnterIdleStandby);
    eventBus.$on('close-editor', plugTab.rpcEnterIdleStandby);
    eventBus.$on('editorTabNowShowing', function tabShowing(evt) {
      const isOurTopic = (evt.tabTopic === plugTab.helpTopic);
      if (isOurTopic) {
        if (plugTab.tabOpenSince) { return; }
        plugTab.tabOpenSince = Date.now();
        plugTab.rpcStartEditing();
      } else {
        if (!plugTab.tabOpenSince) { return; }
        const tabWasOpenSince = plugTab.tabOpenSince;
        plugTab.tabOpenSince = 0;
        plugTab.rpcStopEditing({ tabWasOpenSince });
      }
    });
  },

  computed: {
    pluginNameCamelCase() { return lc1st(this.pluginName); },
    pluginNameLowerCase() { return this.pluginName.toLowerCase(); },
    pluginNamePascalCase() { return this.pluginName; },
  },

  methods: {

    rpcEnterIdleStandby() {
      const plugTab = this;
      plugTab.rpcAdapter.sendRequest('enterIdleStandby');
    },


    rpcStartEditing() {
      const plugTab = this;
      plugTab.rpcAdapter.sendRequest('startEditing');
    },


    rpcStopEditing() {
      const plugTab = this;
      plugTab.rpcEnterIdleStandby();
    },


    serveRpcRequest(params, details) {
      const plugTab = this;
      const { method } = details;
      if (method === 'readEditorAnno') {
        return jsonDeepCopy(plugTab.$store.state.editing);
      }
      if (method === 'updateEditorAnno') {
        return plugTab.$store.commit('FLAT_UPDATE_EDITOR_ANNO', params);
      }
      console.warn('Received unsupported RPC request from plugin iframe:',
        { method, params });
    },


  },

};




/*
window.name = 'ubhdAnnoApp:autoEmitQ:' + JSON.stringify(['wait',
  ['reviseByUrl', 'test-esau-moses-adamsapfel~1'],
  ['switchEditorTabByTopic', 'semtags-editor'],
  ])
*/

module.exports = EX;
