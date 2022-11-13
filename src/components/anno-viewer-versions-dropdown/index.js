module.exports = {

  template: require('./versions.html'),
  style: [
    require('./style.scss'),
  ],

  mixins: [
    require('../../mixin/bootstrap-compat.js'),
    require('../../mixin/dateFmt.js'),
    require('../../mixin/l10n.js'),
  ],

  computed: {
    versionsList() { return (this.anno.hasVersion || [this.anno]); },
  },

  props: {
    onSelectVersion: { type: [Function] },
    anno: { type: [Object] },
  },

};
