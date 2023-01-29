/* -*- tab-width: 2 -*- */
'use strict';

const {collectIds} = require('@kba/anno-util');
const pEachSeries = require('p-each-series').default;

const eventBus = require('../event-bus');

const vuexUtil = require('./util.js');

const annotationList = require('./module/annotationList');
const editing = require('./module/editing');

const fetchAnnoList = require('./fetchers/annoList.js');
const fetchUserSessionInfo = require('./fetchers/userSessionInfo.js');

// function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }

function orf(x) { return x || false; }


module.exports = {
    strict: process.env.NODE_ENV != 'production',
    state: {
      // No settings here! Default config belongs in `../default-config.js`.
      acl: null,
      cacheBusterEnabled: false,
      editMode: null,
      userSessionInfo: false,
    },
    modules: {
        editing,
        annotationList,
    },
    getters: {

      isLoggedIn(state) {
        const fake = orf(state.acl)['debug:override:isLoggedIn'];
        if (fake || (fake === false)) { return fake; }
        const { userId } = orf(state.userSessionInfo);
        return Boolean(userId);
      },

        allIds(state) {
            const ret = collectIds(state.annotationList.list).filter(u => u.startsWith('http'))
            ret.push(state.targetSource)
            return ret
        },

    },
    mutations: {

        CHANGE_ACL(state, rules) {
            state.acl = Object.assign({}, state.acl, rules);
            eventBus.$emit('updatedPermissions');
        },

        EMPTY_ACL(state) {
            state.acl = {};
            eventBus.$emit('updatedPermissions');
        },

        SET_APP_STATE_PROP: vuexUtil.typesafeSetStateProp,
        FLAT_UPDATE_APP_STATE: vuexUtil.typesafeFlatUpdateState,

        INJECTED_MUTATION(state, mutationSpec) {
          const [mutaFunc, ...mutaArgs] = mutationSpec;
          // console.debug('INJECTED_MUTATION go!',
          //   { state: jsonDeepCopy(state), mutaFunc, mutaArgs });
          mutaFunc(state, ...mutaArgs);
          // console.debug('INJECTED_MUTATION done',
          //   { state: jsonDeepCopy(state), mutaFunc, mutaArgs });
        },

    },

    actions: {

      async retrieveInitialState(store) {
        pEachSeries([
          'fetchAnnoList',
          'fetchUserSessionInfo',
        ], async function dare(phase) {
          try {
            await store.dispatch(phase);
          } catch (err) {
            err.appInitPhase = phase;
            err.message += '; phase: ' + phase;
            eventBus.$emit('error', err);
          }
        });
      },

      fetchAnnoList,
      fetchUserSessionInfo,

      async runInjectedFunc(store, func) {
        // console.debug('runInjectedFunc', { store, func });
        return func(store);
      },

    },
}
