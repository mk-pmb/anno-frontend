/*
 * ### anno-editor
 *
 * The editor has three modes: `create`, `reply` and `revise` that represent
 * the function of the anno-store to be used on `save`
 *
 * Properties:
 *
 * Events:
 *
 * - `close-editor`: The editor was closed
 * - `removed(annoIdUrl)`: Annotation was removed
 *
 */

const eventBus = require('../../event-bus.js');

const decideTargetForNewAnno = require('./decideTargetForNewAnno.js');
const saveCreate = require('./saveCreate.js');
const fixupLegacyAnno = require('./fixupLegacyAnno.js');

// function soon(f) { return setTimeout(f, 1); }


module.exports = {
    mixins: [
        require('@/mixin/l10n'),
        require('@/mixin/api'),
        require('@/mixin/prefix'),
    ],
    template: require('./anno-editor.html'),
    style: require('./anno-editor.scss'),
    props: {
        editorId: {type: String, default: 'anno-editor'},
        enableTabTags: {type: Boolean, default: false},
    },
    data() {
      return {
        forceUpdatePreviewTs: 0,
      };
    },
    created() {
      const editor = this;
        // TODO Move these to store maybe??
        const editorOpenCssClass = 'has-annoeditor-showing';
        eventBus.$on('create', this.create)
        eventBus.$on('reply', this.reply)
        eventBus.$on('revise', this.revise)
        eventBus.$on('remove', this.remove)
        eventBus.$on('discard', this.discard)
        eventBus.$on('save', this.save)
        eventBus.$on('saveNewDraft', () => {
          editor.switchTabByRefName('draftsPanel');
          editor.$refs.draftsPanel.saveNew();
        });
        eventBus.$on('switchEditorTabByRefName', editor.switchTabByRefName);
        eventBus.$on('close-editor', () => {
          document.body.classList.remove(editorOpenCssClass);
        });
        eventBus.$on('open-editor', function onOpenEditor(opt) {
          if (!opt) { return onOpenEditor(true); }
          document.body.classList.add(editorOpenCssClass);
          editor.switchTabByRefName(opt.tabRefName || 'commentTextTab');

          const { targetImage, zoneEditor } = editor;
          if (zoneEditor) {
            try {
              if (zoneEditor.shouldHaveHadAnyImageEverBefore) {
                // Without an image loaded, the first reset() call would
                // log a confusing error message about the image not having
                // been loaded yet.
                // :TODO: Fix upstream.
                zoneEditor.reset();
              }
              if (targetImage) {
                zoneEditor.shouldHaveHadAnyImageEverBefore = true;
                zoneEditor.loadImage(targetImage);
              }
            } catch (zoneEditErr) {
              console.error('Zone editor init failure:', zoneEditErr);
            }
          }
        })
    },
    mounted() {
      const editor = this;
      const { targetImage, zoneEditor } = editor;
      if (targetImage) {
        zoneEditor.$on('load-image', () => {
          editor.loadSvg();
        });
        zoneEditor.$on('svg-changed', (/* svg */) => {
          const { thumbnail } = editor.$refs.preview.$refs;
          if (!thumbnail) { return; }
          thumbnail.reset();
          thumbnail.loadSvg(editor.svgTarget.selector.value);
        });
      }
    },
    computed: {
        annoIdUrl()       {return this.$store.state.editing.id},
        targetImage()     {return this.$store.state.targetImage},
        targetThumbnail() {return this.$store.state.targetThumbnail},
        targetSource()    {return this.$store.state.targetSource},
        svgTarget()       {return this.$store.getters.svgTarget},
        zoneEditor()      {return this.$refs.zoneEditor},

        knownAuthorIdentities() {
          const sess = this.$store.state.userSessionInfo;
          // ^- Already proxified by vue, so we don't need to
          //    protect anything by deep-copying it.
          return ((sess || false).authorIdentities || []);
        },

        stubbedAnnotationForPreview() {
          const editor = this;
          const now = Date.now();
          const orig = editor.getCleanAnno();
          const ann = {
            created: now,
            modified: now,
            'x-force-update-preview': editor.forceUpdatePreviewTs,
            ...orig,
          };
          return ann;
        },

        editMode: {
          get() {return this.$store.state.editMode},
          set(newVal) { this.$store.commit('SET_EDIT_MODE', newVal); },
        },

        title: {
          get() { return this.$store.state.editing.title; },
          set(newVal) { this.$store.commit('SET_TITLE', newVal); },
        },

        titleRequired() {
          return !this.$store.state.editing.replyTo;
        },

    },
    methods: {

      forceUpdatePreview() { this.forceUpdatePreviewTs = Date.now(); },
      getCleanAnno() { return fixupLegacyAnno(this.$store.state.editing); },
      getAnnoTitle() { return this.$store.state.editing.title; },
      setStatusMsg(...args) { return this.$refs.statusMsg.setMsg(...args); },

      switchTabByRefName(refName) {
        const refs = this.$refs;
        refs.tablist.switchToTabPaneByVueElem(refs[refName]);
      },

      save() {
        const editor = this;
        const { editMode } = editor;
        if (editMode === 'create') { return saveCreate(editor); }
        window.alert('Save not implemented for editMode = ' + editMode);
      },

        loadSvg() {
            const svg = (this.svgTarget && this.svgTarget.selector.value) ? this.svgTarget.selector.value : false
            // console.log({svg})
            if (svg) this.zoneEditor.loadSvg(svg)
        },

        discard() {
            this.$store.commit('RESET_ANNOTATION')
            eventBus.$emit('close-editor')
        },

        remove(annoOrId) {
          if (!window.confirm(this.l10n('delete_anno_confirm'))) { return; }
          const annoIdUrl = (annoOrId.id || annoOrId);
          const self = this;
          const { api, $store } = self;
          api.delete(annoIdUrl, (err) => {
            if (err) { return console.error(err); }
            console.debug('API confirms anno as removed:', annoIdUrl);
            eventBus.$emit('removed', annoIdUrl);
            $store.dispatch('fetchAnnoList');
            self.discard();
          });
        },

        create() {
          const editor = this;
          const { commit, state } = editor.$store;
          commit('SET_EDIT_MODE', 'create');
          commit('RESET_ANNOTATION');
          commit('ADD_TARGET', decideTargetForNewAnno(state));
          eventBus.$emit('open-editor');
        },

        reply(annotation) {
            this.$store.commit('SET_EDIT_MODE', 'reply')
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('SET_HTML_BODY_VALUE', '')
            this.$store.commit('ADD_TARGET', {id: annotation.id, scope: this.targetSource})
            this.$store.commit('ADD_MOTIVATION', 'replying')
            this.$store.commit('SET_REPLY_TO', annotation.id)
            eventBus.$emit('open-editor')
        },

        revise(annotation) {
            this.$store.commit('SET_EDIT_MODE', 'revise')
            this.$store.commit('SET_COLLECTION', this.$store.state.collection)
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('REPLACE_ANNOTATION', annotation)
            eventBus.$emit('open-editor')
        },

      updateSvgSelector(svg) {
        function upd(state) {
          // Do not preserve any previous selectors because we'd have to
          // ensure they are conceptually equivalent, and we cannot do that
          // in software.
          state.editing.target = {
            scope: state.targetSource,
            source: state.targetImage,
            selector: { type: 'SvgSelector', value: svg },
          };
        }
        this.$store.commit('INJECTED_MUTATION', [upd]);
      },

      async onSelectAuthorIdentity(evt) {
        const agent = evt.currentAgent;
        function upd(state) { state.editing.creator = agent; }
        await this.$store.commit('INJECTED_MUTATION', [upd]);
        this.forceUpdatePreview();
      },

    }
}
