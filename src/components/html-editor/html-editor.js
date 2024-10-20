const QuillApi = require('quill/dist/quill.js');

const loMapValues = require('lodash.mapvalues');

const toolbarHandlers = require('./toolbarHandlers.js');


/*
function replaceClassSpan(orig, cls, inner) {
  // console.debug('replaceClassSpan:', { orig, cls, inner });
  if (cls === 'ql-size-normal') { return inner; }
  if (cls === 'ql-size-small') { return '<small>' + inner + '</small>'; }
  return orig;
}
*/


module.exports = {

  mixins: [
    require('../../mixin/l10n.js'),
    require('../../mixin/prefix.js'),
  ],
  style: [
    require('quill/dist/quill.snow.css'),
    require('./html-editor.scss'),
  ],
  template: require('./html-editor.html'),

  props: {
    userHtml: { type: String, default: '' },
    onUserHtmlChanged: { type: Function, required: false },
  },

  mounted() {
    const ed = this;
    const { l10n } = ed;
    const { quillWrapper } = ed.$refs;
    const quillCfg = {
      placeholder: l10n('editor_placeholder'),
      theme: 'snow',
      modules: {
        toolbar: {
          container: ed.$refs.toolbarWrapper,
          handlers: loMapValues(toolbarHandlers, f => f.bind(null, ed)),
        },
      },
    };
    ed.quillApi = new QuillApi(quillWrapper, quillCfg);
    ed.setUserHtml(ed.userHtml);

    const domApi = {
      getVueElem() { return ed; },
      getQuillApi() { return ed.quillApi; },
      getQuillWrapper() { return quillWrapper; },
    };
    Object.assign(ed.$el, domApi);

    ed.notifyTextChanged = (function installTextChangeHandler() {
      const f = function notifyTextChanged(details) {
        if (!ed.onUserHtmlChanged) { return; }
        if (details.newHtml === undefined) {
          details.newHtml = ed.getUserHtml();
        }
        const evt = { ...f.staticEventInfo, ...details };
        ed.onUserHtmlChanged(evt);
      };
      f.staticEventInfo = { name: 'userHtmlChanged', ...domApi };
      return f;
    }());

    ed.quillApi.on('text-change', function repack(delta, oldDelta, source) {
      ed.notifyTextChanged({ delta, oldDelta, quillEventSource: source });
    });
  },


  methods: {
    getUserHtml() { return this.$refs.quillWrapper.firstChild.innerHTML; },

    setUserHtml(html) {
      const ed = this;
      if (html === ed.getUserHtml()) { return; }
      ed.quillApi.pasteHTML(html);
      if (ed.onUserHtmlChanged) { ed.onUserHtmlChanged({ newHtml: html }); }
    },

  },


};
