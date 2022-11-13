module.exports = {
  template: require('./dd.html'),

  mixins: [
    require('../../mixin/bootstrap-compat.js'),
    require('../../mixin/l10n.js'),
  ],

  props: {
    caption:      String,
    iconText:     String,    // for using Unicode as icons
    iconFa:       String,
    btnClass:     { type: [String, Array], default: 'outline-secondary' },
    onToggle:     { type: Function, required: false },
  },


}
