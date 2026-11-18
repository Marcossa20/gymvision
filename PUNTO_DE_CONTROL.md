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

## Pendiente (mi parte), por orden
1. **Probar en el iPhone** (resolver el aviso de inicio de sesión) y corregir lo que falle.
2. ~~Abrir PR~~ **abierto: PR #12** (`marcos/entreno-en-curso` → `main`, sin conflictos, cierra #2, #4, #5 y #10). **Falta decidir la mezcla** y avisar a Miguel Ángel.
3. **Revisar los PR de Miguel Ángel** (sin revisar el código): #9 acceso, #3 gimnasio, #6 cardio, #7 rangos, #8 perfil. Orden sugerido: #12 → #9 → #3, #6, #7, #8; esperar conflictos menores en `package.json`/`package-lock.json` (regenerar con `npm install`). Hay que rehacer el development build por `expo-brightness` y `qrcode`. Issue nueva `[para B]` para `deleteAccount()`.
4. Acceso a Ajustes: hoy solo por la ruta `/settings`; cuando B termine Perfil, el engranaje la enlazará.
5. ~~Cuenta y seguridad~~ **hecha** (issue #10): cerrar sesión, cambiar contraseña (reutiliza `requestReset` + `/auth/new-password`) y permisos. Usa `features/settings/authApi.ts`, tolerante al stub; falta `deleteAccount()` en el store de B. Pendiente: Widget/pantalla de bloqueo (nativo; simulado).
6. i18n con `i18next` (es + en; hoy todo está en español y el ajuste de idioma solo guarda la elección).
7. Pantallas sin leer del Figma: Crear ejercicio, Mis rutinas vacío, Resultados Cardio. «Reemplazar», «Tutorial» y «Notas» del entreno solo muestran un aviso de «próximamente».

## Notas y avisos
- `Routine` cambió: ahora `days: number[]` (0 = lunes) en lugar de `day`; los ejercicios pueden llevar `goal` y `target` (cardio). El guardado local tiene migración (versión 1).
- Contratos con B (ver `REPARTO.md` §2): `/workout/machine/<exerciseId>` y `/cardio/run?exerciseId=&goal=&target=`.
- `assets/equipment/cardio.jpg` muestra un torso, no algo de cardio: revisar si se subió mal.
- Modelo: Sonnet 5.5 vale para casi todo; subir a Opus si falla el reordenar con el dedo, las notificaciones o el acelerómetro/NFC (B).
