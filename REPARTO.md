# Reparto de trabajo (Marcos ↔ Miguel Ángel)

> Lo leen los dos Claude Code **después de `CLAUDE.md`**. Regla de oro: **cada persona solo edita sus carpetas**. Si necesitas algo de una carpeta del otro, no la toques: pídelo (ver §4).

## 1. Quién hace qué

### A · Marcos (+ su Claude) — base, entrenamiento, rutinas y ajustes
| Área | Carpetas / archivos (solo A edita) |
|---|---|
| **Infraestructura compartida** | `src/theme/**`, `src/store/settings.ts`, `src/services/haptics.ts`, `src/services/alerts.ts`, `src/components/**` (ui.tsx, AlertBanner…), `src/i18n/**`, `src/data/seed.ts` |
| **Shell de la app** | `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/entrenar.tsx` |
| **Entrenamiento** (sección 5, salvo cardio) | `src/features/workout/**`, `src/app/workout/**`, `src/store/workout.ts`. Pantallas: Entrenar, Detalle de rutina, Entreno en curso (+ dock de descanso), Pantalla de bloqueo/descanso, Resumen del entreno, Progreso de rango |
| **Rutinas** (sección 7, salvo cardio) | `src/features/routines/**`, `src/app/routines/**`. Mis rutinas (+vacío, menú, eliminar), Crear/Editar rutina, Añadir ejercicio, Grupo muscular, Equipamiento, Crear ejercicio, Configurar ejercicio |
| **Ajustes** (sección 4) | `src/features/settings/**`, `src/app/settings/**`. Ajustes, Cuenta y seguridad, Notificaciones, Unidad de peso, Idioma, **Accesibilidad** (Retos 1, 2 y 3 en vivo) |

### B · Miguel Ángel (+ su Claude) — sensores, mapa/rangos, perfil y acceso
| Área | Carpetas / archivos (solo B edita) |
|---|---|
| **Mi gimnasio** (sección 6) | `src/features/gym/**`, `src/app/gym/**`, `src/app/(tabs)/gimnasio.tsx`, `src/services/nfc.ts`, `src/services/qr.ts`. Mi gimnasio, Escanear máquina (QR), Código manual, Máquina encontrada, Código no válido, Taquilla NFC/abierta (+ botón «Simular cerradura»), Mi QR de acceso (rotativo 30 s) |
| **Cardio con acelerómetro** | `src/features/cardio/**`, `src/app/cardio/**`, `src/services/accelerometer.ts`, `src/domain/steps.ts`, `src/store/cardio.ts`. Cardio en curso, Cardio resumen |
| **Rangos y mapa muscular** (sección 2) | `src/features/ranks/**`, `src/app/ranks/**`, `src/app/(tabs)/rangos.tsx`, `src/domain/ranks.ts`. Rangos, Brazos/Espalda/Piernas desplegado, Detalle de músculo, mapa SVG frente/espalda |
| **Perfil** (sección 3) | `src/features/profile/**`, `src/app/profile/**`, `src/app/(tabs)/perfil.tsx`, `src/store/profile.ts`. Perfil, Progreso (2 gráficas), Detalle de entreno, Editar perfil |
| **Acceso local** (sección 1) | `src/features/auth/**`, `src/app/auth/**`, `src/store/auth.ts`. Iniciar sesión, Crear cuenta, Recuperar, Correo enviado, Nueva contraseña (cuenta simulada en el móvil) |
| **Laboratorio de componentes** | `src/features/lab/**`, `src/app/lab.tsx` (solo dev): prueba háptica, QR, NFC y acelerómetro en móvil real |

**Orden recomendado para B** (lo que más pesa en la asignatura primero): Laboratorio → Mi gimnasio (QR + NFC) → Cardio → Rangos/mapa → Perfil → Acceso.
**Orden de A:** shell + accesibilidad (Ajustes) → Entrenar → Entreno en curso → Resumen/Progreso de rango → Rutinas → resto de Ajustes.

## 2. Contratos entre los dos (no cambiar sin avisar)

