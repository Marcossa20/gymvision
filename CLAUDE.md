# GymVision — Contexto para Claude Code

> Este archivo es la fuente de verdad para desarrollar la app. Léelo entero antes de escribir código.
> El diseño vive en Figma (ver §3) y se conecta por MCP. **Ante cualquier duda visual, el Figma manda; ante cualquier duda funcional, manda este archivo.**

---

## 1. Qué es GymVision

App móvil de gimnasio (Android + iOS) pensada para **usarse en mitad del entreno, con las manos sudadas y casi sin mirar la pantalla**. No compite en IA ni en lógica compleja (la referencia, Symmetry, sí): compite en **interacción**.

Contexto académico: práctica de *Interacción Persona-Ordenador I* (UCLM, 3º Ing. Informática), grupo GPT-7, 2 alumnos (Marcos García Alcázar y Miguel Ángel Mota Charco). Es una asignatura de **diseño**: se valora que cada decisión de UI se pueda justificar con teoría (La Persona, El Ordenador, La Interacción). **Cuando implementes algo, deja claro en un comentario o en el README qué punto de teoría aplica** (ver §9).

Idioma de la app y del código-comentarios: **español** (identificadores de código en inglés). Idiomas de la UI previstos: Español (por defecto), English, Français, Deutsch, Italiano, Português.

### Alcance
- Lo importante es el **frontend e interacción**. El backend es irrelevante: **sin servidor, datos guardados en el propio móvil, funcionamiento 100 % offline** (RNF5).
- Descartado (no implementar): realidad virtual/aumentada, escaneo corporal con IA, recomendaciones con lógica compleja, importar rutinas por QR, reconocimiento de voz (ruido), conteo de repeticiones con acelerómetro (poco fiable), sensor de luz ambiental, smartwatch, **funciones sociales** (no existen; no hay apartado "Social" en notificaciones).
- Login/registro/recuperar contraseña aparecen en Figma (sección "1 · Acceso"). Como no hay servidor, **impleméntalos como cuenta local simulada** (credenciales guardadas en el dispositivo, "enviar enlace" = pantalla de confirmación simulada). No montes backend.

---

## 2. Requisitos

### Funcionales
**Planificación (antes de entrenar)**
- **RF1 Crear y organizar rutinas**: elegir ejercicios de un catálogo y ordenarlos arrastrando. Al elegir un ejercicio se muestra el rango del usuario en él o «sin rango». Editables siempre.
- **RF2 Series y descanso**: por ejercicio, series, reps, peso y descanso; modificables con los mismos gestos de deslizar que en el entreno.

**Ejecución (durante el entreno)**
- **RF3 Taquilla (NFC)**: abrir la taquilla acercando el móvil a la cerradura NFC. Sin llave ni candado.
- **RF4 Acceso a la máquina (QR)**: cada máquina tiene un QR; se escanea con la cámara dentro de la app y se abre el ejercicio con técnica y series anteriores. Alternativa: **código manual** (ej. `PB-0142`) si el QR está dañado.
- **RF5 Registro rápido de series**: botones grandes; peso ajustable deslizando arriba/abajo (no teclear); serie marcada con un toque; se pueden modificar series previstas, añadir/quitar; borrar deslizando hacia un lado **con deshacer**; vibración breve al guardar.
- **RF6 Descanso guiado**: al registrar una serie arranca el temporizador automáticamente; se ve **integrado en la pantalla de entreno** (dock de controles: −15 s, +15 s, Saltar), en widget y en pantalla de bloqueo. **No existe pantalla de descanso dedicada.** Al acabar: vibración con patrón propio + notificación con acciones («Empezar serie», «+30 s»/«+15 s»).
- **RF7 Cardio con acelerómetro**: en cardio (caminata…) el acelerómetro detecta que el usuario anda; el cronómetro arranca/pausa solo; se registran duración y pasos; vibración breve al empezar/terminar.

