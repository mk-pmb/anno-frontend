/**
 * ### `this.$auth(cond, [annoIdUrl])`
 *
 * Check authorization of user against `$store.state.acl`
 *
 * - `$auth(<cond>, <url>)` should be read as "Is the current user
 *   authorized to apply action `<cond>` on `<url>`"
 *
 */

const getOwn = require('getown');

const knownConditions = [
  'create',
  'mintDoi',
  'read',
  'remove',
  'revise',
];


function authApiError(msg) {
  console.error('Anno Editor ACL ckeck API error:', msg);
  // throw new Error(msg);
  return false;
}


function checkAuth(cond, annoIdUrl) {
  if (!knownConditions.includes(cond)) {
    return authApiError('Unsupported ACL condition (operation): ' + cond);
  }
  if (!annoIdUrl ) {
    // return authApiError('No Anno ID given for ACL check, condition=' + cond);
    return false;
  }
  const annoApp = this;
  const { acl } = annoApp.$store.state;
  if (!acl) {
    // console.warn("Not logged in")
    return false;
  }

  let rulesForThisAnno = getOwn(acl, annoIdUrl);
  if (rulesForThisAnno === undefined) { rulesForThisAnno  = getOwn(acl, '*'); }
  if (!rulesForThisAnno) {
    // console.warn(`No auth permissions info for ${annoIdUrl}, denying.`)
    return false;
  }

  const origPermSpec = getOwn(rulesForThisAnno, cond, rulesForThisAnno['*']);
  if (!origPermSpec) { return false; }
  if (origPermSpec === true) { return true; }
  const errMsg = ('Unexpected detailed permissions data for condition '
    + cond + ' for annotation ID ' + annoIdUrl);
  throw new TypeError(errMsg);
};


module.exports = {
  methods: {
    $auth: checkAuth,
  },
};
