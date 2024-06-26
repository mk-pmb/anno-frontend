function _sortByDateTime(field, dir=1) {
    return function(a, b) {
        a = a[field] || 0
        b = b[field] || 0
        return dir * (!(a||b) ? 0 : !a ? +1 : !b ? -1 : a < b ? -1 : a > b ? +1 : 0)
    }
}

function _sortAlpha(field, dir=1) {
    return function(a, b) {
        [a, b] = [a, b].map(x => {
            x = x[field]
            if (!x) return ''
            if (x && typeof x.displayName === 'string') x = x.displayName
            if (typeof x === 'string') return x.toLowerCase()
            return ''
        })
        return dir * (!(a||b) ? 0 : !a ? +1 : !b ? -1 : a < b ? -1 : a > b ? +1 : 0)
    }
}

const sorters = {
    created_az: _sortByDateTime('created'),
    created_za: _sortByDateTime('created', -1),
    modified_az: _sortByDateTime('modified'),
    modified_za: _sortByDateTime('modified', -1),
    title_az: _sortAlpha('title'),
    title_za: _sortAlpha('title', -1),
    creator_az: _sortAlpha('creator'),
    creator_za: _sortAlpha('creator', -1),
}


function jsonDeepCopy(x) { return x && JSON.parse(JSON.stringify(x)); }


const ERR_NO_FETCH_ATTEMPT = ('Fetching has not been triggered'
  + ', probably because some earlier initialization failed.');


const annoList = {
    state: {
        list: [],
        sortedBy: 'created_az',
        allCollaped: 'false',
        fetching: false,
        fetchFailed: new Error(ERR_NO_FETCH_ATTEMPT),
    },
    getters: {
        numberOfAnnotations(state) {return state.list.length},
    },
    actions: {

        sort({commit}, sortBy) {
            commit('SORT_LIST', sortBy)
        },

        // TODO
        // resetAnnotationToVersion({commit, state}, {annotation, newState}) {
        //     commit('REPLACE_ANNOTATION', {annotation, newState})
        // }

    },
    mutations: {

      SORT_LIST(state, setNewSortOrder) {
        const nAnnos = state.list.length;
        const cdbg = (console.debugX || Boolean);
        if (!(setNewSortOrder || (nAnnos >= 2))) {
          cdbg('Vue mutation SORT_LIST: nothing to do.');
          return;
        }
        const sortBy = (setNewSortOrder || state.sortedBy);
        const plainList = nAnnos && jsonDeepCopy(state.list);
        cdbg('Vue mutation SORT_LIST: start', {
          nAnnos,
          configSort: state.sortedBy,
          setNewSortOrder,
          sortBy,
        });
        if (nAnnos >= 2) {
          plainList.sort(sorters[sortBy]);
          state.list = plainList;
        }
        if (setNewSortOrder) {
          cdbg('Vue mutation SORT_LIST: saving new sort order.');
          state.sortedBy = setNewSortOrder;
        }
        cdbg('Vue mutation SORT_LIST: done');
      },

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
            state.fetching = false;
            state.fetchFailed = false;
            state.list = list;
        },

    }
}

module.exports = annoList;
// ^-- also found as annoApp.$store.state.annotationList
