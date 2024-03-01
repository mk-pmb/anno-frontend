// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */


const eventBus = require('../../event-bus.js');
const installPopOvers = require('../../popover-helper.js').install;

const defaultLinkRel = [
  'external',
  'nofollow',
  'noopener',
  'noreferrer',
].join(' ');


module.exports = {

  template: require('./bootstrap-button.html'),
  style: [
    require('./balloon.scss'),
  ],

  mixins: [
    require('../../mixin/l10n.js'),
  ],

  props: {
    caption:      String,
    title:        String,
    eventbusEmit: String,
    eventbusArgs: [Array, Function],
    prefix:       { type: String, default: 'ubhdannoprefix_zoneeditor' },
    iconText:     String,    // for using Unicode as icons
    iconFa:       String,
    src:          String,
    alt:          String,
    linkUrl:      String,
    linkRel:      { type: String, default: defaultLinkRel },
    linkTarget:   String,
    clickTarget:  { type: Object },
    btnSize:      { type: String, default: 'sm' },
    btnClass:     { type: [String, Array], default: 'outline-secondary' },
    elem:         { type: String },
    balloonColorName: { type: String, default: 'secondary' },
    popoverContentOpts: { type: [Object] },
    irrevocableConfirm: Boolean,
  },

  mounted() {
    const btn = this;
    const domElem = btn.$el;
    if (btn.$slots.popover) {
      installPopOvers(domElem, {
        subSel: null,
        content: btn.$refs.popoverContent,
        ...btn.popoverContentOpts,
      });
    }
    btn.$el.getVueElem = () => btn;
  },

  methods: {

    decideButtonTag() {
      const btn = this;
      const {
        elem,
        linkUrl,
      } = btn.$props;
      if (elem) { return elem; }
      if (linkUrl) { return 'a'; }
      if (btn.$slots.balloon) { return 'div'; }
      if (btn.$slots.popover) { return 'div'; }
      return 'button';
    },

    balloonBoxClasses(pre) {
      return [].concat(pre, [
        'bg-white',
        'bg-body',
        'border',
        'border-' + this.balloonColorName,
      ]).filter(Boolean);
    },

    clicked(ev) {
      const btn = this;
      if (btn.irrevocableConfirm) {
        const q = (btn.l10n('confirm_irrevocable_action') + '\n'
          + ((btn.$el.innerText || '').trim() || btn.l10n('no_data')));
        if (!window.confirm(q)) { return false; }
      }
      btn.$emit('click', ev);
      if (btn.eventbusEmit) {
        let args = btn.eventbusArgs || [];
        if (args.call) { args = [].concat(args()); }
        eventBus.$emit(btn.eventbusEmit, ...args);
      }
      if (btn.$slots.balloon) { btn.$el.classList.toggle('balloon-open'); }
    },

  },

};
