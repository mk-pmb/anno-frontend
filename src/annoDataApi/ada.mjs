import arrayOfTruths from 'array-of-truths';
import getOwn from 'getown';

// function orf(x) { return x || false; }


const ada = {

  mapListField(anno, field, mapper) {
    return arrayOfTruths.ifAnyMap(getOwn(anno, field), mapper);
  },

  mapTargets(anno, mapper) { return ada.mapListField(anno, 'target', mapper); },
  mapBodies(anno, mapper) { return ada.mapListField(anno, 'body', mapper); },


  findTargetSelectors(anno, opt) {
    const tgt = anno.target;
    let sel = (tgt || false).selector;
    if (!sel) { return []; }
    sel = [].concat(sel).filter(Boolean);
    if (!opt) { return sel; }
    if (opt.type) { sel = sel.filter(s => (s.type === opt.type)); }
    if (opt.map) { sel = sel.filter(opt.map); }
    if (opt.filter) { sel = sel.filter(opt.filter); }
    if (opt.unique) {
      if (sel.length <= 1) { return (sel[0] || false); }
      throw new Error('Selector not unique');
    }
    return sel;
  },

  findTargetFragment(anno) {
    return (ada.findTargetSelectors(anno, {
      type: 'FragmentSelector',
      unique: true,
    }).value || null);
  },

};


// module.exports = ada;
export default ada;
