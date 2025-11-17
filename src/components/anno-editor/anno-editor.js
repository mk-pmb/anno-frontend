const arrayOfTruths = require('array-of-truths');
const isStr = require('is-string');
const objFromKeysList = require('obj-from-keys-list').default;

const eventBus = require('../../event-bus.js');
const guessPrimaryTargetUri = require('../../guessPrimaryTargetUri.js');
const persistentConfig = require('../../browserStorage.js').appConfig;

const categorizeTargets = require('./categorizeTargets.js');
const decideTargetForNewAnno = require('./decideTargetForNewAnno.js');
const fixupSvgSelector = require('./fixupSvgSelector.js');
const getCleanAnno = require('./getCleanAnno.js');
const libPreviewWarnings = require('./previewWarnings.js');
const loadAnnoData = require('./loadAnnoData.js');
const saveCreate = require('./saveCreate.js');
const validateEditorFields = require('./validateEditorFields.js');

const { jQuery } = window;

// eslint-disable-next-line no-unused-vars
const { cdbg, cerr, cwarn } = require('../../clog.js')('Anno-Editor');

// function soon(f) { return setTimeout(f, 1); }
function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function ores(x) { return x || ''; }
function orf(x) { return x || false; }


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


function checkEventBusAnnoArgEvent(evtName, arg) {
  if (isStr(arg)) {
    const msg = (evtName + ' expects an annotation as its argument, '
      + 'but a string was given. Did you mean ' + evtName + 'ByUrl?');
    throw new TypeError(msg);
  }
}


