# GymVision

App móvil de gimnasio (iPhone y Android) pensada para **usarse en mitad del entreno, con las manos sudadas y casi sin mirar la pantalla**. No compite en lógica compleja: compite en **interacción**. Todo funciona **sin conexión**, con los datos guardados en el propio móvil.

Práctica de *Interacción Persona-Ordenador I* (UCLM, 3º Ingeniería Informática) · grupo GPT-7 · Marcos García Alcázar y Miguel Ángel Mota Charco.

## Cómo probarla (5 minutos)

**Necesitas:** [Node.js](https://nodejs.org) (versión LTS), un móvil con la app **Expo Go** (App Store / Google Play) y el PC y el móvil en la **misma red Wi‑Fi**.

```bash
git clone https://github.com/Marcossa20/gymvision.git
cd gymvision
npm install
npx expo start --go
```

1. En la terminal aparece un **código QR**. Escanéalo con la cámara del iPhone, o desde Expo Go en Android. La primera carga tarda unos segundos.
2. Si la terminal pide iniciar sesión, ejecuta `npx expo login` (cuenta gratuita de [expo.dev](https://expo.dev), la misma que en Expo Go) y vuelve a lanzar el paso anterior.
3. Entra con la **cuenta de prueba**: `miguel@correo.com` · contraseña `Gymvision1` (la G en mayúscula). También puedes pulsar «Crear cuenta»: se guarda solo en el móvil.

Sin móvil: `npx expo start --web` abre una versión en el navegador (sin vibración, NFC ni acelerómetro).

### Limitaciones de Expo Go

- **NFC real de la taquilla:** necesita una *development build* (código nativo). En Expo Go la pantalla avisa de que no hay NFC y ofrece **«Simular cerradura»**, que recorre el mismo flujo.
- **Vibración:** solo se siente en un móvil real (no en emuladores ni en web).
- La app arranca con **datos de ejemplo de un mes de uso** (rangos, historial de entrenos, progreso) para poder verla completa. Se pueden quitar en *Perfil → Laboratorio de componentes → «Usar mis datos reales»* (solo en desarrollo).

## Qué mirar en cada reto de La Persona

| Reto | Dónde verlo |
|---|---|
| **1 · Daltonismo** | *Perfil → ⚙ Ajustes → Accesibilidad*: Ninguno / Protanopia / Deuteranopia / Tritanopia. Cambia **al instante y en toda la app** la paleta de rangos, el mapa muscular y las gráficas, y también el color de marca de la interfaz (azul, ámbar o rosa). El color nunca va solo: los rangos llevan nombre e insignia propia. Paletas validadas con simulación de Machado (2009) y ΔE ≥ 20 (ver `CLAUDE.md` §7). |
| **2 · Baja visión y mayores** | Mismo menú: tamaño de texto en 4 niveles, alto contraste (AAA), tema claro/oscuro/sistema. Objetivos táctiles ≥ 48 dp. |
| **3 · Discapacidad auditiva / ruido del gimnasio** | *Ajustes → Notificaciones*: vibración, sonido y aviso visual. Ningún aviso depende solo del sonido: cada evento (serie guardada, fin de descanso, subida de rango, error…) tiene **vibración con patrón propio + aviso visual** y, opcionalmente, sonido. |

## Pantallas principales

- **Rangos:** nivel general, mapa muscular frente/espalda coloreado por rango, rangos por grupo y detalle de cada músculo.
- **Entrenar:** plan del día, rutinas (crear, editar, ordenar arrastrando), entreno en curso con series, descanso integrado y resumen.
- **Mi gimnasio:** QR de acceso al torno (se renueva cada 30 s), taquilla por NFC, escáner de QR de máquinas con código manual como alternativa.
- **Cardio:** en Caminata y Correr el **acelerómetro** detecta los pasos y el cronómetro arranca y se pausa solo.
- **Perfil:** historial de entrenos, progreso (volumen y series por semana, mes, 3 meses, año), detalle de entreno y edición del perfil.
- **Acceso:** cuenta local simulada (iniciar sesión, crear cuenta, recuperar contraseña). No hay servidor: «enviar enlace» es una pantalla de confirmación simulada.

Los componentes que pide la asignatura (háptica, color y contraste, tolerancia a errores, NFC, cámara/QR y acelerómetro) se pueden probar aislados en el **Laboratorio de componentes** (*Perfil → Laboratorio*, solo en desarrollo).

## Cómo está hecha

- **React Native + TypeScript** con **Expo** (SDK 58) y **expo-router**. Estado con Zustand y persistencia local con AsyncStorage.
- Sensores: `expo-camera` (QR), `expo-sensors` (acelerómetro), `react-native-nfc-manager` (NFC), `expo-haptics`.
- Todos los colores y tamaños salen de `src/theme/`, así un único ajuste cambia toda la app.
- Cada módulo clave lleva un comentario `// Teoría: …` que enlaza la decisión de diseño con la teoría de la asignatura.

```
src/
  app/        rutas (expo-router)
  components/ elementos de interfaz reutilizables
  features/   una carpeta por área (workout, routines, settings, gym, cardio, ranks, profile, auth, lab)
  domain/     lógica pura (rangos, pasos)
  services/   háptica, avisos, NFC, QR, acelerómetro, sonidos, notificaciones
  store/      estado persistido
  theme/      tokens, daltonismo, contraste y tamaño de texto
```

Más detalle del diseño y los requisitos en [`CLAUDE.md`](CLAUDE.md); reparto del trabajo en [`REPARTO.md`](REPARTO.md).

## Comandos útiles

```bash
npm run typecheck      # comprobación de tipos
npx expo start --go    # arrancar para Expo Go
```
