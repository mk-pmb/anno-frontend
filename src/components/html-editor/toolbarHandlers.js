/*
  All toolbar handlers expect these parameters:
  1. Reference to the HTML Editor Vue instance.
*/

const libQuill = require('quill/dist/quill.js');


const EX = {

  undo(ed) { ed.quillApi.history.undo(); },
  redo(ed) { ed.quillApi.history.redo(); },

  image(ed) {
    const url = window.prompt(ed.l10n('image.prompt.url'));
    if (!url) { return; }
    const { quillApi } = ed;
    const where = quillApi.getSelection().index;
    quillApi.insertEmbed(where, 'image', url, libQuill.sources.USER);
  },

};


module.exports = EX;
