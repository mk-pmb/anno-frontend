
Events
======

The `events` option may hold a dictionary object that may define event
handlers (event name &rarr; function). Currently, these are supported:

### `appReady`
Fired after the AnnoApp has been installed into the DOM.
A single argument is passed: The reference to the AnnoApp.

### `mouseover`, `mouseleave`
Fired when the mouse pointer hovers/unhovers an annotation.
For details, see the anno-viewer component documentation.

### `targetFragmentButtonClicked`
Fired when the Fragment Identifier button is clicked.
For details, see the anno-viewer component documentation.

### `annoListFetchedRaw`
Fired when the list of annotations has been fetched from the server.

### `annoListFetchedOptimized`
Fired after `annoListFetchedRaw` when additionally, the list of annotations
has been optimized, which usually means related annos have been interlinked
and potentially re-arranged into a nested tree.

### `annoListFetchedCounts`
Fired after `annoListFetchedOptimized`. The argument is an object with some
non-negative numbers measuring the amount of annotations. Currently, it has
`nTopLevelAnnos` and `nTotalAnnosIncludingNested`.

### `updatedPermissions`
Fires when the user's permissions have been modified.


