'use strict';

const objHop = Object.prototype.hasOwnProperty;


const EX = {

  typesafeSetStateProp(state, singleArg) {
    // Vue's commit() can only use a single argument, so we have to unpack it:
    const [k, v] = singleArg;
    if (!objHop.call(state, k)) {
      const msg = ('vuex util: typesafeSetStateProp: property not in model: '
        + JSON.stringify(k)
        + ' — assigning it would soon cause «[Vue warn]: Error in nextTick:'
        + ' "TypeError: invalid \'instanceof\' operand type"»'
        + ' and potential subsequent model data binding failure.');
      const err = new TypeError(msg);
      err.key = k;
      err.val = v;
      throw err;
    }
    if ((v === undefined) || (v === null)) {
      delete state[k];
    } else {
      state[k] = v;
    }
  },

  typesafeFlatUpdateState(st, upd) {
    Object.entries(upd).forEach(e => EX.typesafeSetStateProp(st, e));
  },



};


module.exports = EX;
