// eslint-disable-next-line no-unused-vars
const { cdbg, cerr, cwarn } = require('../../clog.js'
  )('Anno-Editor: fixupSvgSelector');


const svgRgx = {
  allWidthHeightAttrs: /\b(width|height)="([ !#-~]*)("?)/g,
  emptySvgTag: /^<svg\s*>\s*<\/svg\s*>$/,
  shapeWithNoNonzeroDigits: /<\w+ [^<>1-9]+>/,
  tinyShape: /<\w+(?=\s)[^<>]*\s(?:width|height)="\d{0,2}e\-\d{2,}"[^<>]>\s*/g,
};

const maxSvgSelBytes = 32 * 1024;


const EX = function fixupSvgSelector(unoptimizedNewSvg, oldSvg) {
  let newSvg = String(unoptimizedNewSvg || '').trim();

  function discardSvgPart(part) {
    discardSvgPart.had.push(part);
    return '';
  };
  discardSvgPart.had = [];

  newSvg = newSvg.replace(svgRgx.tinyShape, discardSvgPart);
  newSvg = newSvg.replace(/\s*(?=<\w)/g, '\n');
  if (svgRgx.emptySvgTag.test(newSvg)) { newSvg = discardSvgPart(newSvg); }
  if (discardSvgPart.had.length) {
    cwarn('Discarded degenerate SVG part(s):', discardSvgPart.had);
  }

  if (!newSvg) { return ''; }

  function fail(why) {
    const e = EX.refuse + 'SVG selector ' + why;
    const n = '\n' + encodeURI(newSvg).replace(/%20/g, decodeURI);
    cerr(e || n, { oldSvg, newSvg });
    return '<fail>' + e;
  }

  if (newSvg.length > maxSvgSelBytes) {
    return fail + 'is too huge: ' + newSvg.length + ' bytes';
  }
  if (!/\d/.test(newSvg)) { return fail + 'contains no digits at all.'; }
  if (!/[1-9]/.test(newSvg)) { return fail + 'contains no non-zero digits.'; }

  let badAttr;

  function checkSvgWidthHeightAttr(match, attrName, attrValue, endQuote) {
    if (badAttr) { return; }
    if (!endQuote) {
      badAttr = 'Missing ending quote: ' + match;
      return;
    }
    const numVal = +attrValue;
    if (!Number.isFinite(numVal)) {
      badAttr = 'Invalid non-number value: ' + match;
      return;
    }
    if (numVal > 0) { return match; }
    badAttr = 'Zero or negative number value: ' + match;
  }
  newSvg.replace(svgRgx.allWidthHeightAttrs, checkSvgWidthHeightAttr);
  if (badAttr) { return fail + badAttr; }

  const m = svgRgx.shapeWithNoNonzeroDigits.exec(newSvg);
  if (m) { return fail + 'contains a shape with no non-zero digits.'; }

  return newSvg;
};



EX.refuse = 'Refusing setZoneSelector(): ';


module.exports = EX;
