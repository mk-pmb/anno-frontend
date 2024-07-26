// const Vue = require('vue/dist/vue.esm.js').default;
const Vue = require('vuejs-debug-traverse-210506-pmb/vue.esm.js').default;
const Vuex = require('vuex/dist/vuex.esm.js').default;

const loMapValues = require('lodash.mapvalues');
const mergeOptions = require('merge-options');
const objFromKeysList = require('obj-from-keys-list').default;


if (process.env.NODE_ENV !== 'production') {
  Vue.config.devtools = true;
  console.log('anno-frontend: Enabled Vue devtools.');
}
Vue.use(Vuex);
require('./components/index.js').registerAll(Vue);

const bootstrapCompat = require('./bootstrap-compat')
const decideDefaultOptions = require('./default-config');
const eventBus = require('./event-bus')
const externalRequest = require('./xrq/externalRequest.js')
const SidebarApp = require('./components/sidebar-app')

// For docs see display-annotations.md


function makeDiv() { return document.createElement('div'); }

const EX = function displayAnnotations(customOptions) {
    // console.debug('displayAnnotations: customOptions =', customOptions);
    const options = mergeOptions(decideDefaultOptions(), customOptions);
    bootstrapCompat.initialize(options.bootstrap);
    delete options.bootstrap;
    const apiExtras = {};

    (function checkDeprecatedOpts() {
      const optNames = [
        'l10n',
      ];
      let had;
      optNames.forEach(k => {
        const v = options[k];
        if (v === undefined) { return; }
        console.error('AnnoApp: Ignoring deprecated option:', k, '=', v);
        had = { ...had, [k]: v };
        delete options[k];
      });
      apiExtras.getDeprecatedOpts = (had && (() => had));
    }());

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
    let onAppReady;
    (function installEvents() {
      const { events } = options;
      delete options.events;
      if (!events) { return; }
      onAppReady = events.appReady;
      delete events.appReady;
      loMapValues(events, function install(evHandlers, evName) {
        [].concat(evHandlers).forEach(hnd => hnd && eventBus.$on(evName, hnd));
      });
    }());

    (function evaluateFactoryOptions() {
      // Some options can also be functions to be called to produce
      // the value now.
      loMapValues(options, function check(oldValue, key) {
        if (typeof oldValue !== 'function') { return; }
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
    const annoapp = new Vue({ ...SidebarApp, store, el: makeDiv() });
    container.appendChild(annoapp.$el);

    function getAnnoAppRef() { return annoapp; }
    annoapp.$el.getAnnoAppRef = getAnnoAppRef;

    Object.assign(annoapp, {
      getEventBus() { return eventBus; },
      ...objFromKeysList(function makeEventBusProxy(evName) {
        return function proxy(...args) { eventBus.$emit(evName, ...args); };
      }, [
        'expand',
        'startHighlighting',
        'stopHighlighting',
      ]),

      ...apiExtras,
    });

    // Initialize store state
    setTimeout(() => annoapp.$store.dispatch('retrieveInitialState'), 1);

    //
    // Return the app for event emitting
    //
    if (options.exportAppAsWindowProp) {
      window[options.exportAppAsWindowProp] = annoapp;
    }
    if (onAppReady) { onAppReady(annoapp); }
    annoapp.externalRequest = externalRequest.bind(null, annoapp);
    return annoapp;
};




module.exports = EX;
