
function orf(x) { return x || false; }
function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }

module.exports = {

  mixins: [
    require('../../mixin/l10n'),
  ],

  template: require('./asel.html'),
  style: require('./style.scss'),

  props: {
    dropdownId:       { type: [String], required: false, default: '' },
    dropdownName:     { type: [String], required: false, default: '' },
    rowCaption:       { type: [String], required: false, default: '' },
    knownIdentities: { type: [Array] },
    initialAgent: { type: [Object], required: false },
    onchange: { type: [Function], required: false },
  },

  data() { return {
    currentAgentId: '',
    initialAgentBackup: null,
  } },

  created() {
    const vueElem = this;
    const bak = jsonDeepCopy(orf(vueElem.initialAgent));
    vueElem.initialAgentBackup = bak;
    vueElem.currentAgentId = (bak.id /* Agent ID URL */ || '');
  },

  methods: {

    makeCaptionForIdentity(agent) {
      const vueElem = this;
      const noData = vueElem.l10n('no_data');
      if (!agent) { return noData; }
      return ((agent.nickname || agent.name || noData)
        + ' <' + (agent.email || '@') + '>');
    },

    getSelectedAgent() {
      // We use a getter rather than assigning a property, because vue would
      // instantly proxify the assigned property.
      const vueElem = this;
      const ddElem = vueElem.$refs.dropdown;
      const ddOpt = ddElem.options[ddElem.selectedIndex];
      if (ddOpt.disabled) { return; }
      const ddVal = ddOpt.value;
      if (!ddVal) { return; }
      const agent = orf(JSON.parse(ddOpt.dataset.agent));
      return agent;
    },

    internalSelectionChanged(evt) {
      const vueElem = this;
      const agent = vueElem.getSelectedAgent();
      vueElem.currentAgentId = (agent.id || '');
      evt.currentAgent = agent; // eslint-disable-line no-param-reassign
      const hnd = vueElem.onchange;
      // window.sai = evt;
      // console.debug('onSelectAgentIdentity!', evt);
      if (hnd) { return hnd(evt); }
    },


  },

};
