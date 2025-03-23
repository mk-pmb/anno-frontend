const loMapValues = require('lodash.mapvalues');

const formatters = require('../../anno-viewer/formatters.js');

const makeOrChain = require('./makeOrChain.js');
const makeOneExtractor = require('./makeExtractor.js');
const makeOneComparator = require('./makeComparator.js');


function nope() { return false; }
function parseDate(d) { return (+(new Date(d))) || 0; }
function jsonDeepCopy(x) { return x && JSON.parse(JSON.stringify(x)); }



const EX = {

  availableCriteria: {
    // sorted by default priority
    created: { transform: parseDate },
    title: { field: 'dc:' },
    creator: { transformVue: formatters.list.bind(null, 'agentNickname') },
    rights: true,
    id: true,
  },


  maxActiveCriteria: 3, // value + 1 must be supported by orChain.js


  currentCriteriaAndWheterhInverted: null, /*
    will be set later via resetSortCriteria. */


  stringifyCriteriaStack(cc) {
    return Object.keys(cc).map(k => (cc[k] ? '-' : '+') + k).join('');
  },


  getCurrentCriteriaStackAsString() {
    return EX.stringifyCriteriaStack(EX.currentCriteriaAndWheterhInverted);
  },


  parseCriteriaStackString(s) {
    const cc = {};
    const avail = EX.availableCriteria;
    let inv = false;
    const parts = String(s || '').split(/(\+|\-)|\s+/);
    parts.forEach(function add(p) {
      if (!p) { return; }
      if (p === '+') {
        inv = false;
        return;
      }
      if (p === '-') {
        inv = true;
        return;
      }
      if (p in avail) { cc[p] = inv; }
    });
    return cc;
  },


  setPrimarySortCriterion(newCriteria) {
    const parsed = EX.parseCriteriaStackString(newCriteria);
    const old = EX.currentCriteriaAndWheterhInverted;
    const cc = { /*
      We make use of the fact that JS remembers the order in which properties
      were added to an object, so we don't have to use a priority list and
      manually deal with avoiding duplicates. We have to add the lists twice
      though: First to win the key order, the to win the effective values. */
      ...parsed, // newCriteria have highest decision power for key order
      ...old, // preserve order of keys not mentioned in newCriteria.

      // Add potential remaining criteria, to simplify testing (see README.md):
      ...EX.getDefaultSortCriteria(),

      // Now we decide the values:
      ...old, // preserve values of criteria not mentioned in newCriteria.
      ...parsed, // enforce all value decisions in newCriteria
    };
    const ccStr = EX.stringifyCriteriaStack(cc);
    // console.debug('anno-frontend: sort: new criteria stack:', ccStr);
    EX.currentCriteriaAndWheterhInverted = cc;
    return ccStr;
  },


  getDefaultSortCriteria() { return loMapValues(EX.availableCriteria, nope); },


  restoreCriteriaStackFromString(s) {
    EX.currentCriteriaAndWheterhInverted = {};
    EX.setPrimarySortCriterion(s);
  },


  verifySorted(onBehalfOfVueElem) {
    // returns: boolean, whether the list was already sorted.
    let list = onBehalfOfVueElem.$store.state.annotationList.list;
    const nAnnos = (+list.length || 0);
    if (nAnnos < 2) { return true; }
    const ccStr = EX.getCurrentCriteriaStackAsString();
    if (list.sortedBy === ccStr) { return true; }

    const cc = EX.currentCriteriaAndWheterhInverted;
    const effCritNames = Object.keys(cc).slice(0, EX.maxActiveCriteria);
    const extractors = effCritNames.map(name => makeOneExtractor(
      onBehalfOfVueElem, name, EX.availableCriteria[name]));
    list = jsonDeepCopy(list); // unwrap Vue's getters
    const summaries = list.map(function summarizeAnno(anno, idx) {
      const summary = extractors.map(xf => xf(anno));
      summary.origIndex = idx;
      summary.annoIdUrl = anno.id;
      return summary;
    });
    const comparators = effCritNames.map(
      (name, summKey) => makeOneComparator(summKey, cc[name]));
    comparators.push(EX.fallbackComparator);
    const cmp = makeOrChain(comparators);
    summaries.sort(cmp);
    // console.debug('anno-frontend: sort:', summaries, { cmp });
    const sortedAnnos = summaries.map(summ => list[summ.origIndex]);
    sortedAnnos.sortedBy = ccStr;
    onBehalfOfVueElem.$store.commit('ANNOLIST_REPLACE', sortedAnnos);
    return false;
  },













};


EX.restoreCriteriaStackFromString('');
EX.fallbackComparator = makeOneComparator('annoIdUrl', false);








module.exports = EX;
