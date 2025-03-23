const eventBus = require('../../event-bus.js');


const ERR_NO_FETCH_ATTEMPT = ('Fetching has not been triggered'
  + ', probably because some earlier initialization failed.');


const annoList = {
    state: {
        list: [],
        allCollaped: 'false',
        fetching: false,
        fetchFailed: new Error(ERR_NO_FETCH_ATTEMPT),
    },
    getters: {
        numberOfAnnotations(state) {return state.list.length},
    },
    actions: {

        // TODO
        // resetAnnotationToVersion({commit, state}, {annotation, newState}) {
        //     commit('REPLACE_ANNOTATION', {annotation, newState})
        // }

    },
    mutations: {

        // TODO
        // REPLACE_ANNOTATION_IN_LIST(state, {annotation, newState}) {
        //     const idx = state.list.indexOf(annotation)
        //     Object.keys(state.list[idx]).forEach(k => {
        //         if (k === 'hasReply' || k === 'hasVersion') return
        //         else if (k in newState) state.list[idx][k] = newState[k]
        //         else state.list[idx][k] = null
        //     })
        // },

        ANNOLIST_UPDATE_STATE(state, upd) {
          // console.debug('ANNOLIST_UPDATE_STATE():', upd, state);
          Object.assign(state, upd);
        },

        ANNOLIST_REPLACE(state, list) {
            state.fetchFailed = false;
            state.fetching = false;
            state.list = list;
            setTimeout(() => eventBus.$emit('annoListReplaced'), 1);
        },

    }
}

module.exports = annoList;
// ^-- also found as annoApp.$store.state.annotationList