**Progreso (al terminar)**
- **RF8 Progreso y gamificación**: mapa de calor muscular (frente/espalda) coloreado por rango; al tocar un músculo se ven sus datos; rangos por músculo/ejercicio con barra hacia el siguiente y animación + vibración al subir.

### No funcionales
- **RNF1 Usabilidad en el entreno**: botones grandes (≥ 48 px / 48 dp), una acción principal por pantalla, confirmación de cada acción con vibración.
- **RNF2 Accesibilidad**: paleta apta para daltonismo (**el color nunca va solo**: icono/forma/texto), alto contraste, tamaño de texto ajustable, modo claro y oscuro en toda la app.
- **RNF3 Tolerancia a errores**: todo lo que borra/cambia datos es deshacible o pide confirmación; feedback inmediato.
- **RNF4 Compatibilidad**: Android e iOS (NFC, cámara, acelerómetro).
- **RNF5 Rendimiento/disponibilidad**: respuesta inmediata y **offline**, datos locales.

### Los 6 componentes que pide el profesor (deben funcionar de verdad)
| # | Componente | Bloque | Dónde |
|---|---|---|---|
| 1 | **Háptica** (patrones distintos) | La Persona | Serie guardada, fin de descanso, subida de rango, inicio/fin cardio, error |
| 2 | **Color y contraste / ceguera al color** | La Persona | Modos de daltonismo, alto contraste, tema |
| 3 | **Razonamiento: errores y confirmación** | La Persona | Deshacer, confirmaciones, una cosa por pantalla |
| 4 | **NFC** | El Ordenador | Taquilla |
| 5 | **Cámara (QR)** | El Ordenador | Escanear máquina |
| 6 | **Acelerómetro** | El Ordenador | Cardio (pasos) |

### Patrones de vibración (a definir en un único módulo `haptics`)
| Evento | Patrón sugerido |
|---|---|
| Serie guardada | 1 pulso corto (~40 ms) |
| Fin de descanso | 3 pulsos medios (reconocible) |
| Subida de rango | patrón creciente (corto-corto-largo) |
| Inicio/fin cardio | 2 pulsos cortos |
| Error / acción no válida | 1 pulso largo (~300 ms) |
| Código QR leído | 1 pulso corto |
Centraliza todo en `src/services/haptics.ts` con funciones nombradas (`hapticSerieGuardada()`…) para poder cambiar patrones en un solo sitio. Respeta el ajuste Notificaciones → Vibración (on/off).

---

## 3. Figma (fuente del diseño)

- **Archivo:** `GymVision – Prototipo (Copia)` · **fileKey `zqieR4xjmyAOefeSPbXP4c`** · página `Page 1` (id `0:1`).
  URL: `https://www.figma.com/design/zqieR4xjmyAOefeSPbXP4c/GymVision-%E2%80%93-Prototipo--Copia-`
- Segunda página `Músculos · reserva` (id `2051:135`): imágenes de músculos y de cardio (ver §6).
- Cada pantalla es un frame **390 × 844** (algunas más altas: scroll). Nombre de frame = `GymVision · <Pantalla>`.
- Flujo recomendado con el MCP de Figma:
  1. `create_session` con el fileKey.
  2. Skill `figma-design-to-code` antes de `get_design_context`.
  3. `get_design_context(nodeId)` **por pantalla** (no por sección entera) y adaptar a los componentes del proyecto, no copiar el código tal cual.
  4. `get_screenshot(nodeId)` para comparar visualmente al terminar.
- Los frames están hechos con auto-layout; respeta paddings/espaciados del Figma.
- El compañero de equipo edita el Figma a la vez: **antes de implementar una pantalla, vuelve a leer su nodo** (los ids pueden ser nuevos).

### Inventario de pantallas (sección → frame → id)

**1 · Acceso** (`2023:102`) — Iniciar sesión `2023:2` · Crear cuenta `2023:44` · Recuperar contraseña `2063:183` · Correo enviado `2063:211` · Nueva contraseña `2073:33`

**2 · Rangos** (`2016:2`) — Rangos `2:2` · Brazos desplegado `2018:2` · Espalda desplegado `2018:359` · Piernas desplegado `2018:538` · Detalle de músculo `2063:231`

