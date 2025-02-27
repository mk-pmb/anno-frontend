/* -*- tab-width: 2 -*- */
'use strict';

/*  NOT eslint-env browser: We want these files to be loadable in node.js
    as well, so we can do automated unit tests. */
// eslint-disable-next-line no-undef
const win = ((typeof window !== 'undefined') && window);

const annoDataCfg = {

  targetSource: (win && win.location.href), /*
    The target of the annotation.
    In case of a targetImage (below): The URL of the website that
    displays the annotations about the image.
  */

  targetImage: '', /*
    In case of annotations about an image, URL of an image file in
    default (usually: original) resolution.
  */
  targetImageHeight: -1,
  targetImageWidth: -1,

  targetScopeImpliesSource: true, /*
    Whether the targetImage can be unambiguously inferred from targetSource.
    If set, the frontend will consider both targetImage and targetSource
    to denote the same subject-matter.
    This affects how drafts are saved, and grouped in the drafts list.
    It's useful in cases where the scope represents a subject-matter that
    is available in several formats, where the image is only one of them.
  */

  targetFragment: '',

  targetMetaData: {
    // 'dc:title': '…',
    /* The title, if available, will be used for link captions,
      so prefer the scope's title if applicable.
      Also, if people are likely to annotate targets with similar titles,
      it's beneficial to have the distinguishing parts (e.g. page or part
      numbers) near the beginning, in case the title is truncated. */

    /* Theoretically, we could add even more:
      'dc:author': '…',
      'dc:description': '…',
      … but most clients won't be able to use that anyway, and it may
      quickly become redundant for groups of similar targets, so we
      should prefer to declare those on the targetSource instead,
      using HTML meta tags or similar.
      */
  },

  iiifUrlTemplate: '',
  /* ^-- Empty string, null, false: No IIIF links are shown.
      Non-empty string: For annotations with SVG zones, a link to the
      IIIF image¹ is shown. (¹ A rectangule that encloses all zones.)
      When the IIIF image link is enabled, options
      `targetImageHeight` and `targetImageWidth` are mandatory.
      The IIIF image URL is based on this template, which accepts thes
      placeholders:
      * `%ir`: the region data.
      * `{{ iiifRegion }}` (deprecated): compatibility alias for `%ir`.
  */


  predictMintedDoiUrl: false,
  // ^- Optional factory function for a function that predicts DOIs
  //    from their anno ID or version identifier.

  versionSuffixRgx: /[~_](\d+)$/,
  // ^- For guessing the version number from anno ID URLs.

  doiVersionSuffixRgx: /[~_]\d+$/,
  // ^- In case the latest version's DOI can be predicted by omitting
  //    a suffix, this is a RegExp that matches the suffix.





};


module.exports = annoDataCfg;
