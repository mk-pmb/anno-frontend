// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function orf(x) { return x || false; }
function parseDate(d) { return (+(new Date(d))) || 0; }

const dummySortable = { sort: Boolean };


const EX = function findAnnoRelations(allAnnosFlat) {
  // Register all known annos as potential parents
  // and prepare their list of children (i.e. replies).
  const annosById = new Map();
  const repliesByParentId = new Map();
  allAnnosFlat.forEach(function prepare(anno) {
    const directChildren = []; // We'll find them later.
    // eslint-disable-next-line no-param-reassign
    anno[':ANNO_FE:replies'] = directChildren;
    if (anno.id) { annosById.set(anno.id, anno); }
    const rt = EX.decideReplyTarget(anno);
    if (!rt) { return; } // ID-less anno cannot have replies
    repliesByParentId.set(rt, directChildren);
  });

  const nonReplyAnnos = [];
  // ^- Annos that are meant to be top-level,
  //    i.e. do not reply to some other anno.
  const orphanedAnnos = [];
  // ^- Annos that refer to a parent which we do not know.

  allAnnosFlat.forEach(function divide(anno) {
    const mot = anno.motivation;
    const isReply = (mot && [].concat(mot).includes('replying'));
    if (!isReply) { return nonReplyAnnos.push(anno); }
    let inReplyTo = orf(orf(anno.target)[0]);
    inReplyTo = (inReplyTo.id || inReplyTo);
    const replies = repliesByParentId.get(inReplyTo);
    if (replies) { return replies.push(anno); }
    console.warn(EX.name + ': orphan:', { id: anno.id, inReplyTo });
    return orphanedAnnos.push(anno);
  });

  allAnnosFlat.forEach(function sortSubAnnos(anno) {
    (anno[':ANNO_FE:replies'] || dummySortable).sort(EX.cmpAnnoDates);
  });

  const topLevelAnnos = [
    ...nonReplyAnnos,
    ...orphanedAnnos,
  ];

  const relations = {
    allAnnosFlat,
    findAnnoById(pid) { return orf(annosById.get(pid)); },
    findRepliesByParentId(pid) { return orf(repliesByParentId.get(pid)); },
    nonReplyAnnos,
    orphanedAnnos,
    topLevelAnnos,
  };

  return relations;
};


Object.assign(EX, {

  decideReplyTarget(anno) {
    if (!anno) { return false; }
    return (anno['dc:isVersionOf'] || anno.id);
  },

  cmpAnnoDates(a, b) { return parseDate(a.created) - parseDate(b.created); },

});


module.exports = EX;