module.exports = {

  mixins: [
    require('../../mixin/annoUrls.js'),
    require('../../mixin/datasetActionButton.js'),
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
    libPreviewWarnings.asEditorMixin(),
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
      cachedSanitizedHtmlBodyDiff: '',
      cachedSanitizedHtmlBodyValue: null,
      dirtyHtmlBodyValue: '',
      forceUpdatePreviewTs: 0,
      initialAuthorAgent: {},
      previewWarnings: libPreviewWarnings.initializeDataApi(),
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

    eventBus.$on('create', editor.create);
    eventBus.$on('discard', editor.discard);
    eventBus.$on('reply', editor.reply);
    eventBus.$on('replyByUrl', url => editor.methodByUrl('reply', url));
    eventBus.$on('revise', editor.revise);
    eventBus.$on('reviseByUrl', url => editor.methodByUrl('revise', url));
    eventBus.$on('save', editor.save);

    eventBus.$on('loadAnnoData', editor.loadAnnoData);
    eventBus.$on('saveNewDraft', () => {
      editor.switchTabByRefName('draftsPanel');
      editor.$refs.draftsPanel.saveNew();
    });
    eventBus.$on('switchEditorTabByRefName', editor.switchTabByRefName);
    eventBus.$on('updateZoneEditorImage',
      (imgUrl) => editor.uiPanic('Stub! updateZoneEditorImage:\n' + imgUrl));
    eventBus.$on('close-editor', () => {
      document.body.classList.remove(editorOpenCssClass);
    });
    eventBus.$on('open-editor', function onOpenEditor(opt) {
      if (!opt) { return onOpenEditor(true); }
      document.body.classList.add(editorOpenCssClass);
      jQuery(editor.$el).find('.initially-hidden').hide();
      editor.setStatusMsg(); // reset = dismiss
      editor.switchTabByRefName(opt.tabRefName || 'commentTextTab');
      cdbg('Initial zone selector:', [editor.getZoneSelectorSvg()]);
      editor.updatePluginImplCache();
      editor.initializeZoneEditor();
      editor.previewWarnings.reset();
    });
    eventBus.$on('editor-set-userhtml',
      html => editor.$refs.htmlBodyEditor.setUserHtml(html));
    eventBus.$on('validateEditorFields', editor.validateFields);
  },


  mounted() {
    const editor = this;
    const { state } = editor.$store;
    if (state.targetEditorTabVoc) {
      eventBus.$on('editorTabNowShowing:target-editor',
        editor.spawnExternalTagetEditorInTab);
    }
    eventBus.$on('editorShouldUpdatePreview', editor.updatePreview);
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

    activeTabTopic() { return this.$refs.tablist.currentActiveTabTopic; },

  },

  methods: {

    getAnnoTitle() { return this.$store.state.editing.title; },
    setStatusMsg(...args) { return this.$refs.statusMsg.setMsg(...args); },

    uiPanic: Object.assign(function uiPanic(why) {
      window.alert(this.l10n(uiPanic.msg[why] || why));
    }, { msg: {
      EInvalidData: '<error:> <corrupt_data>',
    } }),

    loadAnnoData,
    getCleanAnno,

    updatePluginImplCache() {
      const editor = this;
      editor.pluginImplCache = objFromKeysList({
        gen: editor.$store.getAnnoAppRef().getPluginByName,
      }, pluginsUsed);
    },

    switchTabByRefName(refName) {
      const editor = this;
      const tab = this.$refs[refName];
      if (tab) { return editor.$refs.tablist.switchToTabPaneByVueElem(tab); }
      throw new Error('Anno-Editor: $ref not found (try topic?): ' + refName);
    },

    tabRefIsActive(refName) {
      const tab = this.$refs[refName];
      const { active } = orf(tab);
      // cdbg('tabRefIsActive:', { refName, tab, active });
      return active;
    },

    getPrimarySubjectTarget() {
      const { state } = this.$store;
      const tgtCateg = categorizeTargets(state, state.editing.target);
      return orf(tgtCateg.subjTgt);
    },

    getPrimarySubjectTargetUrl() {
      // Meh: this.findResourceUrl(this.getPrimarySubjectTarget());
      // Better: Have categorizeTargets use guessPrimaryTargetUri
      //    to potentially invoke config magic.
      const { state } = this.$store;
      const tgtCateg = categorizeTargets(state, state.editing.target);
      return tgtCateg.subjTgtUrl;
    },

    getZoneSelectorSvg() {
      const sel = this.getPrimarySubjectTarget().selector;
      // cdbg('getZoneSelectorSvg', { sel }, orf(sel).value);
      if (!sel) { return ''; }
      if (sel.type !== 'SvgSelector') { return ''; }
      return ores(sel.value).trim();
    },

    save() {
      const editor = this;
      const { editMode } = editor;
      if (editMode === 'create') { return saveCreate(editor); }
      if (editMode === 'revise') { return saveCreate(editor); }
      if (editMode === 'reply') { return saveCreate(editor); }
      editor.uiPanic('Save not implemented for editMode = ' + editMode);
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
      const anno = annoDataTmpl(state);
      const updEditMode = {
        editEnforceReplaces: ores(anno['dc:replaces']),
        editEnforceReplying: ores(anno['as:inReplyTo']),
        editEnforceVersionOf: ores(anno['dc:isVersionOf']),
        editMode,
      };
      commit('FLAT_UPDATE_APP_STATE', updEditMode);
      // cdbg('startCompose:', updEditMode, 'template:', anno);
      await editor.loadAnnoData(anno);
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
      checkEventBusAnnoArgEvent('reply', refAnno);
      const editor = this;
      const replyToUrl = (
        refAnno['dc:isVersionOf']
        || refAnno.id
        );
      const refAnnoTitle = (refAnno['dc:title'] || refAnno.title);
      const { l10n } = editor;
      const title = l10n('reply_title_prefix') + refAnnoTitle;
      await editor.startCompose('reply', state => ({
        creator: editor.decideDefaultAuthorAgent(),
        target: decideTargetForNewAnno(state),
        'dc:title': title,
        'as:inReplyTo': replyToUrl,
      }));
    },

    async methodByUrl(methodName, annoIdUrl) {
      const ed = this;
      const anno = ed.$store.getAnnoByIdUrl(annoIdUrl);
      const msg = 'anno-frontend: editor: methodByUrl:';
      const report = { methodName, annoIdUrl, annoFound: !!anno };
      console[anno ? 'debug' : 'error'](msg, report);
      return anno && ed[methodName].call(ed, anno);
    },

    async revise(oldAnno) {
      checkEventBusAnnoArgEvent('revise', oldAnno);
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
      delete anno.created;
      delete anno.id;
      delete anno.via;
      // cdbg('revise:', anno);
      await this.startCompose('revise', () => anno);
    },

    setZoneSelector(unoptimizedNewSvg) {
      const editor = this;
      const refuse = 'Refusing setZoneSelector(): ';
      const now = Date.now();
      if (now < editor.svgUpdateBlockedUntil) {
        return cwarn(refuse + 'Cooldown from previous update.');
      }
      editor.svgUpdateBlockedUntil = now + (1e3
        * editor.svgUpdateMinimumRepeatDelaySec);

      const oldSvg = editor.getZoneSelectorSvg();
      const newSvg = ores(fixupSvgSelector(unoptimizedNewSvg, oldSvg));
      if (newSvg.startsWith('<fail>')) { return; }
      const same = (newSvg === oldSvg);
      cdbg('setZoneSelector:', { oldSvg, newSvg: (same ? '(same)' : newSvg) });
      if (same) { return; }
      const { state } = editor.$store;
      const origTgt = state.editing.target;
      const tgtCateg = categorizeTargets(state, origTgt);

      let { subjTgt } = tgtCateg;
      if (isStr(subjTgt)) {
        // Keep nothing: It's just the URL, and we will set our own anyway.
        subjTgt = {};
      }
      /* Starting with a fresh object would delete custom fields like
        Dublin Core metadata, so instead we just delete what we have
        authority for: */
      delete subjTgt.id;
      delete subjTgt.scope;
      delete subjTgt.selector; /*
        ^-- Do not preserve any previous selectors because we'd have to
            ensure they are conceptually equivalent, and we cannot do
            that in software. */
      delete subjTgt.source;

      if (newSvg) {
        subjTgt.selector = { type: 'SvgSelector', value: newSvg };
        subjTgt.source = state.targetImage;
        subjTgt.scope = state.targetSource;
      } else {
        subjTgt.id = state.targetSource;
      }

      // Finally, weakly assign the targetMetaData and write back:
      tgtCateg.subjTgt = { ...state.targetMetaData, ...subjTgt };
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
        cerr('Zone editor init failure:', zoneEditErr);
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
      const { state } = editor.$store;
      const extra = orf(state.editing.extraFields);
      const replyTo = arrayOfTruths(extra['as:inReplyTo']);

      function getTypeSafe(tgt, index, url) {
        const tt = tgt[':ANNO_FE:targetType'];
        if (tt === 'primary') { return tt; }
        if ((tt === 'anno') && replyTo.includes(url)) { return 'replyingTo'; }
        if ((url === state.targetSource) || (url === state.targetImage)) {
          const hints = { targetIdx: index, tt, expected: 'primary' };
          hints.id = (tgt.id || tgt);
          cwarn('compileTargetsListForTemplating: fixing:', hints);
          return 'primary';
        }
        return (tt || 'unknown');
      }

      let prevRec = false;
      let hadPrimary = false;

      function fmt(tgt, index) {
        if (isStr(tgt)) { return fmt({ id: tgt }, index); }
        const url = guessPrimaryTargetUri({ target: tgt }, state);
        const unconfirmed = tgt[':ANNO_FE:unconfirmed'];
        let tgtType = getTypeSafe(tgt, index, url);
        if (tgtType === 'primary') {
          if (hadPrimary) { tgtType = 'additional'; }
          hadPrimary = true;
        }
        const typeCls = [''].concat(arrayOfTruths([
          tgtType,
          (unconfirmed && 'unconfirmed'),
        ])).map(c => ('anno-target' + (c && '-') + c));
        const rec = {
          index,
          title: (tgt['dc:title'] || url),
          type: tgtType,
          typeCls,
          unconfirmed,
          url,
          sameTypeAsPrev: (prevRec.type === tgtType),
          sameTypeAsNext: false, // will be updated if there is a next entry.
        };
        if (prevRec) { prevRec.sameTypeAsNext = rec.sameTypeAsPrev; }
        prevRec = rec;
        return rec;
      }

      const input = jsonDeepCopy(arrayOfTruths(state.editing.target));
      // cdbg('compileTargetsListForTemplating <<', { replyTo, extra, input });
      const result = input.map(fmt);
      // cdbg('compileTargetsListForTemplating >>', jsonDeepCopy(result));
      return result;
    },


    htmlBodyWasModified(evt) {
      const editor = this;
      // cdbg('htmlBodyWasModified:', evt);
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
      const diff = ores(modified && easyHtmlDiff && easyHtmlDiff(dirty, clean));
      const trace = (new Error()).stack.split(/\n\s*/).slice(1);
      editor.cachedSanitizedHtmlBodyValue = clean;
      editor.cachedSanitizedHtmlBodyDiff = diff;
      cdbg('getCleanHtml had to update the cache:', {
        input: { dirty },
        sani: sanitizeHtml,
        modified,
        output: { clean, diff },
        trace,
      });
      editor.updatePreviewWarnings();
      return clean;
    },


    hideEditorAndStartExternalTargetEditor() {
      const ev = {
        annoTarget: this.getPrimarySubjectTarget(),
        domContainer: null,
      };
      eventBus.$emit('startLurkMode', {
        reason: 'externalTargetEditor',
      });
      setTimeout(() => eventBus.$emit('startExternalTargetEditor', ev), 50);
    },


    spawnExternalModuleInTab(modName, modParam) {
      const editor = this;
      const { l10n } = editor;
      const ctnr = editor.$refs['containerFor' + modName];

      /* First, we use jQuery's `.html()` to unbind any DOM events of the
        previous content, which greatly helps with garbage collection.
        This is a major benefit over `.innerHTML =`. */
      jQuery(ctnr).html('');

      // Now, we construct a loading message:
      const wrapper = jQuery('<div class="m-4 placeholder-msg"></div>');
      wrapper.append('<h5>' + l10n('externalTab:loading') + '</h5>');
      const explain = jQuery('<p></p>');
      explain.appendTo(wrapper);
      wrapper.appendTo(ctnr);
      if (modName === '!') {
        return explain.text(l10n('error:') + ' ' + modParam);
      }
      explain.text(l10n('externalTab:hopeful').replace(/@@module@@/g,
        (l10n('externalTab:module:' + modName)
          || l10n('externalTab:module:generic'))));

      const evName = 'startExternal' + modName;
      const evArg = {
        ...modParam,
        domContainer: ctnr,
        replaceExistingContent: true,
      };

      const { uiDebugMode } = editor.$store.state;
      Object.assign(wrapper, {
        evName,
        getCtnr() { return ctnr; },
        getEvArg() { return evArg; },
        uiDebugMode,
      });

      if (uiDebugMode) {
        const jqHint = jQuery('<p>UI debug hint: Event <tt>' + evName
          + '</tt> should have been fired with argument <tt></tt></p>');
        const dbg = { ...evArg, domContainer: '[not JSON-able]' };
        jqHint.find('tt').last().text(JSON.stringify(dbg, null, 2));
        jqHint.appendTo(wrapper);
      }

      cdbg('spawnExternalModuleInTab:', evName, evArg);
      const confirmOpt = 'debugConfirmSpawnExternalModuleInTab';
      if (editor.$store.state[confirmOpt]) {
        const msg = confirmOpt + ': Send event ' + evName + '?';
        if (!window.confirm(msg)) { return; }
      }
      setTimeout(() => eventBus.$emit(evName, evArg), 50);
      return wrapper;
    },


    spawnExternalTagetEditorInTab() {
      const editor = this;
      const annoTarget = editor.getPrimarySubjectTarget();
      if (!annoTarget) {
        const { l10n } = editor;
        editor.spawnExternalModuleInTab('!', l10n('corrupt_data')
          + '\n' + l10n('missing_required_field')
          + ' ' + l10n('targets_list_headline'));
        return;
      }
      editor.spawnExternalModuleInTab('TargetEditor', { annoTarget });
    },


    updatePreview() {
      const editor = this;
      const now = Date.now();
      const orig = editor.getCleanAnno();
      editor.updatePreviewWarnings();
      editor.cachedPreviewStub = {
        created: now,
        modified: now,
        'x-force-update-preview': now,
        ...orig,
      };
      editor.forceUpdatePreviewTs = now;
    },


    deleteTarget(ctx) {
      const editor = this;
      const voc = editor.l10n('delete_target_confirm');
      if (!window.confirm([voc, ctx.title, ctx.url].join('\n\n'))) { return; }
      editor.$store.commit('UPDATE_EDITOR_ANNO_LIST_PROP',
        { prop: 'target', idx: +ctx.index, del: true });
    },


    validateFields() { validateEditorFields(this, this.getCleanAnno()); },


    clipThisTargetForReuse(ctx) {
      const editor = this;
      const tgt = editor.$store.state.editing.target[ctx.index];
      if (!tgt) { return editor.uiPanic('EInvalidData'); }
      const clean = jsonDeepCopy(tgt);
      Object.keys(clean).forEach(k => (k.startsWith(':') && delete clean[k]));
      persistentConfig.put('clippedTarget', clean);
    },


    appendTargetClippedForReuse() {
      const editor = this;
      const tgt = persistentConfig.get('clippedTarget');
      if (!tgt) { return editor.uiPanic('EInvalidData'); }
      const val = jsonDeepCopy(tgt);
      val[':ANNO_FE:targetType'] = 'additional';
      val[':ANNO_FE:unconfirmed'] = true;
      editor.$store.commit('UPDATE_EDITOR_ANNO_LIST_PROP',
        { prop: 'target', idx: '+', val });
    },


    moveTargetUpByOne(evt) {
      const { list, idx } = evt;
      const item = list[idx];
      const before = list.slice(0, idx).filter(Boolean);
      const prev = before.pop();
      const after = list.slice(idx + 1);
      return { list: [...before, item, prev, ...after] };
    },





  },

};

/*
window.name = 'ubhdAnnoApp:autoEmitQ:' + JSON.stringify([
  ['reviseByUrl', 'test-esau-moses-fruit'],
  ['switchEditorTabByRefName', 'debugTab'],
  ])
*/
