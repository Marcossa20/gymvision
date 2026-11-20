// Test de las paletas de rangos para daltonismo (Reto 1 de La Persona). Uso: node scripts/test-daltonismo.js
// Método: simulación de Machado, Oliveira y Fernandes (2009), severidad 1,0, en RGB lineal; diferencia de color ΔE CIE76 en Lab (D65).
// Criterio: el mínimo ΔE entre las 6 parejas de rangos (15 pares) debe ser ≥ 20. Las paletas se leen de src/theme/tokens.ts.
const fs = require('fs');
const path = require('path');

const tokens = fs.readFileSync(path.join(__dirname, '..', 'src', 'theme', 'tokens.ts'), 'utf8');
const block = tokens.slice(tokens.indexOf('export const rankPalettes'));
const palette = (mode) => {
  const m = new RegExp(`${mode}:\\s*\\[([^\\]]+)\\]`).exec(block);
  return m[1].match(/#[0-9A-Fa-f]{6}/g);
};
const PALETTES = { none: palette('none'), protanopia: palette('protanopia'), deuteranopia: palette('deuteranopia'), tritanopia: palette('tritanopia') };
const NAMES = ['Bronce', 'Plata', 'Oro', 'Rubí', 'Esmeralda', 'Diamante'];
const THRESHOLD = 20;

const MACHADO = {
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
const toLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const toSrgb = (c) => { c = Math.max(0, Math.min(1, c)); return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)); };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const simulate = (h, mode) => { const l = rgb(h).map(toLin); return MACHADO[mode].map((r) => toSrgb(r[0] * l[0] + r[1] * l[1] + r[2] * l[2])); };
const lab = (c) => {
  const l = c.map(toLin);
  const X = (0.4124 * l[0] + 0.3576 * l[1] + 0.1805 * l[2]) / 0.95047, Y = 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2], Z = (0.0193 * l[0] + 0.1192 * l[1] + 0.9505 * l[2]) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
};
const deltaE = (a, b) => { const x = lab(a), y = lab(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
function minPair(pal, mode) {
  const s = pal.map((h) => simulate(h, mode));
  let best = { d: Infinity };
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const d = deltaE(s[i], s[j]); if (d < best.d) best = { d, a: NAMES[i], b: NAMES[j] }; }
  return best;
}
const fmt = (n) => n.toFixed(1).replace('.', ',');
let failed = false;
console.log('Modo          | Paleta original              | Paleta adaptada');
for (const mode of Object.keys(MACHADO)) {
  const o = minPair(PALETTES.none, mode), a = minPair(PALETTES[mode], mode);
  if (a.d < THRESHOLD) failed = true;
  console.log(`${mode.padEnd(13)} | ${fmt(o.d).padStart(5)} ${(o.d >= THRESHOLD ? '✓' : '✕')} (${o.a}–${o.b})`.padEnd(46) + ` | ${fmt(a.d).padStart(5)} ${(a.d >= THRESHOLD ? '✓' : '✕')} (${a.a}–${a.b})`);
}
console.log(failed ? '\nFALLO: alguna paleta adaptada no llega a ΔE ≥ ' + THRESHOLD : '\nOK: todas las paletas adaptadas cumplen ΔE ≥ ' + THRESHOLD);
process.exit(failed ? 1 : 0);
