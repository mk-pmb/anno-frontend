const {
    add,
    ensureArray,
} = require('@kba/anno-util')
const {
    relationLinkBody,
    semanticTagBody,
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
    // language: see not-a-bug-230902-001
  };
}

//
// getters
//

const getters = {
    firstHtmlBody(a)      {return textualHtmlBody.first(a)},
    semanticTagBodies(a)  {return semanticTagBody.all(a)},
    relationLinkBodies(a) {return relationLinkBody.all(a)},
}

//
// mutations
//

const mutations = {

    SET_HTML_BODY_VALUE(state, v) {
        ensureArray(state, 'body');
        let body = getters.firstHtmlBody(state);
        if (!body) {
            if (!v) { return; }
            body = textualHtmlBody.create();
            add(state, 'body', body);
        }
        body.value = v;
    },


    ADD_BODY(state, bodyData) { state.body.push(bodyData); },
    REMOVE_BODY(state, idx) { state.body.splice(idx, 1); },
    UPDATE_BODY(st, { '#': idx, ...upd }) { Object.assign(st.body[idx], upd); },


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

}

module.exports = {
    state: initialState(),
    getters,
    mutations,
}