**3 · Perfil** (`2016:3`) — Perfil `2009:2` · Progreso (volumen · semana) `2010:2` · Progreso (series · mes) `2010:224` · Detalle de entreno `2012:2` · Editar perfil `2015:2`

**4 · Ajustes** (`2035:2`) — Ajustes `2032:2` · Cuenta y seguridad `2035:3` · Notificaciones `2035:163` · Unidad de peso `2035:325` · Idioma `2035:433` · Accesibilidad (oscuro) `2006:2` · Accesibilidad (claro + alto contraste) `2006:152` · más 3 variantes "Visto con Protanopia/Deuteranopia/Tritanopia (claro)" (**son simulaciones para el informe, NO son pantallas de la app**; ver §7)

**5 · Entrenamiento** (`2037:570`) — Entrenar (home) `2037:2` · Detalle de rutina `2037:100` · Entreno en curso `2037:385` · Entreno en curso – descansando `2060:2` · Pantalla de bloqueo · descanso `2060:172` · Resumen del entreno `2060:219` · Progreso de rango `2060:292` · Mis rutinas `2033:3` · Mis rutinas · vacío `2063:314` · Mis rutinas – menú `2063:388` · Eliminar rutina – confirmar `2063:516` · Cardio · En curso `2063:88` · Cardio · Resumen `2063:133`

**6 · Mi gimnasio** (`2046:275`) — Mi gimnasio `2046:2` · Escanear máquina `2046:145` · Taquilla NFC `2046:206` · Taquilla abierta `2046:242` · Código manual `2047:2` · Máquina encontrada `2048:2` · Mi QR de acceso (torno) `2049:29` · Código no válido `2063:360`

**7 · Crear Rutinas** (`2050:367`) — Crear entrenamiento `2050:2` · Configurar ejercicio `2050:292` · Añadir ejercicio `2055:2` · Grupo muscular `2055:89` · Equipamiento `2055:267` · Crear ejercicio `2055:426` · Editar rutina `2063:627` · Añadir ejercicio – Resultados Cardio `2071:2` · Configurar ejercicio – Cardio (tiempo `2069:320` / pasos `2082:113` / distancia `2082:162`)

### Navegación
- **Barra inferior (4 pestañas):** `Rangos` · `Entrenar` · `Mi gimnasio` · `Perfil`. (La pestaña inicial tras login es **Entrenar**.)
- Cabecera de las pestañas principales: marca "GymVision" + racha 🔥.
- **Perfil → Ajustes** (engranaje) → subpantallas: Cuenta y seguridad, Notificaciones, Unidad de peso, Idioma, Accesibilidad, Añadir widget a inicio. *(Se eliminaron los ajustes que no aplican; no añadas otros.)*
- **Entrenar** → plan del día (Detalle de rutina) → Entreno en curso → Resumen → Progreso de rango. También "Mis rutinas" → Crear/Editar rutina → Añadir ejercicio (filtros Músculos / Equipamiento / Cardio) → Configurar ejercicio.
- **Mi gimnasio** → Mostrar mi QR (torno) · Taquilla (NFC) · Escanear máquina (QR) → Máquina encontrada → abre el ejercicio; Código manual como alternativa; "Código no válido" como error.
- Entrenar y Mi gimnasio comparten el flujo: escanear máquina lleva al registro de series de ese ejercicio.

---

## 4. Sistema de diseño (tokens)

Tema **oscuro por defecto**; hay tema claro y variante alto contraste. Define estos valores como tokens de tema (no los repitas sueltos por el código).

| Token | Oscuro | Claro |
|---|---|---|
| `bg` | `#0B0B0D` | `#F4F4F6` |
| `card` | `#18181C` (≈ rgb 24,24,28) | blanco / gris muy claro |
| `brand` (turquesa) | `#30E2CA` | `#0B7A6D` (versión oscura con contraste) |
| `textPrimary` | `#FFFFFF` | `#0B0B0D` |
| `textSecondary` | `#999CA8` | gris medio |
| `divider` | `#292930` | gris claro |
| `switchOff` | `#33333B` | — |
| `radioOff` | `#6B6E7A` | `#33353D` |

