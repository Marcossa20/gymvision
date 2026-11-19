# Punto de control · parte A (Marcos)

> Última actualización: 18-11-2026. Para retomar: leer `CLAUDE.md`, `REPARTO.md` y este archivo.
> Rama de trabajo: `marcos/entreno-en-curso` (todavía **no** mezclada en `main`).

## Estado

**Hecho y probado en la vista web (typecheck ✓)**
- Base: tema claro/oscuro/alto contraste, texto en 4 niveles, paletas de daltonismo v2, token `surface2`, háptica (`services/haptics.ts`), avisos visuales (`services/alerts.ts`, incluye `'taquilla'`).
- Entrenar → Detalle de rutina → Entreno en curso (peso/reps deslizando, serie con un toque, borrar deslizando con «Deshacer», descanso integrado con −15 s/+15 s/Saltar) → Resumen → Progreso de rango.
- Rutinas: Mis rutinas (menú con pulsación larga, duplicar, cambiar días, eliminar con confirmación y deshacer), Crear/Editar (reordenar arrastrando), Añadir ejercicio (buscador + filtros), Configurar ejercicio, Crear ejercicio.
- Ajustes: Ajustes, Accesibilidad (Retos 1, 2 y 3), Notificaciones, Unidad de peso, Idioma.
- `services/notifications.ts` (último cambio): el fin de descanso avisa aunque salgas de la pantalla de entreno; en móvil programa además una notificación local con acciones «Empezar serie» y «+30 s». El temporizador interno funciona también en web.
- Issues de Miguel Ángel #2, #4 y #5 atendidas en esta rama (`'taquilla'`, `lastSets`, `surface2`). Siguen abiertas en GitHub hasta mezclar con `main`.

**No probado en móvil real (iPhone)**
- Vibración, gestos con el dedo (rueda de peso, borrar deslizando, **reordenar rutina arrastrando**) y las notificaciones con acciones. Solo se ha visto en el navegador.

## Cómo ejecutarlo
- Web: `npx expo start --web` → http://localhost:8081
- iPhone con Expo Go: `npx expo start` y escanear el QR.
  - Wifi de la universidad: usar `--tunnel` o el punto de acceso del iPhone (con el PC conectado a él, sin cable).
  - **Problema pendiente:** Expo Go muestra «You need to be signed in to Expo Go and Expo CLI». Solución: cerrar sesión en Expo Go **o** ejecutar `npx expo login` en el PC con la misma cuenta.

## Estado de integración
- `main` ya contiene **todo**: mi parte (PR #12) y la de Miguel Ángel (PR #3, #6, #7, #8, #9, integrados con el #13). Revisado: sin red, sin secretos reales, no toca archivos de A. Typecheck ✓ y `expo export` Android ✓.
- Issue abierta: #11 `[para B]` `deleteAccount()`.

## Cómo probar en el iPhone
- `expo-dev-client` está instalado (lo añadió el laboratorio), así que `npx expo start` arranca **en modo development build**. Para Expo Go: pulsar `s` en la terminal.
- Sigue pendiente el aviso «signed in to Expo Go and Expo CLI»: cerrar sesión en Expo Go o `npx expo login`.
- NFC real y `expo-brightness` necesitan development build (en Expo Go hay botón «Simular cerradura»).

## Pendiente, por orden
1. Probar todo en el iPhone y corregir (vibración, gestos, reordenar, notificaciones, cámara QR, pasos).
2. i18n con `i18next` (es + en; hoy todo en español).
3. Widget / pantalla de bloqueo (nativo; simulado).
4. Pantallas sin leer del Figma: Crear ejercicio, Mis rutinas vacío, Resultados Cardio; «Reemplazar», «Tutorial» y «Notas» del entreno son avisos.
5. Revisión final de accesibilidad con lector de pantalla y prueba en Android.

## Notas
- Resumen del entreno y Progreso de rango ya siguen el Figma (récords, músculos trabajados, mejora de rango del músculo). `WorkoutRecord` tiene campos opcionales nuevos `records`, `muscles` y `rankDelta`.
- El aviso visual (banner) tapa unos segundos la cabecera de la pantalla de entreno, incluido el botón «Terminar»: valorar moverlo o hacerlo no bloqueante.
- Cuenta de demostración fija en `store/auth.ts` (miguel@correo.com): vale para la exposición; el hash es una simulación, no seguridad real.
- `Routine` usa `days: number[]` (0 = lunes) y los ejercicios pueden llevar `goal`/`target` (cardio). Guardado local con migración.
- `assets/equipment/cardio.jpg` muestra un torso, no algo de cardio: revisar.
- Modelo: Sonnet 5.5 vale para casi todo; Opus si fallan reordenar con el dedo, notificaciones, acelerómetro o NFC.

## Traducciones (rama `marcos/traducciones`, SIN mezclar en `main`)
- Infraestructura i18next: la clave es el texto en español; el inglés está en `src/i18n/en.json` (612 claves). `src/i18n/index.ts` sigue el ajuste de idioma.
- Traducido **todo** (probado en web en English; mis pantallas probadas también en iPhone): Entrenar, entreno, resumen, rutinas, ajustes, avisos, notificaciones, fechas y nombres de ejemplo.
- También traducidas las pantallas de Miguel Ángel (con su permiso, solo cambios `t('texto')`, sin tocar lógica): auth, gym (+ mensajes de `services/nfc.ts`), cardio, perfil y rangos. Los nombres de rango se traducen en `domain/ranks.ts` (`i18n.t`). Excepción: el Laboratorio (`features/lab`, solo dev) sigue en español.
- Formato de números según idioma: español `1.234,5`, resto `1,234.5` (`fmtInt`, `fmtDec`, `fmtNum`, `fmtThousands`). Fechas del perfil derivadas de los nombres de día/mes traducidos.
- Falta: probar lo de Miguel Ángel en el iPhone, que él lo revise (su agente puede buscar lo que falte), y mezclar. fr/de/it/pt se muestran en inglés.
- Patrón para textos nuevos: `const { t } = useTranslation();` → `t('Texto en español')`; fuera de componentes `i18n.t(...)`; añadir la clave a `en.json`.
