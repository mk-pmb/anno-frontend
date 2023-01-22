const isStr = require('is-string');

const viewerFormatters = require('../anno-viewer/formatters.js');

function orf(x) { return x || false; }

module.exports = {

  mixins: [
    require('../../mixin/l10n'),
  ],

  template: require('./agent.html'),
  style: require('./style.scss'),

  props: {
    agent: { type: [Object, String, Boolean], required: false },
  },

  computed: {

    agt() {
      const { agent } = this;
      if (!agent) { return false; }
      if (isStr(agent)) { return { id: agent }; }
      return agent;
    },

    icon() { return orf(orf(this.agent)['as:icon']); },

  },

  methods: {

    viewerFormatters,

  },

};
