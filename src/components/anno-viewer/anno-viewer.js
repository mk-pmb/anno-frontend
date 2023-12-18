'use strict';

const {
    relationLinkBody,
    textualHtmlBody,
    simpleTagBody,
    semanticTagBody,
    svgSelectorResource
} = require('@kba/anno-queries')

const pDelay = require('delay');

const eventBus = require('../../event-bus.js');
const findTargetUri = require('../../findTargetUri.js');
const licensesByUrl = require('../../license-helper.js').byUrl;

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
 * - `mouseenter`: The mouse cursor is now on this annotation
 * - `mouseleave`: The mouse cursor has left this annotation
 */

function firstEntryIfArray(x) { return (x && Array.isArray(x) && x[0]); }
function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }
function orf(x) { return x || false; }


module.exports = {
    name: 'anno-viewer', // necessary for nesting

    template: require('./anno-viewer.html'),
    style:    require('./anno-viewer.scss'),

    mixins: [
      require('../../mixin/annoUrls.js'),
      require('../../mixin/auth.js'),
      require('../../mixin/bootstrap-compat.js'),
      require('../../mixin/dateFmt.js'),
      require('../../mixin/l10n.js'),
      require('../../mixin/prefix.js'),
      require('../relationlink-editor/determinePredicateCaption.js'),
    ],

    data() {
      const el = this;
      const { state } = el.$store;
      const anno = orf(el.annotation);
      // console.debug('initData el.isListViewItem', [el.isListViewItem]);

      const hasRealPublicDoi = Boolean(anno['dc:identifier']);
      const initData = {
        cachedIiifLink: '',
        collapsed: el.isListViewItem && el.collapseInitially,
        hasRealPublicDoi,
        currentVersionDoiUri: String(anno['dc:identifier'] || ''),
        detailBarClipCopyBtnCls: 'pull-right',
        doiLinkPreviewWarning: '',
        metaContextHints: [],
        highlighted: false,
        mintDoiMsg: '',
        replyingTo: findTargetUri(firstEntryIfArray(anno['as:inReplyTo'])),
        auxMeta: decideAuxMeta(anno, el),
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

      (function maybeAddHint() {
        if (!initData.replyingTo) { return; }
        if (state.initAppMode === 'list') { return; }
        const introText = el.l10n('inReplyTo_hint_intro');
        if (!introText) { return; }
        initData.metaContextHints.push({
          cls: 'inreplyto',
          faIcon: 'reply',
          introText,
          linkText: el.l10n('inReplyTo_hint_link'),
          linkUrl: initData.replyingTo,
        });
      }());

      const editorTgtCategs = categorizeTargets(state, anno.target);
      (function maybeAddHint() {
        const nAdd = editorTgtCategs.additional.length;
        if (!nAdd) { return; }
        let introText = el.l10n('additional_subjects_hint');
        if (!introText) { return; }
        introText = introText.replace(/@@nAdd@@/g, nAdd);
        initData.metaContextHints.push({
          cls: 'multi-target-hint',
          faIcon: 'share-alt',
          introText,
          linkText: '[' + el.l10n('additional_subjects_show') + ']',
          linkUrl: assembleVersionRelatedUrl(state, 'versionsButton', anno),
        });
      }());

      return initData;
    },

  props: {
    annotation: { type: Object, required: true },
    purlId: { type: String, required: false },
    showEditPreviewWarnings: { type: Boolean, default: false },
    asReply: { type: Boolean, default: false },
    // ^-- Controls whether comment is collapsible or not
    collapseInitially: { type: Boolean, default: false },
    acceptEmptyAnnoId: { type: Boolean, default: false },
  },

  beforeCreate() {
    const viewer = this;
    viewer.dataApi = bindDataApi(viewer);
  },

  mounted() {
    const viewer = this;
    const anno = viewer.annotation;
    const initialAnnoId = orf(anno).id;
    Object.assign(viewer.$el, {
      getVueElem() { return viewer; },
      initialAnnoId,
    });
    // console.debug('viewer mounted:', { initialAnnoId, anno });

    // React to highlighting events startHighlighting / stopHighlighting / toggleHighlighting
    ;['start', 'stop', 'toggle'].forEach(state => {
      const methodName = `${state}Highlighting`;
      eventBus.$on(methodName, function manageHighlight(subjectIdUrl, expand) {
        const ourIdUrl = viewer.annoIdUrl;
        // console.debug('$on cb', { methodName, ourIdUrl, subjectIdUrl });
        if (!ourIdUrl) { return; } // early init
        if (subjectIdUrl !== ourIdUrl) { return; }
        viewer[methodName](expand);
      });
    });

    // Expand this annotation
    eventBus.$on('expand', (annoIdUrl) => {
      console.error('Thread expand handler needs full rewrite!', { annoIdUrl });
    })

    viewer.toplevelCreated = viewer.annotation.modified;
  },

    computed: {
        annoIdUrl()          {return this.annotation.id},
        firstHtmlBody()      {return textualHtmlBody.first(this.annotation)},
        simpleTagBodies()    {return simpleTagBody.all(this.annotation)},
        semanticTagBodies()  {return semanticTagBody.all(this.annotation)},
        relationLinkBodies() {return relationLinkBody.all(this.annotation)},
        svgTarget()          {return svgSelectorResource.first(this.annotation)},

        isListViewItem() { return this.$store.state.initAppMode === 'list'; },

        title() {
          const anno = this.annotation;
          if (!anno) { return ''; }
          return String(anno['dc:title'] || anno.title || '');
        },

        targetFragment() { return (this.dataApi('findTargetFragment') || ''); },

        uiModeApproval() { return this.$store.state.initCmpApprovalMode; },
        uiModeCmp() { return this.$store.state.initAppMode === 'cmp'; },
        uiModeList() { return this.$store.state.initAppMode === 'list'; },

        approval() {
          const val = this.annotation['dc:dateAccepted'];
          const st = { val, active: true, explain: '' };
          if (val === undefined) { return st; } // i.e. no approval required
          let icon = '';
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
          if (this.auxMeta.sunny) {
            if (st.active) {
              icon = (this.uiModeApproval ? 'unlock' : '');
            } else {
              icon = 'lock';
            }
          } else {
            st.icon = (st.active ? 'gavel' : 'trash-o');
          }
          st.iconCls = (icon && ('fa fa-' + icon + colorCls));
          return st;
        },

        creatorsList() {
          const { creator } = this.annotation;
          if (!creator) { return []; }
          const list = jsonDeepCopy([].concat(creator).filter(Boolean));
          const lastItem = list.slice(-1);
          if (lastItem) { lastItem['x-is-last-in-list'] = true; }
          return list;
        },


        currentLicense() {
          const licUrl = this.annotation.rights;
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
          const anno = orf(viewer.annotation);
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

        revise() { return eventBus.$emit('revise', this.annotation) },
        reply()  { return eventBus.$emit('reply',  this.annotation) },

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
            getVueBoundAnno() { return viewer.annotation; },
            getAnnoJson() { return jsonDeepCopy(viewer.annotation); },
          };
        },

        targetFragmentButtonClicked() {
          const viewer = this;
          const ev = {
            ...viewer.makeEventContext(),
            fragment: viewer.targetFragment,
            button: viewer.$refs.targetFragmentButton,
          };
          // console.debug('emit fragmentButtonClicked:', ev);
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
          console.debug('askConfirmationToMintDoi: viewer anno:',
            viewer.annotation);
          // window.viewerAnnotation = viewer.annotation;
          if (!annoIdUrl) {
            return setDoiMsg('<missing_required_field><annofield_id>');
          }
          const annoDetails = orf(viewer.annotation);
          if (annoDetails['_ubhd:doiAssign']) {
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

        mouseenter() {
            this.startHighlighting();
            eventBus.$emit('mouseenter', this.makeEventContext());
        },
        mouseleave() {
            this.stopHighlighting();
            eventBus.$emit('mouseleave', this.makeEventContext());
        },

        startHighlighting(expand)  {
            this.highlighted = true
            if (expand) eventBus.$emit('expand', this.annoIdUrl, true)
        },
        stopHighlighting()   {this.highlighted = false},
        toggleHighlighting() {this.highlighted = ! this.highlighted},

        collapse(command) {
          const el = this;
          el.collapsed = (function decide() {
            if (!el.isListViewItem) { return false; }
            if (command === 'show') { return false; }
            if (command === 'hide') { return true; }
            if (command === 'toggle') { return !el.collapsed; }
            throw new Error('anno-viewer: Invalid command for .collapse()');
          }());
        },

        renderIiifLink() {
          const viewer = this;
          viewer.cachedIiifLink = xrxUtilsUtils.calcIiifLink(viewer);
        },

        validateRelationLinkBody(rlb) {
          const viewer = this;
          const { l10n } = viewer;
          const errors = [];
          const vocMiss = l10n('missing_required_field');

          (function requiredFields() {
            const missing = [
              'predicate',
              'purpose',
            ].filter(k => !rlb[k]);
            if (!missing.length) { return; }
            const uiNames = missing.map(k => l10n('relationlink_' + k));
            errors.push(vocMiss + uiNames.join(', '));
          }());

          return errors;
        },


    replyRefNumText() {
      const anno = this.annotation;
      const ref = anno[':ANNO_FE:replyRefNum'];
      const tgt = anno[':ANNO_FE:inReplyToRefNum'];
      return this.l10n(tgt ? 'reply_refnum_deep' : 'reply_refnum_lv1'
        ).replace(/@@ref@@/g, ref).replace(/@@tgt@@/g, tgt);
    },


    otherVersionsExist() {
      return !!this.annotation['dc:replaces'];
    },


    decideShowPurlButton() {
      const st = this.$store.state;
      if (st.doiHidesPurlButton && this.hasRealPublicDoi) { return false; }
      return true;
    },














  },
};
