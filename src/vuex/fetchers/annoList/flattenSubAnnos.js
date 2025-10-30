// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const EX = function flattenSubAnnos(origTopAnno) {
  const topAnno = { ...origTopAnno };
  const offspring = [];
  let nextReplyRefNum = 1;
  (function dive(origAnno, ctx) {
    const {
      ancestorIds,
      parent,
      indent,
    } = ctx;
    // const depth = ancestorIds.length;
    const anno = { ...origAnno };
    if (parent) {
      anno[':ANNO_FE:inReplyToRefNum'] = parent[':ANNO_FE:replyRefNum'];
      offspring.push(anno);
    }
    const directChildren = anno[':ANNO_FE:replies'];
    delete anno[':ANNO_FE:replies'];
    if (!directChildren) { return; }
    const annoIdUrl = anno.id;
    if (ancestorIds.includes(annoIdUrl)) {
      return console.warn(EX.name + ': cyclic reply:', { annoIdUrl });
    }
    if (parent) {
      anno[':ANNO_FE:replyRefNum'] = nextReplyRefNum;
      nextReplyRefNum += 1;
    }
    const subCtx = {
      ...ctx,
      parent: anno,
      ancestorIds: [...ancestorIds, annoIdUrl],
      indent: '  ' + indent,
    };
    directChildren.forEach(subAnno => dive(subAnno, subCtx));
  }(topAnno, {
    parent: false,
    ancestorIds: [],
    indent: '',
  }));
  if (offspring.length >= 1) {
    topAnno[':ANNO_FE:replies'] = offspring;
  }
  return topAnno;
};


module.exports = EX;
