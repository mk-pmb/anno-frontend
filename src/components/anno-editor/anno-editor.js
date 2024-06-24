const isStr = require('is-string');
const jQuery = require('jquery');

const eventBus = require('../../event-bus.js');

const decideTargetForNewAnno = require('./decideTargetForNewAnno.js');
const getCleanAnno = require('./getCleanAnno.js');
const loadAnnoData = require('./loadAnnoData.js');
const saveCreate = require('./saveCreate.js');
const categorizeTargets = require('./categorizeTargets.js');

// function soon(f) { return setTimeout(f, 1); }
function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function orf(x) { return x || false; }

const emptySvgTagRgx = /^<svg\s*>\s*<\/svg\s*>$/;

const symbolForNoLanguage = '\u00A0\u2044';
/*  Some candidates:
    U+2043 hyphen bullet (⁃)
    U+2044 fraction slash (⁄)
    U+2425 symbol for delete form two (␥)
    U+25CC dotted circle (◌)
    U+29C4 squared rising diagonal slash (⧄)
    U+2A02 n-ary circled times operator (⨂)
    U+2A09 n-ary times operator (⨉)
    U+2B1A dotted square (⬚)
    U+2B55 heavy large circle (⭕)
    U+2B58 heavy circle (⭘)
    U+2B59 heavy circled saltire (⭙)
    U+2BBE circled x (⮾)
    U+2BBF circled bold x (⮿)
    U+2BD1 uncertainty sign (⯑)
    U+168EF bamum letter phase-c pen (𖣯)
    U+1693A bamum letter phase-d kun (𖤺)
    U+1D10D musical symbol repeated figure-1 (𝄍)
    U+1D1AF musical symbol pedal up mark (𝆯)
    U+1D23A greek instrumental notation symbol-47 (𝈺)
*/


