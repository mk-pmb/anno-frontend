// clog etc. = console.log (and similar), but with a prefix for easier trace.

const EX = function loggerFactory(prefix) {
  const f = m => console[m].bind(console, prefix + ':');
  const l = {
    cdbg: f('debug'),
    cerr: f('error'),
    cwarn: f('warn'),
  };
  return l;
};

module.exports = EX;
