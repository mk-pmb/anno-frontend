
`displayAnnotations(config)`
============================

1.  Initialize the state of the Vue store based on a `config` object.
    See chapter "Configuration" below.
1.  Start retrieving initial user session/identity information.
1.  Start retrieving initial annotations list.
1.  Install the Annotations Sidebar App ("AnnoApp") into the DOM.
1.  Returns a reference to the AnnoApp, which can be stored to use its API.



Configuration
-------------

See default config options and comments in
[`default-config/`](default-config/).



Methods
-------

### `startHighlighting(annoId, open)`
Deprecated. Use `.externalRequest('HighlightByTargetSelector', …)` instead.

### `stopHighlighting(annoId)`
Deprecated. Use `.externalRequest('HighlightByTargetSelector', …)` instead.

### `expand(annoId)`
Open thread tree to reveal anno with id `annoId`.



