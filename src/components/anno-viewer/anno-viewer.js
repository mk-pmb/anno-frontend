'use strict';

const {
  textualHtmlBody,
  svgSelectorResource
} = require('@kba/anno-queries')

const arrayOfTruths = require('array-of-truths');
const floodBarrier = require('flood-barrier');
const pDelay = require('delay');

const applyDebugCheats = require('../../cheats.js');
const eventBus = require('../../event-bus.js');
const findTargetUri = require('../../findTargetUri.js');
const licensesByUrl = require('../../license-helper.js').byUrl;
const strU = require('../../stringUtil.js');

const categorizeTargets = require('../anno-editor/categorizeTargets.js');
const decideAuxMeta = require('../anno-cmp-mode/decideAuxiliaryMetaData.js');

const assembleVersionRelatedUrl = require('./assembleVersionRelatedUrl.js');
const bindDataApi = require('./dataApi.js');
const formatters = require('./formatters.js');
const simpleDateStamp = require('./simpleDateStamp.js');
const toggleDetailBar = require('./toggleDetailBar.js');
const xrxUtilsUtils = require('./xrxUtilsUtils.js');


/**
 * ### anno-viewer
 *
 * Show an annotation as a bootstrap panel.
 *
 * #### Props
 *
 * - **`annotation`**: The annotation this viewer shows
 * - `asReply`: Whether the annotation should be displayed as a reply (no
 *   colapsing, smaller etc.)
 * - `purlId` The URL of the persistently adressed annotation.
 *   This is the legacy solution for highlighting an annotation when the
 *   annoApp was loaded from a PURL redirect.
 * - `collapseInitially`: Whether the anntotation should be collapsed after
 *   first render
 *
 * #### Events
 *
 * - `revise`: This annotation should be opened in an editor for editing
 * - `reply`: A new annotation as a reply to this annotation should be opened in an editor
 * - `startHighlighting`: Start highlighting this annotation
 * - `stopHighlighting`: Stop highlighting this annotation
 * - `mouseEnter`: The mouse cursor is now on this annotation
 * - `mouseLeave`: The mouse cursor has left this annotation
 */


const cdbg = console.debug.bind(console, 'anno-viewer:');
const cerr = console.error.bind(console, 'anno-viewer:');
Boolean(cdbg, cerr); // Linter: Ignore whether they're all commented-out.


function firstEntryIfArray(x) { return (x && Array.isArray(x) && x[0]); }
function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function orf(x) { return x || false; }


const relationlinkRequiredFields = ['predicate', 'purpose', 'url'];

const { fileBaseName } = strU;


const unicodeIcons = {
  calendar: '📅',
  lock: '🔒',
  reject: '🚫',
  success: '✅',
  trash: '🗑',
  unlock: '🔓',
};


const expandHandlerFloodBarrier = floodBarrier({
  maxRepeats: 10,
  cooldownSec: 1,
  onHot: { message: 'anno-viewer: Excessive influx of "expandAnno" events!' },
}, Boolean);


