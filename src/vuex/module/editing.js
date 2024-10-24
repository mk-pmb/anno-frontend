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

    UPDATE_EDITOR_ANNO_LIST_PROP(state, how) {
      const { prop, upd, del } = how;
      let { idx, val } = how;
      const list = [].concat(state[prop] || []);
      if (idx === '+') { idx = list.length; }
      if (val !== undefined) { list[idx] = val; }
      if (upd) { list[idx] = { ...list[idx], ...upd }; }
      if (del) {
        val = list[idx];
        if (del.substr) { delete val[del]; }
        if (del.forEach) { del.forEach(k => delete val[k]); }
        if (del === true) { list.splice(idx, 1); }
      }
      state[prop] = list;
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

}

module.exports = {
    state: initialState(),
    getters,
    mutations,
}
