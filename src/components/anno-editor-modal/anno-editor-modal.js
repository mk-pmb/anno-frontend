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
        require('../../mixin/auth.js'),
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
    },

    created() {
      const vueDialog = this;
      eventBus.$on('open-editor', () => vueDialog.show());
      eventBus.$on('close-editor', () => vueDialog.hide());
    },

    methods: {
        ...simpleEmitButtonHandlers,
        remove() {eventBus.$emit('remove', this.annoIdUrl)},

        startHighlighting(...args) {eventBus.$emit('startHighlighting', ...args)},
        stopHighlighting(...args) {eventBus.$emit('stopHighlighting', ...args)},

        decideHeaderDetails() {
          const { editMode, editing } = this.$store.state;
          const hdr = { title: 'annoeditor_mode_' + editMode };
          if (editMode === 'revise') { hdr.annoIdUrl = editing.id; }
          if (editMode === 'reply') { hdr.annoIdUrl = editing.replyTo; }
          return hdr;
        },

        updateModal(opt) {
          const vueDialog = this;
          const dialogDomElem = vueDialog.$refs.annoEditorDialog;
          jq(dialogDomElem).modal(opt);
        },

        show(/* annotation */) {
          this.updateModal({
            keyboard: false,
            backdrop: 'static',
          });
        },

        hide() { this.updateModal('hide'); },

    },

};