1. **Máquina → ejercicio.** Tras leer un QR o código manual, B busca el ejercicio con `exerciseByCode(code)` (`src/data/seed.ts`) y navega a `/workout/machine/<exerciseId>`. A implementa esa ruta (registro de series de ese ejercicio).
2. **Cardio.** A lanza el cardio desde Añadir/Configurar ejercicio y Detalle de rutina con `router.push('/cardio/run?exerciseId=<id>&goal=time|steps|distance&target=<número>')`. B implementa `/cardio/run` y `/cardio/summary`. El registro lo guarda B en `src/store/cardio.ts`; A no lo toca.
3. **Rangos.** B es dueño de `src/domain/ranks.ts`. Firmas congeladas: `rankFromPoints(points): Rank` y `pointsFor(weight, reps, bodyWeight?)`. B solo **lee** `useWorkout.getState().points` (puntos por ejercicio) y `useWorkout.getState().history`; nunca los escribe. A solo llama a esas dos funciones desde `store/workout.ts`.
4. **Ajustes y tema.** B solo **consume** `useSettings`, `useTheme()`, `useRankColors()`, `notify(kind, msg)` y las funciones de `haptics.ts`. No los modifica. Si B necesita un aviso o háptico nuevo → pedirlo a A.
5. **Sesión.** `src/app/_layout.tsx` (A) lee `useAuth().loggedIn` y redirige a `/auth/login` si es `false`. B es dueño de `src/store/auth.ts`; arranca con un stub que devuelve `loggedIn: true` hasta que B tenga el login.
6. **Tabs.** A es dueño del layout de pestañas; B es dueño del contenido de `rangos.tsx`, `gimnasio.tsx` y `perfil.tsx` (A los crea como stub vacío una sola vez).

## 3. Archivos compartidos con regla propia

| Archivo | Regla |
|---|---|
| `package.json` / `package-lock.json` | Añadir dependencias en un commit aparte y pequeño, y avisar. El otro hace `git pull` + `npm install`. Si hay conflicto en `package-lock.json`: aceptar el de `main` y volver a lanzar `npm install`. |
| `app.json` | Lo edita **B** (permisos NFC/cámara y plugins). A pide cambios a B. |
| `CLAUDE.md`, `REPARTO.md` | Solo con acuerdo de los dos. |
| `assets/**` | Cada uno añade archivos nuevos en su carpeta (`assets/muscles` y `assets/ranks` → B; `assets/equipment` y `assets/brand` → A). No renombrar ni borrar los del otro. |
| Figma | Solo lectura desde Claude Code (`get_design_context`, `get_screenshot`). Releer el nodo antes de implementar una pantalla. |

## 4. Cómo pedir algo al otro
Un issue de GitHub (`gh issue create`) con el prefijo `[para A]` o `[para B]`, o un mensaje directo. Mientras tanto, usa un stub local **dentro de tu propia carpeta** y no esperes bloqueado.
Ejemplo: B necesita un componente compartido nuevo → lo crea en `src/features/<suyo>/components/` y, si merece ser común, abre un issue `[para A] mover X a components/`.

## 5. Flujo de git (para que no haya conflictos)
- Ramas por persona y tema: `marcos/entreno-en-curso`, `miguel/qr-scanner`… Nada de commits directos a `main`.
- Commits pequeños; antes de empezar: `git pull --rebase origin main`; al acabar un bloque: Pull Request a `main`; el otro lo revisa y se mezcla.
- Antes de cada PR: `npm run typecheck` debe pasar.
- Cada módulo clave lleva su `// Teoría: …` (ver `CLAUDE.md` §9).
- **Consejo:** cada uno clona el repo **fuera de OneDrive** (p. ej. `C:\dev\gymvision`); `node_modules` dentro de OneDrive sincroniza miles de archivos y da problemas.

## 6. Prompt de arranque para el Claude de Miguel Ángel
> Lee `CLAUDE.md` y `REPARTO.md` completos. Eres el **B**. Solo puedes editar las carpetas de B del §1. Empieza por el Laboratorio de componentes (háptica, QR, NFC, acelerómetro) y luego Mi gimnasio, siguiendo el orden del §1 y los contratos del §2. Trabaja en una rama `miguel/<tema>` y abre PR a `main`.
