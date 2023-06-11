/*
 * ### sidebar-app
 *
 * Container for the list of annotations for a target and a modal editor to
 * edit/create new annotations.
 *
 * #### Props
 *
 * - `collapseInitially`: Whether the annotation list should be collapsed after loading
 * - `standalone`: Whether the sidebar should inject it's own
 *   toggleing/container elements or reuse existing DOM elements. If the
 *   latter, `el` must be set. See [`displayAnnotations`](#displayannotations)
 *
 *
 */

const eventBus = require('../../event-bus.js');


module.exports = {

  props: {
      collapseInitially: {type: Boolean, default: false},
      standalone: {type: Boolean, default: false},
  },

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

  data() {return {
      collapsed: this.collapseInitially,
      msgBoxes: [],
  }},

  computed: {
    appMode() { return this.$store.state.initAppMode; },
    numberOfAnnotations() { return this.$store.getters.numberOfAnnotations; },

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

    toggle() { this.collapsed = !this.collapsed; },

    updateMsgBox(add, discard) {
      const sba = this;
      console.debug('updateMsgBox', { add, discard });
      if (add) {
        Object.freeze(add);
        window.added = add;
      }
      const { grp } = (add || false);
      let dis = discard;
      window.discarded = dis;
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
      window.boxes = boxes;
      sba.msgBoxes = boxes;
    },

    reportError(err) {
      if (!err) { return; }
      const sba = this;
      sba.updateMsgBox({
        cls: 'error',
        msgTypePrefix: sba.l10n('error:'),
        msg: String(err),
        hint: err.hint,
        err,
      });
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
  },

};
