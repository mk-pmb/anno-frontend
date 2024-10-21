const isStr = require('is-string');
const jQuery = require('jquery');
const objFromKeysList = require('obj-from-keys-list').default;

const eventBus = require('../../event-bus.js');

const decideTargetForNewAnno = require('./decideTargetForNewAnno.js');
const getCleanAnno = require('./getCleanAnno.js');
const loadAnnoData = require('./loadAnnoData.js');
const saveCreate = require('./saveCreate.js');
const categorizeTargets = require('./categorizeTargets.js');

// function soon(f) { return setTimeout(f, 1); }
function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function orf(x) { return x || false; }

const svgRgx = {
  emptySvgTag: /^<svg\s*>\s*<\/svg\s*>$/,
  tinyShape: /<\w+(?=\s)[^<>]*\s(?:width|height)="\d{0,2}e\-\d{2,}"[^<>]>\s*/g,
};

const maxSvgSelBytes = 32 * 1024;


const pluginsUsed = [
  'easyHtmlDiff',
  'sanitizeHtml',
];

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


function mapValuesSorted(o, f) {
  return Object.keys(o).sort().map(k => f(o[k], k, o));
}


module.exports = {

  mixins: [
    require('../../mixin/annoUrls.js'),
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
  ],

  template: require('./anno-editor.html'),
  style: require('./anno-editor.scss'),

  props: {
    editorId: { type: String, default: 'anno-editor' },
    svgUpdateMinimumRepeatDelaySec: { type: Number, default: 0.1 },
  },

  data() {
    return {
      annoLanguage: { keepOrigExtra: '', selected: '' },
      cachedPreviewStub: {},
      cachedSanitizedHtmlBodyValue: null,
      cachedSanitizedHtmlBodyDiff: '',
      dirtyHtmlBodyValue: '',
      forceUpdatePreviewTs: 0,
      initialAuthorAgent: {},
      previousChosenAuthorIdUrl: '',
      svgUpdateBlockedUntil: 0,
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
      editor.updatePluginImplCache();
      editor.initializeZoneEditor();
    });
  },


  mounted() {
    const editor = this;
    const { state } = editor.$store;
    if (state.targetEditorTabVoc) {
      eventBus.$on('editorTabNowShowing:targetEditor',
        editor.spawnTargetEditorInContainerInTab);
    }
    eventBus.$on('editorTabNowShowing:preview', editor.updatePreview);
    eventBus.$on('editorTabNowShowing:preview', () => {
      let shapes = {};
      editor.getZoneSelectorSvg().replace(/<(\w+) /g,
        function found(m, t) { shapes[m && t] = (+shapes[t] || 0) + 1; });
      delete shapes.svg;
      shapes = mapValuesSorted(shapes, (t, c) => c + '×' + t);
      shapes = (shapes.join(', ') || 'none');
      const msg = '<p>SVG Shapes in selector: ' + shapes + '</p>';
      editor.$refs.uiDebugTargetSummary.innerHTML = msg;
    });
  },


  computed: {

    annoIdUrl()       { return this.$store.state.editing.id; },

    knownAuthorIdentities() {
      const sess = this.$store.state.userSessionInfo;
      // ^- Already proxified by vue, so we don't need to
      //    protect anything by deep-copying it.
      return ((sess || false).authorIdentities || []);
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

    getAnnoTitle() { return this.$store.state.editing.title; },
    setStatusMsg(...args) { return this.$refs.statusMsg.setMsg(...args); },

    loadAnnoData,
    getCleanAnno,

    updatePluginImplCache() {
      const editor = this;
      editor.pluginImplCache = objFromKeysList({
        gen: editor.$store.getAnnoAppRef().getPluginByName,
      }, pluginsUsed);
    },

    switchTabByRefName(refName) {
      this.$refs.tablist.switchToTabPaneByVueElem(this.$refs[refName]);
    },

    tabRefIsActive(refName) {
      const tab = this.$refs[refName];
      const { active } = orf(tab);
      // console.debug('tabRefIsActive:', { refName, tab, active });
      return active;
    },

    getPrimarySubjectTarget() {
      const { state } = this.$store;
      const tgtCateg = categorizeTargets(state, state.editing.target);
      // console.debug('getPrimarySubjectTarget: tgtCateg:', tgtCateg);
      return orf(tgtCateg.subjTgt);
    },

    getPrimarySubjectTargetUrl() {
      return this.findResourceUrl(this.getPrimarySubjectTarget());
    },

    getZoneSelectorSvg() {
      const sel = this.getPrimarySubjectTarget().selector;
      // console.debug('getZoneSelectorSvg', { sel }, orf(sel).value);
      if (!sel) { return ''; }
      if (sel.type !== 'SvgSelector') { return ''; }
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
      const { targetSource } = editor.$store.state;
      const replyTgt = { id: replyToUrl, scope: targetSource };
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

    setZoneSelector(unoptimizedNewSvg) {
      const editor = this;
      const refuse = 'Anno-Editor: Refusing setZoneSelector(): ';
      const now = Date.now();
      if (now < editor.svgUpdateBlockedUntil) {
        return console.warn(refuse + 'Cooldown from previous update.');
      }
      editor.svgUpdateBlockedUntil = now + (1e3
        * editor.svgUpdateMinimumRepeatDelaySec);

      let newSvg = String(unoptimizedNewSvg || '').trim();
      const discardedSvgParts = [];
      function discardSvg(part) {
        discardedSvgParts.push(part);
        return '';
      }
      newSvg = newSvg.replace(svgRgx.tinyShape, discardSvg);
      newSvg = newSvg.replace(/\s*(?=<\w)/g, '\n');
      if (svgRgx.emptySvgTag.test(newSvg)) { newSvg = discardSvg(newSvg); }
      if (discardedSvgParts.length) {
        console.warn('Anno-Editor: Discarded degenerate SVG part(s):',
          discardedSvgParts);
      }

      const badFail = newSvg && (function checkBadFail() {
        if (newSvg.length > maxSvgSelBytes) {
          return 'is too huge: ' + newSvg.length + ' bytes';
        }
        if (!/\d/.test(newSvg)) { return 'contains no digits at all.'; }
        if (!/[1-9]/.test(newSvg)) { return 'contains no non-zero digits.'; }
        const m = /<\w+ [^<>1-9]+>/.exec(newSvg);
        if (m) {
          newSvg = m[0];
          return 'contains a shape with no non-zero digits.';
        }
      }());
      const oldSvg = editor.getZoneSelectorSvg();
      if (badFail) {
        const e = refuse + 'SVG selector ' + badFail;
        const n = '\n' + encodeURI(newSvg).replace(/%20/g, decodeURI);
        console.error(e || n, { oldSvg, newSvg });
        // window.prompt(editor.l10n('please_report_error:'), e + n);
        return;
      }
      console.debug('Anno-Editor: setZoneSelector:',
        { oldSvg, newSvg: (newSvg === oldSvg ? '(same)' : newSvg) });
      if (newSvg === oldSvg) { return; }
      const { state } = editor.$store;
      const origTgt = state.editing.target;
      const tgtCateg = categorizeTargets(state, origTgt);
      tgtCateg.subjTgt = (newSvg ? {
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
      editor.updatePreview();
    },

    checkPreserveAuthorIdentity() {
      return this.$refs.authorIdentitySelector.getSelection().isPreserve;
    },

    initializeZoneEditor() {
      const editor = this;
      const { zoneEditorRef } = editor.$refs;
      if (!zoneEditorRef) { return; } // no yet loaded.
      const { targetImage } = editor.$store.state;
      try {
        if (!editor.zoneEditorEventsSetupDone) {
          zoneEditorRef.$on('load-image', editor.redisplayZoneEditorSvg);
          zoneEditorRef.$on('svg-changed', editor.setZoneSelector);
          editor.zoneEditorEventsSetupDone = Date.now();
        }
        if (editor.zoneEditorShouldHaveHadAnyImageEverBefore) {
          // Without an image loaded, the first reset() call would
          // log a confusing error message about the image not having
          // been loaded yet.
          // :TODO: Fix upstream.
          zoneEditorRef.reset();
        }
        if (targetImage) {
          editor.zoneEditorShouldHaveHadAnyImageEverBefore = true;
          zoneEditorRef.loadImage(targetImage);
        }
      } catch (zoneEditErr) {
        console.error('Zone editor init failure:', zoneEditErr);
      }
    },


    redisplayZoneEditorSvg() {
      const editor = this;
      const { zoneEditorRef } = editor.$refs;
      if (!zoneEditorRef) { return; }
      zoneEditorRef.reset();
      const svg = editor.getZoneSelectorSvg();
      if (svg) { zoneEditorRef.loadSvg(svg); }
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


    htmlBodyWasModified(evt) {
      const editor = this;
      // console.debug('htmlBodyWasModified:', evt);
      editor.dirtyHtmlBodyValue = evt.newHtml;
      editor.cachedSanitizedHtmlBodyValue = null;
    },


    getCleanHtml() {
      const editor = this;
      const dirty = editor.dirtyHtmlBodyValue;
      if (!dirty) {
        editor.cachedSanitizedHtmlBodyValue = '';
        editor.cachedSanitizedHtmlBodyDiff = '';
        return '';
      }
      let clean = editor.cachedSanitizedHtmlBodyValue;
      if (clean) { return clean; }
      const { sanitizeHtml, easyHtmlDiff } = orf(editor.pluginImplCache);
      clean = (sanitizeHtml || String)(dirty);
      const modified = (clean !== dirty);
      const diff = ((modified && easyHtmlDiff && easyHtmlDiff(dirty, clean)) || '');
      const trace = (new Error()).stack.split(/\n\s*/).slice(1);
      console.debug('getCleanHtml had to update the cache:', {
        input: { dirty },
        sani: sanitizeHtml,
        modified,
        output: { clean, diff },
        trace,
      });
      editor.cachedSanitizedHtmlBodyValue = clean;
      editor.cachedSanitizedHtmlBodyDiff = diff;
      return clean;
    },


    hideEditorAndStartExternalTargetEditing() {
      const ev = {
        annoTarget: this.getPrimarySubjectTarget(),
        domContainer: null,
      };
      eventBus.$emit('startLurkMode', {
        reason: 'externalTargetEditor',
      });
      setTimeout(() => eventBus.$emit('startExternalTargetEditing', ev), 50);
    },


    spawnTargetEditorInContainerInTab() {
      const ctnr = this.$refs.targetEditorContainer;
      const loadingPleaseWait = '<p class="m-4 text-center">&#x231B;</p>';
      jQuery(ctnr).html(loadingPleaseWait); /*
        The important benefit of jQuery's `.html()` over `.innerHTML =`
        is that it tries to unbind any DOM events of the previous content,
        which greatly helps with garbage collection. */
      const ev = {
        annoTarget: this.getPrimarySubjectTarget(),
        domContainer: ctnr,
        replaceExistingContent: true,
      };
      setTimeout(() => eventBus.$emit('startExternalTargetEditing', ev), 50);
    },


    updatePreview() {
      const editor = this;
      const now = Date.now();
      const orig = editor.getCleanAnno();
      editor.cachedPreviewStub = {
        created: now,
        modified: now,
        'x-force-update-preview': now,
        ...orig,
      };
      editor.forceUpdatePreviewTs = now;
    },


  },

};