- **Tipografía:** Inter (Regular / Medium / Semi Bold / Bold). Tamaños reales: lee los del Figma.
- **Radios:** tarjetas 16; botones/chips según Figma.
- **Iconos:** estilo Lucide (trazo 2, extremos redondeados). Usa `lucide-react-native`.
- **Filas de ajustes:** altura mínima 56, icono 22 turquesa, texto, valor opcional, chevron 18 gris.
- **Interruptores:** cuando están ON muestran un **check** dentro del pomo (no solo color). Radios: seleccionado = círculo relleno interior + texto en negrita.
- **Botones primarios:** relleno turquesa; texto oscuro. Altura ≥ 48.
- Alto contraste: bordes negros/definidos, interruptor ON en turquesa oscuro.

---

## 5. Dominio y datos

### Rangos
Escala (de menor a mayor): **Bronce → Plata → Oro → Rubí → Esmeralda → Diamante**, cada uno con **niveles I, II, III** (ej. «Oro III», «Esmeralda I», «Diamante III»). Cada rango tiene **icono/forma propia** (el color nunca va solo).
- Hay **rango por ejercicio** y **rango por músculo**, más un **nivel general** (Perfil/Rangos: «Oro III · 72 % hacia Rubí»).
- Cardio tiene su propio rango («Suma a tu rango de Cardio · Plata II · +120 puntos»).
- Los rangos usan sobrecarga progresiva (peso × reps) y **dependen de sexo y altura** (se piden en Editar perfil: «Se usan para calcular tus rangos. Se guardan solo en tu móvil»).
- **No hay un algoritmo oficial definido.** Impleméntalo como función pura y aislada (`src/domain/ranks.ts`) con umbrales en una tabla de configuración, para poder ajustarlo; empieza simple (p. ej. 1RM estimado / peso corporal-ish por umbrales) y deja el TODO documentado. Es lo menos importante de la práctica.

### Entidades (guardar en local: SQLite o MMKV/AsyncStorage)
- `User` (nombre, usuario, correo, sexo, altura, foto) · `Settings` (tema, modo daltonismo, alto contraste, tamaño de texto, unidad kg/lb, idioma, vibración, sonido, recordatorios)
- `Exercise` (id, nombre, músculos principales/secundarios, equipamiento, tipo: fuerza|cardio, técnica/animación, código QR de máquina p.ej. `PB-0142`)
- `Routine` (nombre, días asignados, ejercicios ordenados) · `RoutineExercise` (series, reps, peso, descanso s, notas) · en cardio el objetivo es **solo uno**: tiempo | pasos | distancia
- `Workout` (fecha, rutina, duración, volumen, series) · `SetLog` (ejercicio, peso, reps, hecho) · `PRs` (récords)
- `Rank` por ejercicio/músculo/general · `Locker` (nº, estado cerrada/abierta) · `Membership` (nº socio, gimnasio, QR rotativo que se renueva cada 30 s — simulado)
- Datos semilla: catálogo de ejercicios con los de las pantallas (Press de banca inclinado (mancuerna), Jalón al pecho agarre prono (máquina), Aperturas de pecho en Pec Deck (máquina), Elevaciones laterales en polea baja…), rutinas de ejemplo (Torso, Pierna, Espalda y bíceps, Hombros y brazos), máquinas con códigos QR/manuales.

### Músculos (mapa muscular y filtros)
Frente: pecho, hombros, bíceps, antebrazos, abdominales, cuádriceps, aductores, abductores, cuello, trapecio. Espalda: dorsales, tríceps, trapecio, lumbar, glúteos, femoral, gemelos (+ «espalda» como grupo). Más **Cardio**.
Equipamiento (filtro): cardio, sin equipamiento, calistenia, barra, mancuerna, máquina, polea, banda elástica.
Cardio disponible: Caminata, Correr, Bicicleta, Elíptica, Remo, (+ Cinta, Comba, Escaladora si se añaden).
Solo **Caminata y Correr** usan *pasos* (acelerómetro); el resto: tiempo o distancia.

