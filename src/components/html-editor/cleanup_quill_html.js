function replaceClassSpan(orig, cls, inner) {
  // console.debug('replaceClassSpan:', { orig, cls, inner });
  if (cls === 'ql-size-normal') { return inner; }
  if (cls === 'ql-size-small') { return '<small>' + inner + '</small>'; }
  return orig;
}


const EX = function cleanupQuillHtml(unclean) {
  let h = unclean;
  h = h.replace(/<span class="(ql-[^<>]*)">((?:[^<>]|<\/?(?:br|img|a|i|u)(?:\/| [^<>]*|)>)+)<\/span>/g, replaceClassSpan);
  h = h.replace(/\s*<br[\/\s]*>/g, '<br>');
  h = h.replace(/<img [^<>]+/g, s => s.replace(/\s*\/?$/, ''));
  h = h.replace(/(<\/p>\s*<p>)((?:<br>)*)/g, '$2$1');
  h = h.replace(/^(<p>(?:\s|<br>)*<\/p>)+/g, '');
  h = h.replace(/<p><br ?\/?><\/p>/g, '<p>&nbsp;</p>');
  h = h.replace(/<p>\s*<\/p>/g, '');
  return h;
}


module.exports = EX;
