// QR rotativo del torno (simulado, sin servidor): cambia cada 30 s para que una captura de pantalla
// no sirva para entrar. Teoría: seguridad sin carga para el usuario (no tiene que hacer nada).
export const ROTATE_MS = 30_000;

/** FNV-1a 32 bits: firma simple y determinista (suficiente para la simulación). */
function fnv1a(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function accessPayload(memberNo: string, secret: string, now = Date.now()) {
  const window = Math.floor(now / ROTATE_MS);
  return { payload: `GV1|${memberNo}|${window}|${fnv1a(`${secret}:${window}`)}`, msLeft: ROTATE_MS - (now % ROTATE_MS) };
}