### Unidades
kg (por defecto) / lb. Decimales con coma en español (27,5 kg). Formato de fechas en español («viernes 16 de octubre»).

---

## 6. Assets

- **Imágenes de músculos** (siluetas grises con el músculo iluminado en azul claro) y **de cardio**: están en Figma, página `Músculos · reserva`, y en las miniaturas de los filtros. Expórtalas desde Figma (`get_design_context` / exportar nodos) a `assets/muscles/*.png` y `assets/equipment/*.png`; **no las regeneres**.
- Los iconos de rango son imágenes dentro de Figma (`rankimg`): exporta cada rango.
- Mapa corporal interactivo (Rangos): frente/espalda con regiones táctiles por músculo; implementar con SVG (`react-native-svg`) coloreando por rango + **icono/cifra de apoyo** (no solo color).

---

## 7. Accesibilidad — daltonismo (reglas de implementación)

Ajustes → Accesibilidad → «Modo daltonismo: adapta los colores de rangos y gráficas»: **Ninguno / Protanopia / Deuteranopia / Tritanopia**. **Cambia la paleta de los datos (rangos, mapa de calor, gráficas) y también el color de marca de la interfaz** (turquesa → azul en Protanopia, ámbar en Deuteranopia, rosa en Tritanopia; ver `brandByMode` en `src/theme/tokens.ts`, contraste ≥ 5,4:1). Decisión del equipo (nov 2026): antes solo cambiaba la paleta de datos.

Paletas de rangos (Bronce, Plata, Oro, Rubí, Esmeralda, Diamante) — **versión v2, validada con test de distancia de color**:
- **Ninguno:** `#9B6A39 #B2B8C2 #E4A826 #D23A4E #1FA85C #2E7CE0`
- **Protanopia:** `#A6761D #D7D7D8 #F0E442 #C0557B #76B0F9 #004297`
- **Deuteranopia:** `#876C1B #D0D8E2 #E69F00 #C44672 #56B4E9 #034795`
- **Tritanopia:** `#6F5A20 #D6D9DB #AD5604 #E23800 #009E73 #E59CC6`

Test (paso 4 del reto 1): simulación de Machado (2009, severidad 1.0, RGB lineal) + distancia ΔE CIE76; criterio: **mínimo ΔE entre las 6 parejas ≥ 20**. Resultados:

| Modo | Paleta original | Paleta adaptada v2 |
|---|---|---|
| Protanopia | 17,1 ✕ | 40,9 ✓ |
| Deuteranopia | 6,0 ✕ | 36,5 ✓ |
| Tritanopia | 20,5 ✓ (justo) | 36,9 ✓ |

(La v1, basada directamente en Okabe-Ito, empeoraba en Tritanopia: 14,8. Por eso se reajustó.) Implementa `useRankColors()` que lea el ajuste. Si se cambia una paleta, repite el test (`node scripts/test-daltonismo.js`, lee las paletas de `src/theme/tokens.ts`) antes de darla por buena. Los números de la tabla son los que da ese script y los mismos que cita la memoria de la Entrega 2.

Las pantallas "Visto con … (claro)" del Figma son **simulaciones de visión** para el informe; **no se implementan**.

Reglas generales: color nunca solo · contraste AA mínimo (AAA en alto contraste) · `accessibilityLabel`/roles en todo · tamaño de texto escalable (respetar el del sistema + ajuste propio) · objetivos táctiles ≥ 48 dp · tema claro/oscuro/sistema.

---

## 8. Stack y estructura

**Decisión tomada (informe, apartado Tecnología): React Native con TypeScript, Android e iOS, datos locales, sin servidor.**

