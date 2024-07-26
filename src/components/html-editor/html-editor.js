const Quill = require('quill/dist/quill.js')

// const { textualHtmlBody } = require('@kba/anno-queries')

const eventBus = require('@/event-bus')

/**
 * ### html-editor
 *
 * Editor for the `text/html` `TextualBody` body of an annotation.
 *
 */

function replaceClassSpan(orig, cls, inner) {
  // console.debug('replaceClassSpan:', { orig, cls, inner });
  if (cls === 'ql-size-normal') { return inner; }
  if (cls === 'ql-size-small') { return '<small>' + inner + '</small>'; }
  return orig;
}

module.exports = {
    mixins: [
        require('@/mixin/l10n'),
        require('@/mixin/prefix'),
    ],
    style: [
      require('quill/dist/quill.snow.css'),
      require('./html-editor.scss'),
    ],
    template: require('./html-editor.html'),
    mounted() {
        const {l10n} = this
        this.quill = new Quill(this.$refs.editor, {
            modules: {
                toolbar: {
                    container: this.$refs.toolbar,
                    handlers: {
                        undo() {this.quill.history.undo()},
                        redo() {this.quill.history.redo()},
                        image() {
                          const value = window.prompt(l10n("image.prompt.url"))
                          if (!value) {return}
                          // // TODO
                          // if (!value.match(/^https?:\/\/heidicon/)) {
                          //   window.alert("Domain not allowed :(")
                          // }
                          this.quill.insertEmbed(
                            this.quill.getSelection().index,
                            'image',
                            value,
                            Quill.sources.USER)
                        },
                    }
                }
            },
            placeholder: this.l10n('editor_placeholder'),
            theme: 'snow',
        })
        this.quill.on('text-change', (/* delta, oldDelta, source */) => {
            // console.debug('HTML editor text change in:', this.$refs.editor);
            this.value = this.$refs.editor.children[0].innerHTML;
        })
        eventBus.$on('html-editor-reload-html', () => this.quill.pasteHTML(this.value))
        eventBus.$on('open-editor', () => this.quill.pasteHTML(this.value))
        eventBus.$on('close-editor', () => this.quill.pasteHTML(''))
    },
    computed: {
      value: {
        get() {
          return (this.$store.getters.firstHtmlBody || false).value || '';
        },
        set(orig) {
          let h = orig;
          h = h.replace(/<span class="(ql-[^<>]*)">((?:[^<>]|<\/?(?:br|img|a|i|u)(?:\/| [^<>]*|)>)+)<\/span>/g, replaceClassSpan);
          h = h.replace(/\s*<br[\/\s]*>/g, '<br>');
          h = h.replace(/<img [^<>]+/g, s => s.replace(/\s*\/?$/, ''));
          h = h.replace(/(<\/p>\s*<p>)((?:<br>)*)/g, '$2$1');
          h = h.replace(/^(<p>(?:\s|<br>)*<\/p>)+/g, '');
          h = h.replace(/<p><br ?\/?><\/p>/g, '<p>&nbsp;</p>');
          h = h.replace(/<p>\s*<\/p>/g, '');
          this.$store.commit('SET_HTML_BODY_VALUE', h)
        },
      },
    },

};
