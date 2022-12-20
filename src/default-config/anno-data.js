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

  targetImage: null, /*
    In case of annotations about an image, URL of an image file in
    default (usually: original) resolution.
  */
  targetImageHeight: -1,
  targetImageWidth: -1,
  targetThumbnail: null,

  targetScopeImpliesSource: true, /*
    Whether the targetImage can be unambiguously inferred from targetSource.
    If set, the frontend will consider both targetImage and targetSource
    to denote the same subject-matter.
    This affects how drafts are saved, and grouped in the drafts list.
    It's useful in cases where the scope represents a subject-matter that
    is available in several formats, where the image is only one of them.
  */

  targetFragment: null,

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





};


module.exports = annoDataCfg;
