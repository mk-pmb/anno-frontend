/* -*- tab-width: 2 -*- */
'use strict';

const mergeOptions = require('merge-options');

const cfg = { // Default config. will be updated in-place later.
  version: { major: 4 },
};

const defaultTagsByBsMajorVer = {

  '3': {
    dropdownWrapperCls: [
      'dropdown',
      // ^-- https://getbootstrap.com/docs/3.3/components/#dropdowns

      // Required to allow dropdowns to integrate into btn-groups:
      'btn-group btn-group-sm',
    ],
    dropdownMenu: 'ul',
    dropdownMenuItem: 'li',
    dropdownMenuItemCls: '',
    dropdownMenuItemPad: 'a',
    dropdownMenuItemBtnCls: 'btn btn-sm',
    dropdownMenuItemChosen: 'btn-primary',

    modalHeaderTitle: 'h4',
  },

  '4': {
    dropdownWrapperCls: [
      'btn-group btn-group-sm',
      // ^-- https://getbootstrap.com/docs/4.0/components/button-group/#nesting

      // Not required for bootstrap but for our own stylesheets:
      'dropdown',
    ],

    dropdownMenu: 'div',
    dropdownMenuItem: 'a',
    // ul+li seems to work for BS4 as well and would be more semantic,
    // but I couldn't find official compatibility info in the BS4 docs.

    dropdownMenuItemCls: 'dropdown-item',
    dropdownMenuItemPad: 'span', // should be omitted once we drop BS3
    dropdownMenuItemBtnCls: '',
    dropdownMenuItemChosen: 'active',

    modalHeaderTitle: 'h5',
  },

};

function thr0w(e) { throw e; }

function initialize(customOpt) {
  Object.assign(cfg, mergeOptions.call({ ignoreUndefined: true },
    cfg, customOpt));
  const dfTags = (defaultTagsByBsMajorVer[cfg.version.major]
    || thr0w(new Error('Unsupported bootstrap version!')));
  cfg.tags = mergeOptions(dfTags, cfg.tags);
  Object.freeze(cfg);
}




module.exports = {
  sharedConfig: cfg,
  initialize,
};