Propuesta (ajusta si hay motivo):
- **Expo (SDK actual) con *development build*** — NFC requiere código nativo, no funciona en Expo Go.
- Navegación: `expo-router` o React Navigation (tabs inferiores + stacks).
- Estado: Zustand (o Context) + persistencia local (SQLite `expo-sqlite` / MMKV).
- Háptica: `expo-haptics` (patrones simples) y, si hace falta patrón fino, `react-native` `Vibration` (Android).
- Cámara/QR: `expo-camera` (`CameraView` con `onBarcodeScanned`).
- Acelerómetro: `expo-sensors` (`Accelerometer`) + detector de pasos propio (umbral de picos con filtro paso bajo; ~1.2–2.5 Hz).
- NFC: `react-native-nfc-manager`. **Plan B obligatorio**: botón "Simular cerradura" en dev, porque se prueba en móvil real y la cerradura es una etiqueta NFC.
- Notificaciones con acciones: `expo-notifications` (categorías con acciones) · temporizador en segundo plano.
- Widget y pantalla de bloqueo: **Live Activities (iOS) / notificación persistente (Android)** — requieren módulos nativos; déjalo para una fase final y simúlalo mientras tanto.
- Animaciones: `react-native-reanimated` + `react-native-gesture-handler` (deslizar peso, arrastrar para ordenar, deslizar para borrar).
- Iconos: `lucide-react-native` · SVG: `react-native-svg` · Fuente: Inter (`@expo-google-fonts/inter`).
- i18n: `i18next` (6 idiomas; empieza con es + en).

Estructura sugerida:
```
src/
  app/ (rutas)          components/ (ui reutilizable: Button, Card, Row, Toggle, Radio, Stepper, BottomTabs…)
  features/ {auth, routines, workout, cardio, gym, ranks, profile, settings}
  domain/ (ranks.ts, volume.ts, steps.ts)   services/ (haptics.ts, nfc.ts, qr.ts, accelerometer.ts, notifications.ts, storage.ts)
  theme/ (tokens, useTheme, useRankColors)  i18n/   data/ (seed)
assets/ (muscles, equipment, ranks)
```

---

## 9. Reglas de trabajo para Claude Code

1. **Una pantalla cada vez**, de Figma a código, empezando por el *camino crítico*: Entrenar → Entreno en curso (con dock de descanso) → Resumen → Progreso de rango. Luego Mi gimnasio (QR, NFC), Cardio, Rutinas, Rangos/Perfil, Ajustes, Acceso.
2. Construye **primero una pantalla "Laboratorio de componentes"** (dev only) que pruebe háptica, QR, NFC y acelerómetro. Son el requisito de la práctica: deben funcionar en un móvil real antes de pulir UI.
3. Componentes reutilizables antes que copiar estilos; todos los colores/medidas desde `theme/`.
4. **Cada feature con confirmación háptica** del §2 y **deshacer** donde borre/cambie datos (snackbar «Deshacer»).
5. Texto de UI exactamente como en Figma (español). No inventes pantallas ni ajustes que no estén; si falta algo, pregunta o anótalo en `TODO.md`.
6. Todo debe funcionar **sin conexión**; no añadas llamadas de red.
7. Prueba en dispositivo real (NFC y vibración no se pueden probar en simulador). Documenta en el README cómo ejecutar la *development build*.
8. Cada módulo clave lleva un comentario `// Teoría: <punto>` (ej. «háptica = feedback sin mirar», «QR = menos carga de memoria», «deshacer = tolerancia a errores», «Gestalt: agrupación en tarjetas», «consistencia: el mapa corporal es el mismo en Rangos y Planificador»). Sirve para la exposición.
9. Commits pequeños y descriptivos; no subas claves ni datos personales.

### Entregas de la asignatura (condicionan el orden)
- **Entrega 2 · La Persona (PDF, la más cercana):** informe sobre la adaptación de las interfaces a 3 retos de colectivos con necesidades especiales (daltonismo, baja visión/mayores, discapacidad auditiva o motricidad; por confirmar), con alternativas de diseño justificadas. **El código es opcional** (zip o enlace a GitHub; si el repo es privado, dar acceso al profesorado). Lo que se implemente debe **servir de prueba de esas adaptaciones**: por eso la prioridad es la infraestructura de accesibilidad y háptica, no cubrir todas las pantallas.
- Después vendrán las entregas de El Ordenador (sensores: NFC, QR, acelerómetro) y La Interacción.
- Regla: implementar todo lo posible, pero **terminar bien y poder demostrar** lo que toca a La Persona antes de ampliar.

