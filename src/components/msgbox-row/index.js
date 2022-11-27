// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const objFromKeysList = require('obj-from-keys-list').default;


const severityColors = {
  fail:   'border-danger text-danger',
  warn:   'bg-warning text-default',
  info:   'border-info text-info',
  ok:     'border-succcess text-succcess',
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
  },

  methods: {

    reset() { this.setMsg(); },
    dismiss() { this.setMsg({ text: '' }); },

    setMsg(msg) {
      const panel = this;
      const pr = panel.$props;
      const m = {};
      simpleStringProps.forEach(key => { m[key] = (pr[key] || ''); });
      panel.msg = Object.assign(m, msg);
      return this;
    },

  },

};


module.exports = compoDef;
