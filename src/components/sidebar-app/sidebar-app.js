/*
 * ### sidebar-app
 *
 * Container for the list of annotations for a target and a modal editor to
 * edit/create new annotations.
 *
 */

const eventBus = require('../../event-bus.js');


module.exports = {

  mixins: [
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
    require('../../mixin/toplevel-css.js'),
  ],

  template: require('./sidebar-app.html'),
  style: [
    require('./sidebar-app.scss'),
    require('./bootstrap-tweaks.scss'),
  ],

  data() {
    // const sba = this;
    // const { state } = sba.$store;
    return {
      msgBoxes: [],
    };
  },


  computed: {
    appMode() { return this.$store.state.initAppMode; },
    numberOfAnnotations() { return this.$store.getters.numberOfAnnotations; },
    editor() { return this.$refs.modalEditor.$refs.editor; },

    isLoggedIn() { return this.$store.getters.isLoggedIn; },

    noAnnotsReason() {
      const app = this;
      const alSt = app.$store.state.annotationList;
      if (alSt.list.length) { return false; }
      const loadFail = alSt.fetchFailed;
      const code = ((alSt.fetching && 'loading')
        || (loadFail && 'loadfail')
        || 'empty');
      const reason = { code, msg: app.l10n('anno_list:' + code) };
      if (code === 'loadfail') {
        reason.msg += ' ' + String(loadFail);
        reason.err = loadFail;
      }
      return reason;
    },
  },


  methods: {

    updateMsgBox(add, discard) {
      const sba = this;
      // console.debug('updateMsgBox', { add, discard });
      if (add) {
        Object.freeze(add);
        // window.added = add;
      }
      const { grp } = (add || false);
      let dis = discard;
      // window.discarded = dis;
      if (grp) {
        if (dis) {
          throw new Error('Discard invalid when adding box with group');
        }
        dis = grp;
      }
      const boxes = sba.msgBoxes.map(box => (box
        && (dis !== box)
        && (dis !== box.grp)
        && box
        )).filter(Boolean);
      if (add) { boxes.push(add); }
      // window.boxes = boxes;
      sba.msgBoxes = boxes;
    },

    reportError(err) {
      if (!err) { return; }
      const sba = this;
      sba.updateMsgBox({
        cls: 'error',
        msgTypePrefix: sba.l10n('error:'),
        msg: String(err).trim().replace(/\r?\n/g, '¶ '),
        hint: err.hint,
        err,
      });
    },

    abortLurkMode(reason) {
      const sba = this;
      const { state, commit } = sba.$store;
      if (!state.lurkMode) {
        return console.warn('AnnoApp: abortLurkMode request: unexpected',
          { reasonGiven: reason });
      }
      if (reason !== 'FORCE_ABORT_ANY') {
        const currentLurkReason = state.lurkMode.reason;
        if (currentLurkReason !== reason) {
          return console.warn('AnnoApp: abortLurkMode request: wrong reason:',
            { reasonGiven: reason, currentLurkReason });
        }
      }
      commit('SET_APP_STATE_PROP', ['lurkMode', false]);
      sba.$refs.modalEditor.show();
    },

    compileLurkModeDetails() {
      const { lurkMode } = this.$store.state;
      if (!lurkMode) { return false; }
      const { l10n } = this;
      const reason = lurkMode.reason || '';

      function voc(v, d) {
        return (l10n(lurkMode[v + 'Voc'])
          || (reason && l10n('lurk:' + v + ':' + reason, ''))
          || l10n('lurk:' + v + ':generic', l10n(d)));
      }

      const det = {
        explained: voc('explain').replace(/@@module@@/g, voc('module')),
        waiting: voc('waiting'),
        abortButtonCaption: voc('abort', 'cancel'),
      };
      return det;
    },


  },


  created() {
    const sba = this;
    eventBus.$on('showMsgBox', msg => sba.updateMsgBox(msg));
    eventBus.$on('discardMsgBox', msg => sba.updateMsgBox(null, msg));
    eventBus.$on('error', sba.reportError);
    eventBus.$on('trackPromise',
      pr => Promise.resolve(pr).then(null, sba.reportError));
  },


  mounted() {
    const sba = this;
    document.body.setAttribute('anno-app-mode', sba.appMode);

    eventBus.$on('startLurkMode', function setLurkMode(how) {
      if (!how) { return; }
      sba.$store.commit('SET_APP_STATE_PROP', ['lurkMode', { ...how }]);
      sba.$refs.modalEditor.hide();
    });
    eventBus.$on('abortLurkMode', (...args) => sba.abortLurkMode(...args));
  },


};
