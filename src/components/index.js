'use strict';

const vue2Teleport = require('vue2-teleport').default;

const components = {

    // helpers
    'anno-cmp-ver-chooser':      require('./anno-cmp-ver-chooser'),
    'bootstrap-btnbar-dropdown':  require('./bootstrap-btnbar-dropdown'),
    'bootstrap-button':  require('./bootstrap-button'),
    'bootstrap-tab':     require('./bootstrap-tab'),
    'bootstrap-tabs':    require('./bootstrap-tabs'),
    'msgbox-row':        require('./msgbox-row'),
    'teleport':          vue2Teleport,

    // viewing
    'anno-cmp-mode':     require('./anno-cmp-mode'),
    'anno-list':         require('./anno-list'),
    'anno-viewer-thumbnail-svg': require('./anno-viewer-thumbnail-svg'),
    'anno-viewer':       require('./anno-viewer'),
    'clipboard-copy-button': require('./clipboard-copy-button'),
    'dt-url-caption-link': require('./dt-url-caption-link'),

    // editing
    'agent-identity-selector':    require('./agent-identity-selector'),
    'agent-profile-bulletable':   require('./agent-profile-bulletable'),
    'anno-drafts-panel':          require('./anno-drafts-panel'),
    'anno-editor-licenses':       require('./anno-editor-licenses'),
    'anno-editor-modal':          require('./anno-editor-modal'),
    'anno-editor-rows-addable':   require('./anno-editor-rows-addable'),
    'anno-editor':                require('./anno-editor'),
    'html-editor':         require('./html-editor'),
    'relationlink-editor': require('./relationlink-editor'),
    'semtags-editor':      require('./semtags-editor'),
    'tags-editor':         require('./tags-editor'),
    'xrx-vue':             require('@kba/xrx-vue').XrxVue,

    // debugging
    'anno-editor-debug-panel':    require('./anno-editor-debug-panel'),
    'json-export-import-field':   require('./json-export-import-field'),

    // apps
    'sidebar-app':       require('./sidebar-app'),

};

function registerAll(Vue) {
  Object.entries(components).forEach(kv => Vue.component(...kv));
}

module.exports = { registerAll };
