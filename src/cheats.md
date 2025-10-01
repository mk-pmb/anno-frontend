
UI Debug Cheats
===============


Motivation
----------

When you want to debug something for which you'd usually need to login,
but it's inconvenient or impractical (e.g. because the login server has
a scheduled maintenance), you can use cheats to make anno-frontend try
and behave as if you had the permissions.
This only affects your view of the website, and only in your browser.
The cheating thus ends whenever the server would have to cooperate:

* With cheated moderator status, you still won't be able to snoop on
  other users' annotations in the approval queue, because the server
  still won't disclose their existence.

* With cheated submission permission, anno-frontend will offer the
  "publish" button, but if you use it, you'll still get a "permission
  denied" error from the server.
  * This is actually useful for debugging the `anno-server-22` ACL,
    because the error message will show details on who the server thinks
    you are and what it thinks you tried to do.



Available cheat codes
---------------------

(See below for how to use them.)

* `RESET`: Disables all currently active cheats.
* `IDCHOPPERS`: Enable approval mode.
  You're a moderator now, with buttons to approve or retract annotations.
* `IDDQD`: Enable UI debug mode.
  Walls of text will be tamed, and in lots of places a button with
  a gear symbol will appear to allow you to inspect the inner workings
  of anno-frontend.
* `IDKFA`: Grants every permission in existence, on everything you can see.
* `xrx`: Resurrect the old legacy zone editor. May require a page reload.
* `preimg`: Try and initialize the zone editor earlier than usual.


If some of them seem to not work, this document may have become outdated.
In that case, please refer to the list at the bottom of
[`cheats.js`](cheats.js) to see if you can guess what changed,
and if you discover it's really outdated, please file a bug report.



How to cheat
------------

1.  A later step will become easier if you can see any of the following:

    * The username menu in the top-right of the anno list.
    * An existing annotation.
    * The preview tab in the editor.

    So if you can arrange for that, it would help to do it now.

1.  In your browser's address bar, go to the end of the website URL.
    (Usually: Click the address, press the "End" key.)

1.  Check if there URL already ends with a number sign (`#`) and maybe a
    word behind it. If so, delete that part.

1.  Append number sign (`#`) and the cheat code.

1.  Press enter. (Ideally, it will seem like nothing happened.)

1.  If you can click the username menu, do it.
    The cheat should become active immediately, and in the bottom of the
    username menu, a list of currently enabled cheats should appear.

1.  Otherwise, if you can you see an existing annotation or the preview tab,
    expand the license details, and click on the first word of the headline
    (in the English version, that should be "License:".)

1.  If you have none of that available (yet), reload the page.
    Cheats should apply as soon as the page is ready again.






















&nbsp;

-----
