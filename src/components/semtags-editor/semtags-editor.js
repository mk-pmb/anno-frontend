const arrayOfTruths = require('array-of-truths');
const authorities = require('@ubhd/authorities-client');
const bonanza = require('bonanza');

const authHelpers = authorities.utils.handlebars.helpers;
const gndClient = authorities.plugin('ubhd/gnd');

/*
 * ### semtags-editor
 *
 * Editor for *semantic* tags, i.e. link-label tuples with autocompletion.
 *
 */


const purpose = 'classifying';

function mapSemanticTag(body, idx) {
  return (body.purpose === purpose) && { ...body, '#': idx };
}


function preserveUserInput(commit, ev) {
  const el = ev.target;
  const userInputValue = el.value;
  const oldSemTitle = el.dataset.semTitle;
  if (userInputValue === oldSemTitle) { return; }
  el.dataset.semSource = '';
  const idx = +el.dataset.bodyIndex;
  console.debug('SemTag input changed',
    { idx, oldSemTitle, userInputValue, el, ev });
  this.$store.commit('UPDATE_EDITOR_ANNO_LIST_PROP',
    { prop: 'body', idx, upd: { source: '', 'dc:title': userInputValue } });
}


module.exports = {
    mixins: [
        require('@/mixin/l10n'),
    ],
    template: require('./semtags-editor.html'),
    style: [
        require('./bonanza.sass'),
        require('./semtags-editor.scss'),
    ],
    computed: {
        language() { return this.$store.state.language },
    },
    mounted() {
      this.ensureCompletion()
      // const editor = this;
      // const addersTextFields = jq(editor.$el).find('input.semtag-value');
    },
    updated() {
      this.ensureCompletion()
    },
    methods: {

      getSemanticTagBodies() {
        const allBodies = this.$store.state.editing.body;
        if (!allBodies) { return []; }
        return arrayOfTruths(allBodies.map(mapSemanticTag));
      },



      makeEmptyBody() {
        return {
          type: 'SpecificResource',
          'dc:title': '',
          purpose,
          source: '',
        };
      },

      addBody() {
        this.$store.commit('UPDATE_EDITOR_ANNO_LIST_PROP',
          { prop: 'body', idx: '+', val: this.makeEmptyBody() });
      },

      removeBody(idx) {
        this.$store.commit('UPDATE_EDITOR_ANNO_LIST_PROP',
          { prop: 'body', idx, del: true });
      },


        ensureCompletion() {
            const editor = this;
            const getLabel = (obj) => authHelpers.preferredName(obj)
            const getSource = ({gndIdentifier}) => `https://d-nb.info/gnd/${gndIdentifier}`

            Array.from(editor.$el.querySelectorAll(`input.semtag-value`))
                .filter(el => !el.classList.contains('has-completion'))
                .forEach(el => {
                    el.classList.add('has-completion')
                    const bodyIndex = +el.dataset.bodyIndex;
                    bonanza(
                        el,
                        {
                            templates: {
                                itemLabel(obj) { return authHelpers.helpfulPreferredName(obj) },
                                label(obj) { return getLabel(obj)}
                            },
                            limit: 50,
                            hasMoreItems(result) {
                                return !!result.numFound && ( (result.start + result.docs.length) < result.numFound )
                            },
                            getItems(result) {
                                return result.docs
                            }
                        },
                        function(query, cb) {
                            if (!(query && query.search)) return cb(null, [])
                            gndClient.search(query.search, {
                                types: [
                                    "Country",
                                    "AdministrativeUnit",
                                    "TerritorialCorporateBodyOrAdministrativeUnit",
                                    "MemberState",
                                    "DifferentiatedPerson",
                                    "UndifferentiatedPerson",
                                ],
                                count: query.limit,
                                offset: query.offset,
                                queryLevel: 0
                            })
                                .then(results => cb(null, results.response))
                                .catch(err => cb(err))
                        }
                    ).on('change', (value) => {
                        const label = getLabel(value);
                        const source = getSource(value);
                        console.debug('SemTag label selected',
                          { bodyIndex, value, label, source, el });
                        el.dataset.semTitle = label;
                        el.dataset.semSource = source;
                        if (bodyIndex !== undefined) {
                          const upd = { 'dc:title': label, source };
                          editor.$store.commit('UPDATE_EDITOR_ANNO_LIST_PROP',
                            { prop: 'body', idx: bodyIndex, upd });
                        }
                    });

                    const pui = preserveUserInput.bind(null,
                      editor.$store.commit);
                    el.onchange = pui;
                    el.onblur = pui;
                })

        },
    },
}
