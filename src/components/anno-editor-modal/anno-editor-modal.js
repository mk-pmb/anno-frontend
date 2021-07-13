/*
 * ### anno-editor-modal
 *
 * A bootstrap modal that holds a singleton [anno-editor](#anno-editor).
 *
 * Events: Same as in [anno-editor](#anno-editor)
 *
 */

const $ = require('jquery')
const eventBus = require('@/event-bus')
const HelpButton = require('@/components/help-button')
const bootstrapCompat = require('../../bootstrap-compat');

module.exports = {
    mixins: [
        require('@/mixin/l10n'),
        require('@/mixin/auth'),
        require('@/mixin/prefix'),
    ],
    components: {HelpButton},
    data() {return {
      bootstrapOpts: bootstrapCompat.sharedConfig,
    }},
    template: require('./anno-editor-modal.html'),
    style:    require('./anno-editor-modal.scss'),
    computed: {
        id()           {return this.$store.state.editing.id},
        doi()          {return this.$store.state.editing.doi},
        purlTemplate() {return this.$store.state.purlTemplate},
        editMode()     {return this.$store.state.editMode},
        replyTo()      {return this.$store.state.editing.replyTo},
        editor()       {return this.$refs['editor']},
    },

    created() {
      const modal = this;
      eventBus.$on('open-editor', function openEditor() {
        modal.show();
      });
      eventBus.$on('close-editor', function closeEditor() {
        modal.$store.commit('SET_EDIT_MODE', '');
        modal.hide();
      });
    },

    methods: {
        save() {eventBus.$emit('save')},
        remove() {eventBus.$emit('remove', this.id)},
        discard() {eventBus.$emit('discard')},
        startHighlighting(...args) {eventBus.$emit('startHighlighting', ...args)},
        stopHighlighting(...args) {eventBus.$emit('stopHighlighting', ...args)},

        show(annotation) {
            $(this.$el).modal({
                keyboard: false,
                backdrop: 'static',
            })
        },
        hide() {$(this.$el).modal('hide')},
        purl(id) {
            return (this.purlTemplate && id)
                ? this.purlTemplate
                    .replace('{{ slug }}', id.replace(/.*\//, ''))
                : id ? id : ''
        },
    },
}
