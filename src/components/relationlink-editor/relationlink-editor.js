'use strict';

const eventBus = require('../../event-bus.js');

const dfPredicates = require('./predi.default.js');

/*
 * ### relationlinks-editor
 *
 * Editor for qualified links, i.e. link-label-purpose triples.
 *
 */

module.exports = {
    mixins: [
      require('../../mixin/l10n'),
      require('./determinePredicateCaption.js'),
    ],
    template: require('./relationlink-editor.html'),
    // style:    require('./bonanza.sass'),

    props: {
      knownPredicates: { type: Array, default: dfPredicates.allUrls.boundSlice },
    },

    data() {
      return {
        customToplevelAttributes: '',
      };
    },

    mounted() {
      const relEd = this;
      eventBus.$on('open-editor', function onEditorOpen() {
        relEd.customToplevelAttributes = '';
      });
    },

    computed: {
      relationLinkBodies() { return this.$store.getters.relationLinkBodies },
    },

    methods: {

      addRelationLink() {
        this.$store.commit('ADD_RELATIONLINK', {
          predicate: dfPredicates.allUrls[0],
        });
      },

      removeBody(body) {this.$store.commit('REMOVE_BODY', body)},

      includes(maybeArray, val) {
        return Array.isArray(maybeArray) && maybeArray.includes(val)
      },

      onSelectPurpose(bodyIndex, event) {
        const { value } = event.target;
          console.debug('onSelectPurpose', { ctx: this, bodyIndex, value });
          this.$store.commit("SET_RELATIONLINK_PROP", {
            n: bodyIndex,
            prop: 'predicate',
            value,
          });
      },

      toggleVisibility(refName) {
        const s = (this.$refs[refName] || false).style;
        if (s) { s.display = (s.display === 'none' ? '' : 'none'); }
      },

    },
}
