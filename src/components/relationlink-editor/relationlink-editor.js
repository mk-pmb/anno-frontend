'use strict';

const arrayOfTruths = require('array-of-truths');

const eventBus = require('../../event-bus.js');

const dfPredicates = require('./predi.default.js');

/*
 * ### relationlinks-editor
 *
 * Editor for qualified links, i.e. link-label-purpose triples.
 *
 */


const purpose = 'linking';


function mapRelationLinkBody(body, idx) {
  return (body.purpose === purpose) && { ...body, '#': idx };
}


module.exports = {
    mixins: [
      require('../../mixin/l10n'),
      require('./determinePredicateCaption.js'),
    ],
    template: require('./relationlink-editor.html'),
    // style:    require('./bonanza.sass'),

    props: {
      knownPredicates: { type: Array, default: dfPredicates.allUrls.copy },
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

    methods: {

      getRelationLinkBodies() {
        const allBodies = this.$store.state.editing.body;
        if (!allBodies) { return []; }
        return arrayOfTruths(allBodies.map(mapRelationLinkBody));
      },

      addRelationLink() {
        this.$store.commit('ADD_BODY', {
          type: 'SpecificResource',
          'dc:title': '',
          purpose,
          'rdf:predicate': this.knownPredicates[0] || '',
          source: '',
        });
      },

      removeBody(bodyIdx) { this.$store.commit('REMOVE_BODY', bodyIdx); },

      storeUserInput(event, prop) {
        const formField = event.target;
        const rowElem = formField.parentElement.parentElement;
        const upd = { '#': +rowElem.dataset.bodyIndex };
        upd[prop] = formField.value;
        this.$store.commit('UPDATE_BODY', upd);
      },

      toggleVisibility(refName) {
        const s = (this.$refs[refName] || false).style;
        if (s) { s.display = (s.display === 'none' ? '' : 'none'); }
      },

    },
}