module.exports = {

  mixins: [
    require('../../mixin/annoUrls.js'),
    require('../../mixin/api.js'),
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
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
      initialAuthorAgent: {},
      previousChosenAuthorIdUrl: '',
      annoLanguage: {
        keepOrigExtra: '',
        selected: '',
      },
      symbolForNoLanguage,
      zoneEditorEventsSetupDone: false,
    };
  },

  created() {
    const editor = this;
    // :TODO: [legacy-todo] Move these to store maybe??
    const editorOpenCssClass = 'has-annoeditor-showing';
    eventBus.$on('create', this.create)
    eventBus.$on('reply', this.reply)
    eventBus.$on('revise', this.revise)
    eventBus.$on('discard', this.discard)
    eventBus.$on('save', this.save)
    eventBus.$on('loadAnnoData', editor.loadAnnoData);
    eventBus.$on('saveNewDraft', () => {
      editor.switchTabByRefName('draftsPanel');
      editor.$refs.draftsPanel.saveNew();
    });
    eventBus.$on('switchEditorTabByRefName', editor.switchTabByRefName);
    eventBus.$on('updateZoneEditorImage',
      (imgUrl) => window.alert('Stub! updateZoneEditorImage:\n' + imgUrl));
    eventBus.$on('close-editor', () => {
      document.body.classList.remove(editorOpenCssClass);
    });
    eventBus.$on('open-editor', function onOpenEditor(opt) {
      if (!opt) { return onOpenEditor(true); }
      document.body.classList.add(editorOpenCssClass);
      jQuery(editor.$el).find('.initially-hidden').hide();
      editor.setStatusMsg(); // reset = dismiss
      editor.switchTabByRefName(opt.tabRefName || 'commentTextTab');
      console.debug('Anno-Editor: Initial zone selector:',
        [editor.getZoneSelectorSvg()]);
      editor.initializeZoneEditor();
    });
  },

  mounted() {
    const editor = this;
    editor.initializeZoneEditor();
  },

  computed: {

    annoIdUrl()       { return this.$store.state.editing.id; },
    targetImage()     { return this.$store.state.targetImage; },
    targetSource()    { return this.$store.state.targetSource; },
    zoneEditor()      { return this.$refs.zoneEditor; },

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
      get() { return this.$store.state.editMode },
      set(v) { throw new Error('Legacy assignment: editMode = ' + v); },
    },

    title: {
      get() { return this.$store.state.editing.title; },
      set(t) { this.$store.commit('SET_EDITOR_ANNO_PROP', ['title', t]); },
    },

    titleRequired() {
      return !this.$store.state.editing.replyTo;
    },

  },

  methods: {

    forceUpdatePreview() { this.forceUpdatePreviewTs = Date.now(); },
    getAnnoTitle() { return this.$store.state.editing.title; },
    setStatusMsg(...args) { return this.$refs.statusMsg.setMsg(...args); },

    loadAnnoData,
    getCleanAnno,

    switchTabByRefName(refName) {
      const refs = this.$refs;
      refs.tablist.switchToTabPaneByVueElem(refs[refName]);
    },

    getPrimarySubjectTarget() {
      const { state } = this.$store;
      const tgtCateg = categorizeTargets(state, state.editing.target);
      // console.debug('getPrimarySubjectTarget: tgtCateg:', tgtCateg);
      return orf(tgtCateg.subjTgt);
    },

    getZoneSelectorSvg() {
      const sel = this.getPrimarySubjectTarget().selector;
      // console.debug('getZoneSelectorSvg', { sel }, orf(sel).value);
      if (!sel) { return false; }
      if (sel.type !== 'SvgSelector') { return false; }
      return (sel.value || '');
    },

    save() {
      const editor = this;
      const { editMode } = editor;
      if (editMode === 'create') { return saveCreate(editor); }
      if (editMode === 'revise') { return saveCreate(editor); }
      if (editMode === 'reply') { return saveCreate(editor); }
      window.alert('Save not implemented for editMode = ' + editMode);
    },

    discard() {
      this.$store.commit('RESET_ANNOTATION')
      eventBus.$emit('close-editor')
    },

    decideDefaultAuthorAgent() {
      const editor = this;
      const { authorIdentities } = orf(editor.$store.state.userSessionInfo);
      if (!orf(authorIdentities).length) { return; }
      if (authorIdentities.length === 1) { return authorIdentities[0]; }
      const prev = editor.previousChosenAuthorIdUrl;
      if (!prev) { return; }
      function isPrevAgent(a) { return orf(a).id /* Agent ID */ === prev; }
      const agent = authorIdentities.find(isPrevAgent);
      return agent;
    },

    async startCompose(editMode, annoDataTmpl) {
      const editor = this;
      const { commit, state } = editor.$store;
      commit('SET_APP_STATE_PROP', ['editMode', editMode]);
      await editor.loadAnnoData(annoDataTmpl(state));
      eventBus.$emit('open-editor');
    },

    async create() {
      const editor = this;
      await editor.startCompose('create', state => ({
        creator: editor.decideDefaultAuthorAgent(),
        target: decideTargetForNewAnno(state),
      }));
    },

    async reply(refAnno) {
      const editor = this;
      const replyToUrl = (
        refAnno['dc:isVersionOf']
        || refAnno.id
        );
      const replyTgt = { id: replyToUrl, scope: editor.targetSource };
      const { l10n } = editor;
      const title = (l10n('reply_title_prefix')
        + (refAnno['dc:title'] || refAnno.title));
      await editor.startCompose('reply', state => ({
        creator: editor.decideDefaultAuthorAgent(),
        title,
        target: [replyTgt, decideTargetForNewAnno(state)],
        'as:inReplyTo': replyToUrl,
        motivation: ['replying'],
      }));
    },

    async revise(oldAnno) {
      const anno = jsonDeepCopy(oldAnno);
      const oldAnnoIdUrl = anno.id;
      if (!oldAnnoIdUrl) { throw new Error('revise(): oldAnno has no id!'); }
      if (!anno['dc:isVersionOf']) {
        anno['dc:isVersionOf'] = (
          anno.canonical
          || oldAnnoIdUrl
          );
      }
      anno['dc:replaces'] = oldAnnoIdUrl;
      delete anno.canonical;
      delete anno.id;
      delete anno.via;
      // console.debug('anno-editor revise():', anno);
      await this.startCompose('revise', () => anno);
    },

    setZoneSelector(newSvg) {
      const editor = this;
      let optimizedSvg = String(newSvg || '').trim();
      if (emptySvgTagRgx.test(optimizedSvg)) { optimizedSvg = ''; }
      if (optimizedSvg && (!/\d/.test(optimizedSvg))) {
        window.prompt(editor.l10n('please_report_error:'),
          'Error: numberless SVG selector: ' + encodeURI(optimizedSvg));
      }
      const oldSvg = editor.getZoneSelectorSvg();
      console.debug('Anno-Editor: setZoneSelector:',
        { oldSvg, newSvg: (newSvg === oldSvg ? '(same)' : newSvg) });
      if (newSvg === oldSvg) { return; }
      const { state } = editor.$store;
      const origTgt = state.editing.target;
      const tgtCateg = categorizeTargets(state, origTgt);
      tgtCateg.subjTgt = (optimizedSvg ? {
        // ^-- Do not preserve any previous selectors because we'd have to
        // ensure they are conceptually equivalent, and we cannot do that
        // in software.
        scope: state.targetSource,
        source: state.targetImage,
        selector: { type: 'SvgSelector', value: newSvg },
      } : decideTargetForNewAnno(state));
      const newTgtList = tgtCateg.recombine();
      editor.$store.commit('SET_EDITOR_ANNO_PROP', ['target', newTgtList]);
      editor.redisplayZoneEditorSvg();
    },

    async onSelectAuthorIdentity(evt) {
      const editor = this;
      const agent = evt.getAgent();
      if (!agent) { return; }
      editor.$store.commit('SET_EDITOR_ANNO_PROP', ['creator', agent]);
      editor.previousChosenAuthorIdUrl = evt.agentId;
      editor.forceUpdatePreview();
    },

    checkPreserveAuthorIdentity() {
      return this.$refs.authorIdentitySelector.getSelection().isPreserve;
    },

    initializeZoneEditor() {
      const editor = this;
      const { targetImage, zoneEditor } = editor;
      if (!zoneEditor) { return; } // no yet loaded.
      try {
        if (!editor.zoneEditorEventsSetupDone) {
          zoneEditor.$on('load-image', editor.redisplayZoneEditorSvg);
          zoneEditor.$on('svg-changed', editor.setZoneSelector);
          editor.zoneEditorEventsSetupDone = Date.now();
        }
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
    },

    reloadAnnoHtml() {
      eventBus.$emit('html-editor-reload-html');
    },

    redisplayZoneEditorSvg() {
      const editor = this;
      const { zoneEditor } = editor;
      const svg = editor.getZoneSelectorSvg();
      zoneEditor.reset();
      if (svg) { zoneEditor.loadSvg(svg); }
    },

    compileTargetsListForTemplating() {
      const editor = this;

      function fmt(tgt, index) {
        if (!tgt) { return; }
        if (isStr(tgt)) { return fmt({ id: tgt }, index); }
        const url = editor.findResourceUrl(tgt);
        const rec = {
          index,
          url,
          title: (tgt['dc:title'] || url),
        };
        return rec;
      }

      const { target } = editor.$store.state.editing;
      const list = [].concat(target).map(fmt).filter(Boolean);
      return list;
    },

  },

};
