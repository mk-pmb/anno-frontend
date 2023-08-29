const fragment = require('vue-frag').Fragment;

const licensesInfo = require('../../../license-config.js');
const installPopOvers = require('../../popover-helper.js').install;

module.exports = {

  components: {
    fragment,
  },

  mixins: [
    require('../../mixin/l10n'),
  ],

  template: require('./licenses.html'),
  style: require('./style.scss'),

  props: {
    iconsColumnCssClass: String,
  },

  data() { return {
    licensesInfo,
  } },

  mounted() {
    installPopOvers(this.$el);
  },

  methods: {

    setNewLicense(licUrl) {
      // window.alert('License: ' + licUrl);
      // 2023-01-18: For reason unknown, a single click fires this handler
      //    twice. Ignoring due to low impact.
      this.$store.commit('SET_EDITOR_ANNO_PROP', ['rights', licUrl]);
    },

  },

};
