// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function getDraftGroups(cfg) {
  const sameSvc = (cfg.draftGroupSameServiceTargetPrefix && {
    voc: 'same_svc',
  });

  const grp = [

    { voc: 'same_anno' },
    { voc: 'same_subj' },
    sameSvc,
    { voc: 'other' },
    { voc: 'no_target' },

  ].filter(Boolean);
  return grp;
}


module.exports = getDraftGroups;