module.exports = {
  name: 'anno-viewer', // necessary for nesting

  template: require('./anno-viewer.html'),
  style:    require('./anno-viewer.scss'),

  mixins: [
    require('../../checkAclAuth.js').vueMixin,
    require('../../mixin/annoUrls.js'),
    require('../../mixin/bootstrap-compat.js'),
    require('../../mixin/dateFmt.js'),
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
    require('../relationlink-editor/determinePredicateCaption.js'),
  ],

  props: {
    acceptEmptyAnnoId: { type: Boolean, default: false },
    annotation: { type: [Object, Boolean, null], required: false },
    asReply: { type: Boolean, default: false }, /*
      ^-- asReply controls whether comment is collapsible or not */
    collapseInitially: { type: Boolean, default: true },
    disableHoverEvents: { type: Boolean, default: false },
    initiallyHighlighted: { type: Boolean, default: false },
    purlId: { type: String, required: false },
    showEditPreviewWarnings: { type: Boolean, default: false },
  },

  data() {
    const el = this;
    const { state } = el.$store;
    const anno = orf(el.annotation); // .annoData isn't available yet
    const hasRealPublicDoi = Boolean(anno['dc:identifier']);
    // cdbg('initData el.isListViewItem', [el.isListViewItem]);

    const isListViewItem = (state.initAppMode === 'list');

    const collapsed = Boolean(isListViewItem && el.collapseInitially
      // ^-- This will likely be overruled by anno-list's mounted() event.
      && (!el.asReply));

    const initData = {
      auxMeta: decideAuxMeta(anno, el),
      cachedIiifLink: '',
      collapsed,
      currentVersionDoiUri: String(anno['dc:identifier'] || ''),
      detailBarClipCopyBtnCls: 'float-right',
      doiLinkPreviewWarning: '',
      hasRealPublicDoi,
      highlighted: !!el.initiallyHighlighted,
      isListViewItem,
      metaContextHintsCache: [],
      mintDoiMsg: '',
      replyingTo: findTargetUri(firstEntryIfArray(anno['as:inReplyTo'])),
      unicodeIcons,
    };

    if (anno['_ubhd:doiAssign']) {
      // ^-- no `.extraFields`: That's an anno-editor thing.
      initData.mintDoiMsg = el.l10n('mint_doi.pending');
    }

    (function maybePredictDoi() {
      if (hasRealPublicDoi) { return; }
      const predict = state.predictMintedDoiUrl;
      if (!predict) { return; }
      const annoIdUrl = anno.id;
      if (!annoIdUrl) { return; }
      const cur = predict(annoIdUrl);
      if (!cur) { return; }
      initData.doiLinkPreviewWarning = el.l10n('doi_url_preview_warning');
      initData.currentVersionDoiUri = cur;
    }());

    return initData;
  },

  beforeCreate() {
    const viewer = this;
    viewer.dataApi = bindDataApi(viewer);
  },

  mounted() {
    const viewer = this;
    const initialAnnoId = viewer.annoIdUrl;
    Object.assign(viewer.$el, {
      getVueElem() { return viewer; },
      initialAnnoId,
    });
    // cdbg('viewer mounted:', { initialAnnoId }, viewer.annotation);

    // React to highlighting events startHighlighting / stopHighlighting / toggleHighlighting
    ;['start', 'stop', 'toggle'].forEach(state => {
      const methodName = `${state}Highlighting`;
      eventBus.$on(methodName, function manageHighlight(subjectIdUrl, expand) {
        if (!viewer.representsAnnoIdUrl(subjectIdUrl)) { return; }
        viewer[methodName](expand);
      });
    });

    (function installExpansionHandler() {
      function maybeExpandNow(annoIdUrlToBeExpanded) {
        if (!viewer.representsAnnoIdUrl(annoIdUrlToBeExpanded)) { return; }
        expandHandlerFloodBarrier();
        viewer.collapse('show');
        window.purlAnnoViewer = viewer;
      }
      eventBus.$on('expandAnno', maybeExpandNow);
    }());

    function stampedReloadUnlessHandled(ev) {
      // cdbg('stampedReloadUnlessHandled', ev);
      if (ev.eventWasHandled) { return; }
      setTimeout(() => window.location.reload(), 10);
    }
    eventBus.$emit('simpleDateStampSucceeded',
      ev => setTimeout(() => stampedReloadUnlessHandled(ev), 100));
    viewer.toplevelCreated = viewer.annotation.modified;
  },

  computed: {
    annoData() { return orf(this.annotation); },
    annoIdUrl() { return this.annoData.id || ''; },

    firstHtmlBody()      {return textualHtmlBody.first(this.annotation)},
    svgTarget()          {return svgSelectorResource.first(this.annotation)},

    title() {
      const anno = this.annoData;
      return String(anno['dc:title'] || anno.title || '');
    },

    targetFragment() { return (this.dataApi('findTargetFragment') || ''); },

    uiModeCmp() { return this.$store.state.initAppMode === 'cmp'; },
    uiModeList() { return this.$store.state.initAppMode === 'list'; },

    uiModeApproval() {
      return this.uiModeCmp && this.$store.state.initCmpApprovalMode;
    },

    legacyPurlHighlight() {
      return this.representsAnnoIdUrl(this.$store.state.purlId);
    },


    isOwnAnno() {
      const viewer = this;
      const { authorIdentities } = orf(viewer.$store.state.userSessionInfo);
      if (!authorIdentities) { return false; }
      const crea = viewer.findResourceUrl(viewer.annoData.creator);
      if (!crea) { return false; }
      return authorIdentities.some(ai => (crea === ai.id));
    },


    approval() {
      const val = this.annoData['dc:dateAccepted'];
      const st = { val, active: true, explain: '' };
      if (val === undefined) { return st; } // i.e. no approval required
      const { auxMeta } = this;
      if (auxMeta.sunsetDescr) { return st; }
      let colorCls = '';
      if (val) {
        st.jsTs = (new Date(val)).getTime();
        st.delta = st.jsTs - Date.now();
        st.future = (st.delta > 0);
        st.active = !st.future;
        st.explain = (this.l10n(st.active ? 'anno_approval_active'
          : 'anno_approval_future') + ' ' + this.dateFmt(st.jsTs));
      } else {
        st.active = false;
        st.explain = this.l10n('anno_approval_pending');
        colorCls = ' text-danger'; // No decision yet => Attention needed.
      }
      if (auxMeta.sunny) {
        if (st.active) {
          st.iconText = (this.uiModeApproval ? unicodeIcons.success : '');
        } else {
          st.iconText = unicodeIcons.lock;
          if (st.future) { st.iconText = unicodeIcons.calendar; }
        }
      } else { // retracted…
        st.iconText = (st.active
          ? unicodeIcons.trash // … but was public: actually retracted, or
          : unicodeIcons.reject); // … never public = rejected by moderation.
      }
      st.iconCls = (st.iconText && ('anno-approval-icon' + colorCls));
      return st;
    },


    editable() {
      const viewer = this;
      const anno = viewer.annoData;
      const nonDebugEditable = (function decide() {
        const { isOwnAnno } = viewer;
        const auth = viewer.checkAclAuth({ isOwnAnno,
          privName: 'revise_‹own›' });
        if (!auth) { return false; }
        const wCopy = viewer.findVersNumFromAnnoUrl(anno['iana:working-copy']);
        if (wCopy) {
          /* Number parsing is necessary: In version history mode, id uses
            the standards compliant endpoint while working-copy uses the
            author mode endpoint. */
          const curVer = viewer.findVersNumFromAnnoUrl(anno.id);
          if (curVer !== wCopy) { return false; }
        }
        return (isOwnAnno ? { icon: 'pencil', voc: 'edit' }
          : { icon: 'medkit', voc: 'edit_as_moderator' });
      }());
      return orf(nonDebugEditable
        || (viewer.$store.state.uiDebugMode && { icon: 'cog', voc: '' }));
    },


    creatorsList() {
      const { creator } = this.annoData;
      if (!creator) { return []; }
      const list = jsonDeepCopy([].concat(creator).filter(Boolean));
      const [lastItem] = list.slice(-1);
      if (lastItem) { lastItem['x-is-last-in-list'] = true; }
      return list;
    },


    currentLicense() {
      const licUrl = this.annoData.rights;
      const licInfo = orf(licensesByUrl.get(licUrl));
      return licInfo;
    },


    latestVersionDoiUri() {
      const rgx = this.$store.state.doiVersionSuffixRgx;
      if (!rgx) { return ''; }
      const curDoiUri = this.currentVersionDoiUri;
      if (!curDoiUri) { return ''; }
      const latest = curDoiUri.replace(rgx, '');
      if (latest === curDoiUri) { return ''; }
      return latest;
    },


    licenseTitleOrUnknown() {
      return (this.currentLicense.title
        || this.l10n('license_unknown'));
    },


    problemsWarningText() {
      const viewer = this;
      const anno = viewer.annoData;
      const { l10n } = viewer;
      const probs = [];

      (function checkExpectedProps() {
        const expected = [
          'dc:title',
          (viewer.acceptEmptyAnnoId ? null : 'id' /* Anno ID */),
        ];
        const miss = l10n('missing_required_field');
        expected.forEach(function check(prop) {
          if (!prop) { return; }
          if (anno[prop]) { return; }
          probs.push(miss + l10n('annofield_' + prop, prop));
        });
      }());

      if (!probs.length) { return ''; }
      return l10n('error:') + ' ' + probs.join('; ');
    },

    purl() { return this.annoIdToPermaUrl(this.annoIdUrl); },
  },

  methods: {
    assembleVersionRelatedUrl: assembleVersionRelatedUrl.asVueMethod,
    formatters,
    toggleDetailBar,
    applyDebugCheats,

    revise() { return eventBus.$emit('revise', this.annoData) },
    reply()  { return eventBus.$emit('reply',  this.annoData) },

    async approve() {
      await simpleDateStamp(this, 'dc:dateAccepted');
      window.location.reload();
    },

    async unpublish() {
      await simpleDateStamp(this, 'as:deleted');
      window.location.reload();
    },


    makeEventContext() {
      const viewer = this;
      return {
        annoIdUrl: viewer.annoIdUrl,
        domElem: viewer.$el,
        dataApi: viewer.dataApi,
        getVueBoundAnno() { return viewer.annoData; },
        getAnnoJson() { return jsonDeepCopy(viewer.annoData); },
      };
    },

    targetFragmentButtonClicked() {
      const viewer = this;
      const ev = {
        ...viewer.makeEventContext(),
        fragment: viewer.targetFragment,
        button: viewer.$refs.targetFragmentButton,
      };
      // cdbg('emit fragmentButtonClicked:', ev);
      eventBus.$emit('targetFragmentButtonClicked', ev);
    },

    setDoiMsg(voc, ...details) {
      const viewer = this;
      if (!voc) {
        viewer.mintDoiMsg = '';
        return;
      }
      viewer.mintDoiMsg = [
        ('[' + (new Date()).toLocaleTimeString() + ']'),
        viewer.l10n(voc),
        ...details,
      ].join(' ');
    },

    async askConfirmationToMintDoi() {
      const viewer = this;
      const { annoIdUrl, l10n, setDoiMsg } = viewer;
      cdbg('askConfirmationToMintDoi: viewer anno:', viewer.annoData);
      // window.viewerAnnotation = viewer.annoData;
      if (!annoIdUrl) {
        return setDoiMsg('<missing_required_field><annofield_id>');
      }
      if (viewer.annoData['_ubhd:doiAssign']) {
        return window.alert(viewer.l10n('mint_doi.pending'));
      }
      if (!viewer.approval.active) {
        // This is not a security check, just a reminder for users.
        return setDoiMsg('<error:> <mint_doi.nonpublic>');
      }
      const askReally = (l10n('confirm_irrevocable_action')
        + '\n' + l10n('mint_doi'));
      if (!window.confirm(askReally)) {
        return setDoiMsg('confirm_flinched');
      }
      setDoiMsg('request_sent_waiting');
      let resp = viewer.$store.state.debugStubMintDoiResponse;
      try {
        if (resp) {
          await pDelay(5e3);
        } else {
          resp = await simpleDateStamp(viewer, '_ubhd:doiAssign');
        }
      } catch (err) {
        return setDoiMsg('<error:> ', String(err));
      }
      return setDoiMsg('mint_doi.success');
    },

    onMouseEnter() {
      if (this.disableHoverEvents) { return; }
      this.startHighlighting();
      eventBus.$emit('mouseEnter', this.makeEventContext());
    },
    onMouseLeave() {
      if (this.disableHoverEvents) { return; }
      this.stopHighlighting();
      eventBus.$emit('mouseLeave', this.makeEventContext());
    },

    startHighlighting(expand) {
      this.highlighted = true;
      if (expand) { this.collapse('show'); }
    },
    stopHighlighting() { this.highlighted = false; },
    toggleHighlighting() { this.highlighted = !this.highlighted; },

    collapse(command) {
      const el = this;
      el.collapsed = (function decide() {
        if (!el.isListViewItem) { return false; }
        if (el.asReply) { return false; }
        if (command === 'show') { return false; }
        if (command === 'hide') { return true; }
        if (command === 'toggle') { return !el.collapsed; }
        throw new Error('anno-viewer: Invalid command for .collapse()');
      }());
      if (!el.collapsed) {
        const inReplyTo = arrayOfTruths.ifAny(this.annotation['as:inReplyTo']);
        if (inReplyTo) {
          // cdbg('Expand reply targets:', this.annoIdUrl, '->', inReplyTo);
          inReplyTo.forEach(a => eventBus.$emit('expandAnno', a));
        }
      }
    },

    renderIiifLink() {
      const viewer = this;
      viewer.cachedIiifLink = xrxUtilsUtils.calcIiifLink(viewer);
    },


    replyRefNumText() {
      const anno = this.annoData;
      const ref = anno[':ANNO_FE:replyRefNum'];
      const tgt = anno[':ANNO_FE:inReplyToRefNum'];
      return this.l10n(tgt ? 'reply_refnum_deep' : 'reply_refnum_lv1'
        ).replace(/@@ref@@/g, ref).replace(/@@tgt@@/g, tgt);
    },


    otherVersionsExist() { return !!this.annoData['dc:replaces']; },


    decideShowPurlButton() {
      const st = this.$store.state;
      if (st.doiHidesPurlButton && this.hasRealPublicDoi) { return false; }
      return true;
    },


    preparsePurposeTagBodies(purpose) {
      const viewer = this;
      const preparsed = viewer.dataApi('mapBodies', function preparse(body) {
        if (body.purpose !== purpose) { return; }
        const url = viewer.findResourceUrl(body);
        const caption = (body['dc:title'] || body.value || body.label || url);
        return { ...body, caption, url };
      });
      if (!preparsed) { return preparsed; }

      if (purpose === 'linking') {
        const vocMiss = viewer.l10n('missing_required_field');
        preparsed.forEach(function validate(body) {
          // eslint-disable-next-line no-param-reassign
          body.predicate = (body['rdf:predicate'] || body.predicate);
          const miss = relationlinkRequiredFields.map(
            f => (body[f] ? '' : viewer.l10n('relationlink_' + f))
          ).filter(Boolean);
          // eslint-disable-next-line no-param-reassign
          if (miss.length) { body.error = vocMiss + ' ' + miss.join(', '); }
        });
      }

      return preparsed;
    },


    maybeUpdateMetaContextHints() {
      const el = this;
      const { state } = el.$store;
      const basedOn = [
        state.forceRerenderConfigBasedUiTs,
        state.initAppMode,
        state.targetSource,
      ].join('\v');
      const oldCache = el.metaContextHintsCache;
      const cacheValid = (oldCache.basedOn === basedOn);
      if (cacheValid) { return oldCache; }

      const anno = el.annoData;
      const mch = [];
      mch.basedOn = basedOn;

      (function maybeAddReplyHint() {
        if (!el.replyingTo) { return; }
        if (state.initAppMode === 'list') { return; }
        const introText = el.l10n('inReplyTo_hint_intro');
        if (!introText) { return; }
        mch.push({
          cls: 'inreplyto',
          faIcon: 'reply',
          introText,
          linkText: el.l10n('inReplyTo_hint_link'),
          linkUrl: el.replyingTo,
        });
      }());

      const editorTgtCategs = categorizeTargets(state, anno.target);
      (function maybeAddHint() {
        const nAdd = editorTgtCategs.additional.length;
        if (!nAdd) { return; }
        if (el.uiModeCmp) { /*
          In comparison mode, including single anno view, we can assume
          the embedding application will display all targets. */
          return;
        }
        let introText = (el.l10n('additional_subjects_hint:n=' + nAdd, '')
          || el.l10n('additional_subjects_hint', ''));
        if (!introText) { return; }
        introText = introText.replace(/@@nAdd@@/g, nAdd);
        mch.push({
          cls: 'multi-target-hint',
          faIcon: 'share-alt',
          introText,
          linkText: '[' + el.l10n('additional_subjects_show') + ']',
          linkUrl: assembleVersionRelatedUrl(state, 'versionsButton', anno),
          linkFrame: state.additionalTargetsHintLinkFrame || '',
        });
      }());

      el.metaContextHintsCache = mch;
      return mch;
    },


    representsAnnoIdUrl(annoIdUrl) {
      const { annoData } = this;
      if (!annoData) { return; }
      const annoBn = annoIdUrl && fileBaseName(annoIdUrl);
      if (!annoBn) { return; }
      return ((fileBaseName(annoData.id) === annoBn)
        || (fileBaseName(annoData['iana:latest-version']) === annoBn)
        || (fileBaseName(annoData['dc:isVersionOf']) === annoBn)
        );
    },














  },

};
