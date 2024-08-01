
Structure of the application
============================

All assets are bundled into a JS files in the `dist/` subdirectory:

* `anno-frontend.dev.js`: Development build, optimized for debugging.
* `anno-frontend.prod.js`: Production build, optimized for performance.

Both install the launch API into the property
`ubhdAnnoApp`
of the window global.

Choose either one and include it as a script tag into the website in which
the annotations sidebar app shall run.

The launch API can then be used to initialize an instance of the
annotations sidebar app into an existing DOM element.

Currently, only one instance of the app can run per browser frame.



### Example

See source code of
[`../test/html/displayAnnotations.nm.html`](../test/html/displayAnnotations.nm.html).

