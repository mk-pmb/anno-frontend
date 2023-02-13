const {
    ensureArray, add, remove,
} = require('@kba/anno-util')
const {
    relationLinkBody,
    semanticTagBody,
    simpleTagBody,
    svgSelectorResource,
    textualHtmlBody,
} = require('@kba/anno-queries')

const vuexUtil = require('../util.js');

function initialState() {
  return {
    body: null,
    created: '',
    creator: null,
    doi: null,
    extraFields: null,
    id: '',
    replyTo: null,
    rights: '',
    target: null,
    title: '',
    versionOf: '',
  };
}

//
// getters
//

const getters = {
    firstHtmlBody(a)      {return textualHtmlBody.first(a)},
    simpleTagBodies(a)    {return simpleTagBody.all(a)},
    semanticTagBodies(a)  {return semanticTagBody.all(a)},
    relationLinkBodies(a) {return relationLinkBody.all(a)},
    svgTarget(a)          {return svgSelectorResource.first(a)},
}

//
// mutations
//

const mutations = {

    ADD_TAG_BODY(state, v) {
        ensureArray(state, 'body')
        add(state, 'body', simpleTagBody.create(v))
    },


    SET_HTML_BODY_VALUE(state, v) {
        if (!textualHtmlBody.first(state)) {
            add(state, 'body', textualHtmlBody.create())
        }
        textualHtmlBody.first(state).value = v
    },

    REMOVE_TARGET(state, v) {
        remove(state, 'target', v)
    },

    REMOVE_BODY(state, v) {
        remove(state, 'body', v)
    },

    RESET_ANNOTATION(state) {
      Object.keys(state).forEach(function reset(key) {
        state[key] = null;    // trigger potential setter
        /* don't: delete state[key];
          It somehow breaks vue bindings on the bodies array,
          which would disconnect the list of SemTags and Links so
          they would be displayed as always-empty even though their
          "add" buttons do indeed still add empty entries.
        */
      });
      Object.assign(state, initialState());
    },

    SET_EDITOR_ANNO_PROP: vuexUtil.typesafeSetStateProp,
    FLAT_UPDATE_EDITOR_ANNO: vuexUtil.typesafeFlatUpdateState,

    ADD_MOTIVATION(state, v) {
        ensureArray(state, 'motivation')
        add(state, 'motivation', v)
    },

    ADD_RELATIONLINK(state, v) {
        ensureArray(state, 'body')
        add(state, 'body', relationLinkBody.create(v))
    },

    SET_RELATIONLINK_PROP(state, {n, prop, value}) {
        if (!Array.isArray(value)) value = [value]
        const addTo = relationLinkBody.all(state)[n]
        ensureArray(addTo, prop)
        addTo[prop].splice(0, addTo[prop].length)
        value.forEach(v => {
            // console.debug('SET_RELATIONLINK_PROP: addTo:', addTo)
            add(addTo, prop, v)
        })
    },

    ADD_SEMTAG_BODY(state, v) {
        ensureArray(state, 'body')
        add(state, 'body', semanticTagBody.create(v))
    },

    SET_SEMTAG_PROP(state, {n, prop, value}) {
        if (!Array.isArray(value)) value = [value]
        const addTo = semanticTagBody.all(state)[n]
        ensureArray(addTo, prop)
        addTo[prop].splice(0, addTo[prop].length)
        value.forEach(v => {
            // console.debug('SET_SEMTAG_PROP: addTo:', addTo)
            add(addTo, prop, v)
        })
    },

}

module.exports = {
    state: initialState(),
    getters,
    mutations,
}
