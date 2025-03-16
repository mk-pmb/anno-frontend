
anno-list-sort-config
=====================


Problems with the legacy UI (up to 0.8.x)
-----------------------------------------

In `anno-frontend` versions up to and including 0.8.x,
our user interface for sorting was deceivingly simple:
Just a drop-down with two entries per criteria,
one for ascending and one for descending.

That had some important shortcomings:
* __Reproducibility:__ The order of sorting criteria was hidden from users.
* __Multi-value fields__ were just not supported for sorting.
* __Replies__ couldn't be sorted separate from top-level annotations.



### Reproducibility

Users were deceived into thinking that only one criterion is active at a time,
but in reality, the effects of previous sorting were preserved.
For example, when you first sorted by date, and then by name, and there were
multiple annotations by the same author, the annotations list would secretly
remember whether your prior sorting by date had been ascending or descending.

This can bite users when they have several annotations with similar titles,
reload the page, and then try to find the same annotation by its position in
the list. They may then inadvertently act on the wrong annotation.

The problem becomes worse because reloads can happen without the user
understanding that the page was reloaded, e.g. when they close the tab and
then misunderstand their browser's "reopen previously closed tab" as an "undo",
because "undo" probably was their intent, and the result may look really
similar to their expectation.
Additionally, `anno-frontend` uses automatic page reloads for lots of actions
where we lack proper update mechanisms.
In ideal conditions, they can happen so quickly that average users won't
even notice it.

After reload, the old versions either remembered the last-used criterion,
or users would have to manually select it again. In either case,
most users wouldn't expect that, to get the previous list state,
they'd have to manually repeat several of their previous criteria selections.

* &rArr; If we keep supporting the stacking of multiple criteria, the frontend
  will have to remember __all__ active sort criteria.
  * We can reduce the impact of "all" by limiting the number of active sort
    criteria.
  * To simplify testing, we should avoid adding extra application states that
    don't yield a benefit. Those would include "incomplete" selections of
    sort criteria, i.e. having less-than-possible active criteria.
* A UI that allows direct configuration of all criteria would be too complex
  for a bootstrap drop-down menu.
  * We can buy easier implementation at the cost of making users perform more
    interaction steps:
    * Make only the primary sort criterion selectable:
      When a criterion is selected, move it to the top of the stack.
      Additional criteria are shown for informational purposes only,
      without any way to directly interact.
      * Or we can just hide the additional criteria. Users don't neccessarily
        need to know that we've taken care of the reproducibility issue.
    * Bad idea listed to avoid anyone re-inventing it:
      Present the option for inverted sort separate from the core criterion
      selection. This way, each criterion only needs one menu item.
      Toggling it would toggle the direction of the primary sort criterion,
      and also switch which direction of the other criteria would be offered
      in the menu.
      The problem with this approach is that it's not intuitive:
      Users may notice only one of both effects, and thus ask support
      questions on where to toggle the primary sort direction, or where to
      find the alternate sort direction for the other criteria.

To maximize stability, we should add a "last resort" criterion that always
yields a clear winner, i.e. has no equal values, like the anno ID.

&rArr; The new sort in version 0.9.0:
  * shall have a fixed number of active sort criteria.
  * shall use the UI simplifications suggested above.



### Multi-value fields

Currently, the only multi-value field that supports sorting is the authors.
This is implemented by trying to imitate the creator names preview displayed
in the list.

When you're sorting by author, you're probably doing so to either find a
specific name, or to group together annotations from the same author.
Both can easily fail for annotations where the author in question appears
late in the creators list.

We don't have a good solution for that yet.
For now, it's not a priority problem for us, because our main usecases
only receive annotations from `anno-frontend` and that currently only supports
submitting annotations with one single author identity.

&rArr; The new sort in version 0.9.0:
  * will have limited support for sorting by the authors list.



### Replies

When you sorted the top-level annotations by creator to find the author
whose annotation you're interested in, you may still want the replies
to be ordered by date, to be able to follow the flow of the conversation.

As with the reproducibility problem, there's a trade-off between user choice
and simplicity of the UI.
So far, the feature requests from users were only about sorting top-level
annotations, so we may not actually need custom sorting for replies.

&rArr; The new sort in version 0.9.0:
  * shall support separate sort criteria for top-level annotations and replies.
    * However, for now, the sort criterion for replies will be fixed,
      and in order to present conversations chronologically,
      that fixed criterion will be publication date.




















