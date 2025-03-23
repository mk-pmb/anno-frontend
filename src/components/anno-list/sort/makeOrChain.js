const EX = function makeOrChain(z) {
  const n = z.length;
  const f = EX[n];
  if (!f) { throw new Error('Unsupported chain length.'); }
  const c = f(...z);
  c.parts = z;
  return c;
};

EX[4] = (a, b, c, d) => (x, y) => (a(x, y) || b(x, y) || c(x, y) || d(x, y));

module.exports = EX;
