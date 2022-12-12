// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const vueGuessRefNamesPath = require('vue-guess-refname-path-to-pmb').default;
const objFromKeysList = require('obj-from-keys-list').default;
const isStr = require('is-string');


function humanTimeNow() { return (new Date()).toTimeString().slice(0, 8); }


const severityColors = {
  fail:   'border-danger text-danger',
  info:   'border-info text-info',
  ok:     'border-success text-success',
  wait:   'border-secondary text-default',
  warn:   'bg-warning text-default',
};

const severityIcons = {
  fail: '❌',
  info: '💡',
  ok: '✅',
  wait: '⏳',
  warn: '⚠',
};


const simpleStringProps = (function init () {
  const ssp = [
    'severity',
    'text',
    'textPre',
    'textSuf',
    'title',
    'topicCls',
  ];
  ssp.emptyStrings = objFromKeysList(() => '', ssp);
  return ssp;
}());


const boxStateByUniqId = new Map(); // Persist box state outside vue



const compoDef = {

  template: require('./row.html'),
  style: require('./style.scss'),

  props: {
    uniqId:         String,
    addTimestamp:   Boolean,
    autoscroll:     { type: Boolean, default: true },
    ...objFromKeysList(() => String, simpleStringProps),
  },

  data() { return {
    msg: {},
    effectiveUniqId: '',
  }; },


  mounted() {
    const box = this;
    let { uniqId } = box;
    if (!uniqId) {
      uniqId = ['', ...vueGuessRefNamesPath(box)].join('.$refs.');
      // console.debug('msgbox-row guessed a unique ID:', { uniqId });
    }
    if (!uniqId) { throw new Error('uniqId required for msgbox-row!'); }
    box.effectiveUniqId = uniqId;
    if (!boxStateByUniqId.get(box.effectiveUniqId)) { box.setMsg(); }
  },

  computed: {

    colorCls() {
      const sev = this.msg.severity;
      return (severityColors[sev || '']
        || ('border-' + (sev || 'secondary') + ' text-default'));
    },

    maybeIcon() {
      const icon = severityIcons[this.msg.severity];
      if (icon) { return icon + ' '; }
      return '';
    },

  },

  methods: {

    reset() { this.setMsg(); },
    dismiss() { this.setMsg({ text: '' }); },

    setMsg(severity, text, ...opt) {
      const box = this;
      if (isStr(severity)) { return box.setMsg({ severity }, text, ...opt); }
      if (isStr(text)) { return box.setMsg(severity, { text }, ...opt); }
      const pr = box.$props;
      const m = {};
      simpleStringProps.forEach(key => { m[key] = (pr[key] || ''); });
      Object.assign(m, severity, text, ...opt);
      m.timestamp = (box.addTimestamp && humanTimeNow());
      box.msg = m;
      // console.debug('msgbox upd:', { ...m });
      boxStateByUniqId.set(box.effectiveUniqId, m);
      if (box.autoscroll) {
        const domEl = box.$refs.scrollOffset;
        if (domEl.scrollIntoView) {
          // Defer until DOM updates have been rendered.
          setTimeout(() => domEl.scrollIntoView(), 5);
        }
      }
      return box;
    },

  },

};


module.exports = compoDef;
