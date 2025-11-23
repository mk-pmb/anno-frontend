
function orf(x) { return x || false; }
// function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }

function decodeAgentFromDataset() {
  const a = this.optElem.dataset.agent;
  return orf(a && JSON.parse(a));
}

function naiveRandomStr() { return Math.random().toString(36).slice(2); }


module.exports = {

  mixins: [
    require('../../mixin/l10n'),
  ],

  template: require('./asel.html'),
  // style: require('./style.scss'),

  props: {
    dropdownId:       { type: [String], required: false, default: '' },
    dropdownName:     { type: [String], required: false, default: '' },
    rowCaption:       { type: [String], required: false, default: '' },
    knownIdentities: { type: [Array] },
    initialAgent: { type: [Object], required: false },
    onchange: { type: [Function], required: false },
  },

  data() { return {
    dropdownIdOrFallback: '',
    currentAgentId: '',
  } },

  created() {
    const vueElem = this;
    vueElem.currentAgentId = (orf(vueElem.initialAgent).id || '');
    vueElem.dropdownIdOrFallback = (vueElem.dropdownId
      || ('agent-identity-selector-' + naiveRandomStr() + naiveRandomStr()));
  },

  mounted() {
    const vueElem = this;
    const domElem = vueElem.$el;
    const dd = vueElem.$refs.dropdown;
    domElem.focus = dd.focus.bind(dd);
  },

  methods: {

    makeCaptionForIdentity(agent) {
      const vueElem = this;
      const noData = vueElem.l10n('no_data');
      if (!agent) { return noData; }
      return ((agent.nickname || agent.name || noData)
        + ' <' + (agent.email || '@') + '>');
    },

    getSelection() {
      // We use a getter rather than assigning a property, because vue would
      // instantly proxify the assigned property.
      const ddElem = this.$refs.dropdown;
      const optElem = orf(ddElem.options[ddElem.selectedIndex]);
      return {
        agentId: (optElem.value || ''),
        getAgent: decodeAgentFromDataset,
        isPreserve: optElem.classList.contains('keep-old-value'),
        optElem,
      };
    },

    internalSelectionChanged(evt) {
      const sel = this.getSelection();
      this.currentAgentId = sel.agentId;
      Object.assign(evt, sel);
      if (this.onchange) { return this.onchange(evt); }
    },


  },

};