### Los 3 retos de La Persona (Entrega 2) — qué debe existir en la app
Cada reto sigue 5 pasos: (1) identificar problema, (2) describirlo (simulación de cómo lo ve la persona), (3) describir la solución, (4) diseñarla (volver a simular con la solución y comprobar que se supera), (5) **implementar con estilos intercambiables en la app**. La implementación pesa un 40 % de cada reto: debe ser visible y demostrable en vivo (Ajustes → Accesibilidad).

| Reto | Colectivo (Tema 2) | Implementación en la app (ajuste intercambiable) |
|---|---|---|
| 1 | **Daltonismo** (La Vista) | Modo Ninguno / Protanopia / Deuteranopia / Tritanopia → cambia la paleta de rangos, mapa muscular y gráficas (§7). Forma/icono/número siempre además del color. |
| 2 | **Baja visión y personas mayores** (La Vista) | Tamaño de texto ajustable (p. ej. 4 niveles + respeta el del sistema), alto contraste, tema claro/oscuro. Objetivos táctiles grandes, sin información solo en gris claro. Todo el layout debe aguantar texto grande sin cortarse. |
| 3 | **Discapacidad auditiva / ruido del gimnasio** (El Oído) | Ningún aviso depende solo del sonido: cada evento (fin de descanso, serie guardada, subida de rango, error) tiene **vibración + señal visual** (banner/animación/icono) y, opcional, sonido. Ajuste Notificaciones → Vibración / Sonido / Aviso visual. |

Requisito transversal: todos los ajustes se aplican **al instante y en toda la app** (contexto de tema global), sin reiniciar.

### Fases propuestas (en orden de prioridad)
1. Proyecto Expo + tema (oscuro/claro) + navegación + datos semilla.
2. **Accesibilidad como infraestructura** (Entrega 2): tokens de tema, alto contraste, tamaño de texto ajustable, modos de daltonismo (`useRankColors`), pantalla Ajustes → Accesibilidad funcional que cambie toda la app en vivo.
3. **Háptica** (`services/haptics.ts`) con todos los patrones y el ajuste Vibración on/off, más equivalentes visuales de cada aviso (por si no se oye ni se siente).
4. Laboratorio de componentes (háptica, QR, NFC, acelerómetro) probado en móvil real.
5. Entrenar → Entreno en curso (series, deslizar peso, deshacer, descanso integrado) → Resumen → Progreso de rango.
6. Rangos + mapa muscular + Perfil/estadísticas (ya con paletas de daltonismo).
7. Mi gimnasio (QR de máquina, código manual, taquilla NFC, QR de torno).
8. Cardio con acelerómetro.
9. Rutinas (crear/editar/arrastrar, filtros músculos/equipo/cardio).
10. Ajustes restantes (cuenta, notificaciones, unidad, idioma) y acceso/login local.
11. Notificaciones con acciones, widget/pantalla de bloqueo.
12. Pulido, lector de pantalla, pruebas en Android e iOS.

---

## 10. Aspectos ambiguos (decididos por defecto; confirmar con el equipo)
- **NFC está en la taquilla, no en las máquinas** (versión final del informe). Las máquinas se abren con QR (+ código manual). Documentos antiguos mencionan NFC en máquinas: ignóralos.
- **Auth local simulada** aunque el informe diga "sin servidor".
- **Algoritmo de rangos** sin especificar: ver §5.
- **Widget / pantalla de bloqueo**: requieren código nativo; plan simulado primero.
- Marcos y Miguel Ángel editan el Figma en paralelo; los ids de este archivo pueden quedar obsoletos: busca por nombre de frame si un id falla.
