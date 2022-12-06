// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const objFromKeysList = require('obj-from-keys-list').default;
const isStr = require('is-string');


const severityColors = {
  fail:   'border-danger text-danger',
  info:   'border-info text-info',
  ok:     'border-succcess text-succcess',
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
    'title',
    'text',
    'textPre',
    'textSuf',
    'severity',
    'topicCls',
  ];
  ssp.emptyStrings = objFromKeysList(() => '', ssp);
  return ssp;
}());



const compoDef = {

  template: require('./row.html'),

  props: {
    ...objFromKeysList(() => String, simpleStringProps),
  },

  data() { return {
    msg: { ...simpleStringProps.emptyStrings },
  }; },

  mounted() {
    this.reset();
  },

  computed: {

    colorCls() {
      const sev = this.severity;
      return (severityColors[sev || '']
        || ('border-' + (sev || 'secondary') + ' text-default'));
    },

    maybeIcon() {
      const icon = severityIcons[this.severity];
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
      box.msg = m;
      console.debug('msgbox upd:', { ...m });
      return box;
    },

  },

};


module.exports = compoDef;
