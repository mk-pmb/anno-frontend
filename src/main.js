// const Vue = require('vue/dist/vue.esm.js').default;
const Vue = require('vuejs-debug-traverse-210506-pmb/vue.esm.js').default;
const Vuex = require('vuex/dist/vuex.esm.js').default;

const getOwn = require('getown');
const loMapValues = require('lodash.mapvalues');
const mergeOptions = require('merge-options');
const objFromKeysList = require('obj-from-keys-list').default;


if (process.env.NODE_ENV !== 'production') {
  Vue.config.devtools = true;
  // console.log('anno-frontend: Enabled Vue devtools.');
}
Vue.use(Vuex);
require('./components/index.js').registerAll(Vue);

const applyCheats = require('./cheats.js');
const bootstrapCompat = require('./bootstrap-compat')
const browserStorage = require('./browserStorage.js');
const decideDefaultOptions = require('./default-config');
const eventBus = require('./event-bus')
const externalRequest = require('./xrq/externalRequest.js')
const SidebarApp = require('./components/sidebar-app')


function fail(e) { throw new Error(e); }
function ifFun(x, d) { return (typeof x === 'function' ? x : d); }
function makeDiv() { return document.createElement('div'); }


const pluginInjectableModules = {
  'nwdiff': require('nwdiff').default,
  'sanitize-html': require('sanitize-html'),
};

const plugins = {};

const eventBusProxies = objFromKeysList(function makeEventBusProxy(ev) {
  return function eventBusProxy(...args) {
    setTimeout(function delayedEmit() { eventBus.$emit(ev, ...args); }, 10);
  };
}, [
  'abortLurkMode',
  'startHighlighting',
  'stopHighlighting',
]);

let vueRootElem;
let configAccum = decideDefaultOptions();

const EX = {

  appName: 'ubhdAnnoApp',

  browserStorage,

  defaultConfig: configAccum,

  configure(update) {
    if (vueRootElem) {
      fail('Cannot configure annoApp that has already been started.');
    }
    if (update) {
      if (ifFun(update)) { return EX.configure(update(configAccum)); }
      configAccum = mergeOptions(configAccum, update);
    }
    return configAccum;
  },

  externalRequest(...args) {
    if (vueRootElem) { return externalRequest(vueRootElem, ...args); }
    console.error('W: AnnoApp: externalRequest before start():', args);
  },

  debugReconfigure: (function compile() {
    const r = Object.assign(function debugRreconfigure(u) {
      vueRootElem.$store.commit('FLAT_UPDATE_APP_STATE', u);
    }, {
      acl() { r({ aclOverrides: { '*': { '*': 'allow' } } }); },
      approvalMode(enable = true) { r({ initCmpApprovalMode: enable }); },
      ui(enable = true) { r({ uiDebugMode: enable }); },
      xrx(enable = true) { r({ disableXrxVueEditor: !enable }); },
    });
    return r;
  }()),

  ...eventBusProxies,
  getAnnoAppRef() { return EX; },
  getEventBus() { return eventBus; },
  getPluginByName(p) { return getOwn(plugins, p, false); },
  getPluginFactories: Object.bind(null, {}),
  getVueRootElem() { return vueRootElem; },

  start() {
    if (vueRootElem) { fail('Cannot re-start annoApp!'); }
    const options = configAccum;
    configAccum = null;
    bootstrapCompat.initialize(options.bootstrap);
    delete options.bootstrap;
    // console.debug(EX.appName, 'starting with config:');

    //
    // Create a container element if none was given
    //
    let { container } = options;
    delete options.container;
    if (typeof container === 'string') {
      container = container.replace(/^…/, options.prefix);
      container = document.getElementById(container);
    }
    if (!container) {
      container = makeDiv();
      container.setAttribute('id', options.prefix + 'container')
      document.body.appendChild(container);
    }

    //
    // Event listeners
    //
    (function installEvents() {
      const { events } = options;
      delete options.events;
      if (!events) { return; }
      loMapValues(events, function install(evHandlers, evName) {
        [].concat(evHandlers).forEach(hnd => hnd && eventBus.$on(evName, hnd));
      });
    }());

    (function evaluateFactoryOptions() {
      // Some options can also be functions to be called to produce
      // the value now.
      loMapValues(options, function check(oldValue, key) {
        if (!ifFun(oldValue)) { return; }
        const qualified = (key.endsWith('Url')
          || (key === 'purlTemplate')
          || (key === 'targetSource')
          );
        if (!qualified) { return; }
        options[key] = oldValue(options);
      });
    }());


    (function resolveConfigURLs() {
      const maybeUrl = /^target|endpoint$|url$/i;
      const isExplicitlyRelative = /^\.{0,2}\//; /*
        Only resolve explicitly relative URLs because our maybeUrl regexp
        matches lots of false positives that are not supposed to be URLs. */
      Object.keys(options).forEach(function resolve(key) {
        if (!maybeUrl.test(key)) { return; }
        const val = options[key];
        if (!isExplicitlyRelative.test(val)) { return; }
        options[key] = (new URL(val, window.location)).href;
      });
    }());


    const storeBlueprint = require('./vuex/store');
    Object.assign(storeBlueprint.state, options);
    const store = new Vuex.Store(storeBlueprint);
    vueRootElem = new Vue({ ...SidebarApp, store, el: makeDiv() });
    container.appendChild(vueRootElem.$el);

    vueRootElem.$el.getAnnoAppRef = EX.getAnnoAppRef;
    store.getAnnoAppRef = EX.getAnnoAppRef;
    Object.assign(store, storeBlueprint.customApiExtras);

    // Initialize store state
    setTimeout(() => vueRootElem.$store.dispatch('retrieveInitialState'), 1);

    function installPlugin(plName, factory) {
      const injected = loMapValues(factory.injectModules, function inj(what) {
        const found = getOwn(pluginInjectableModules, what);
        if (found !== undefined) { return found; }
        throw new Error('Cannot inject plugin ' + plName + ' with ' + what);
      });
      const plCtx = { pluginName: plName, vueRootElem, injected };
      try {
        const plug = factory(plCtx);
        plugins[plName] = plug;
        const plVueInit = plug.onVueReady || factory.onVueReady;
        if (plVueInit) { setTimeout(() => plVueInit(plCtx), 1); }
      } catch (plErr) {
        console.error('AnnoApp: Prepare plugin ' + plName + ':', plErr);
        throw plErr;
      }
    }
    loMapValues(EX.getPluginFactories(),
      (how, plName) => setTimeout(() => installPlugin(plName, how), 1));

    Object.assign(EX.debugReconfigure, {
      preimg() { vueRootElem.editor.initializeZoneEditor(); },
    });

    applyCheats();

    return vueRootElem;
  },


};



eventBus.$once('annoListReplaced',
  () => applyCheats.checkAutoEmitQ(window.name, EX.appName + ':autoEmitQ:'));






module.exports = EX;
