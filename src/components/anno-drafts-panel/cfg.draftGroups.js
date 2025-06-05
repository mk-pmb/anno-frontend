// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function getDraftGroups(cfg) {
  const collapse = { initiallyExpanded: false };

  const sameSvc = (cfg.draftGroupSameServiceTargetPrefix && {
    voc: 'same_svc',
    ...collapse,
  });

  const grp = [

    { voc: 'same_anno' },
    { voc: 'same_subj' },
    sameSvc,
    { voc: 'other', ...collapse },
    { voc: 'no_target' },

  ].filter(Boolean);
  return grp;
}


module.exports = getDraftGroups;
