// const Vue = require('vue/dist/vue.esm.js').default;
const Vue = require('vuejs-debug-traverse-210506-pmb/vue.esm.js').default;
const Vuex = require('vuex/dist/vuex.esm.js').default;

const mergeOptions = require('merge-options');
const objFromKeysList = require('obj-from-keys-list').default;


if (process.env.NODE_ENV !== 'production') {
  Vue.config.devtools = true;
  console.log('anno-frontend: Enabled Vue devtools.');
}
Vue.use(Vuex);
require('./components/index.js').registerAll(Vue);

const {localizations} = require('../l10n-config.json')
const bootstrapCompat = require('./bootstrap-compat')
const decideDefaultOptions = require('./default-config');
const eventBus = require('./event-bus')
const externalRequest = require('./xrq/externalRequest.js')
const SidebarApp = require('./components/sidebar-app')

// For docs see display-annotations.md

module.exports = function displayAnnotations(customOptions) {
    // console.debug('displayAnnotations: customOptions =', customOptions);
    const options = mergeOptions(decideDefaultOptions(), customOptions);
    bootstrapCompat.initialize(options.bootstrap);
    delete options.bootstrap;

    Object.assign(SidebarApp.props, {
      standalone: { default: !options.container },
      collapseInitially: { default: Boolean(options.collapseInitially) },
    });

    //
    // Override l10n
    //
    if (options.l10n) {
      console.log("Overriding l10n")
        Object.keys(localizations).forEach(lang => {
            if (lang in options.l10n) {
                Object.assign(localizations[lang], options.l10n[lang])
            }
        })
        delete options.l10n
    }

    //
    // Create a container element if none was given
    //
    let container = options.container;
    delete options.container;
    if (typeof container === 'string') {
      container = container.replace(/^…/, options.prefix);
      container = document.getElementById(container);
    }
    if (!container) {
        container = document.createElement('div')
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
      Object.entries(events).forEach(function install([evName, evHandler]) {
        eventBus.$on(evName, evHandler);
      });
    }());

    (function evaluateFactoryOptions() {
      // Some options can also be functions to be called to produce
      // the value now.
      Object.entries(options).forEach(function check(pair) {
        const [key, oldValue] = pair;
        if (typeof oldValue !== 'function') { return; }
        const qualified = (key.endsWith('Url')
          || (key === 'purlTemplate')
          || (key === 'targetSource')
          );
        if (!qualified) { return; }
        options[key] = oldValue(options);
      });
    }());

    const storeBlueprint = require('./vuex/store');
    Object.assign(storeBlueprint.state, options);
    const annoapp = new Vue({
      ...SidebarApp,
      el: document.createElement('div'),
      store: new Vuex.Store(storeBlueprint),
    });
    container.appendChild(annoapp.$el);
    annoapp.$el.getAnnoAppRef = () => annoapp;

    Object.assign(annoapp, {
      getEventBus() { return eventBus; },
      ...objFromKeysList(function makeEventBusProxy(evName) {
        return function proxy(...args) { eventBus.$emit(evName, ...args); };
      }, [
        'expand',
        'startHighlighting',
        'stopHighlighting',
      ]),
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
}
