
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

### `configure(update)`
The `update` parameter should be an object, false-y, or omitted.
Merge the settings from `update` into the config.
Invokable only before the anno app is `start()`ed.
Returns the current accumulated config object.

The returned object is only valid until `configure` is called again or the
app is started. To be safe, consider it stale as soon as the function that
obtained it loses control flow.


### `start()`
Start the anno app.
Invokable only before the anno app is `start()`ed.


### `startHighlighting(annoIdUrl)`
Start highlighting one annotation.

### `stopHighlighting(annoIdUrl)`
Stop highlighting one annotation.



