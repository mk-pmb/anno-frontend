/*
 * ### anno-editor-modal
 *
 * A bootstrap modal that holds a singleton [anno-editor](#anno-editor).
 *
 * Events: Same as in [anno-editor](#anno-editor)
 *
 */

const jq = require('jquery');
const HelpButton = require('../help-button');
const eventBus = require('../../event-bus.js');

const simpleEmitButtonHandlers = {
  // These handlers are so simple, I was tempted to just put their code in
  // @click. However, these buttons are prime candidates for having them in
  // multiple locations, which justifies a named method.
  save() { eventBus.$emit('save'); },
  discard() { eventBus.$emit('discard'); },
};

module.exports = {
    mixins: [
        require('../../mixin/annoUrls.js'),
        require('../../mixin/bootstrap-compat.js'),
        require('../../mixin/l10n.js'),
        require('../../mixin/prefix.js'),
        require('../../mixin/toplevel-css.js'),
    ],
    components: {HelpButton},
    template: require('./anno-editor-modal.html'),
    style:    require('./anno-editor-modal.scss'),
    computed: {
        annoIdUrl()    {return this.$store.state.editing.id},
        doi()          {return this.$store.state.editing.doi},
        editMode()     {return this.$store.state.editMode},
        editor()       {return this.$refs['editor']},

        isOpen() { return this.$el.classList.contains('open'); },
    },

    created() {
      const vueDialog = this;
      eventBus.$on('open-editor', () => vueDialog.show());
      eventBus.$on('close-editor', () => vueDialog.hide());
    },

    methods: {
        ...simpleEmitButtonHandlers,

        startHighlighting(...args) {eventBus.$emit('startHighlighting', ...args)},
        stopHighlighting(...args) {eventBus.$emit('stopHighlighting', ...args)},

        decideHeaderDetails() {
          const st = this.$store.state;
          const em = st.editMode;
          const hdr = { title: 'annoeditor_mode_' + em };
          if (em === 'reply') { hdr.refUrl = st.editEnforceReplying; }
          if (em === 'revise') { hdr.refUrl = st.editEnforceReplaces; }
          return hdr;
        },

        updateModal(opt) {
          jq(this.$refs.editorDialog).modal(opt);
        },

        show() {
          this.$el.classList.add('open');
          this.updateModal({
            keyboard: false,
            backdrop: 'static',
          }); /*
            NB: If the modal popup gets stuck with the background already
            fully transparent but still blocking access to the page beneath,
            it's probably because of a race condition with the fade animation.
            Solution: Don't use the "fade" class.
          */
        },

        hide() {
          this.updateModal('hide');
          this.$el.classList.remove('open');
        },

    },

};
