# El camino de una Precursora

Prototipo de aventura 2D en Expo SDK 54, React Native, TypeScript, Expo Router y Skia. Web, Android e iOS comparten lógica de movimiento, colisiones y misiones.

## Ejecutar

Se recomienda Node 22 LTS o Node 24. En el entorno preparado se utilizó Node 24.22.1.

```bash
cd Juego
npm ci
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run web -- --port 8082
```

Para móvil: `npm start` y un cliente compatible con Expo SDK 54 o una compilación de desarrollo. No hay cuentas ni servidor de aplicación. La ejecución nativa en dispositivos no está validada todavía.

```bash
npm run typecheck
npm test
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run build:web
```

`postinstall` copia CanvasKit desde la dependencia instalada a un archivo público con su versión, actualmente `public/canvaskit-0.40.0.wasm`; el cargador obtiene la misma versión de la dependencia, evitando mezclar JavaScript con WASM antiguo en caché. Web no necesita descargar WASM desde un CDN. El archivo se sirve junto a la aplicación.

## Qué incluye

- Menú con amanecer pixel art detallado, protagonista original y controles React Native funcionales que escalan junto a la pantalla.
- Bosque lateral continuo, cámara suave, gravedad, suelo, plataformas, obstáculos y dos barreras de niebla.
- Seis misiones: guía, tres luces, dos faroles, viajero, orden de palabras y cofre de la Fe.
- Diario de siete capítulos. El segundo se desbloquea al terminar el bosque, pero su escenario aún no está implementado. Los capítulos posteriores permanecen cerrados.
- Inventario, pausa, ajustes visuales, controles táctiles y teclado.
- AsyncStorage para autoguardado y restauración. En web también permite descargar e importar JSON, con validación antes de reemplazar una partida.
- Repetición del bosque conservando la Fe y los capítulos ya obtenidos.

Controles: A/D o flechas para caminar, Espacio para saltar, E para interactuar y avanzar conversaciones, Esc para pausa, I para inventario. En móvil se utilizan los botones en pantalla.

## Organización

- `app/`: navegación Expo Router y coordinación de pantallas.
- `components/`: renderizado Skia y arranque CanvasKit exclusivo de web.
- `game/engine/`: simulación mutable a pasos de 1/120 s; React no recibe una actualización por fotograma. Los valores compartidos actualizan el renderizado.
- `game/levels/`: geometría, objetos y capítulos.
- `game/missions/`: objetivos y recolección con prerrequisitos.
- `game/dialogues/`: contenido narrativo independiente.
- `game/inventory/`: definición de herramientas.
- `game/save/`: esquema validado, persistencia y transferencia por plataforma.
- `manifest.json`: fuente de dimensiones/FPS de los recursos originales.
- `tests/`: físicas, bloqueos, misiones, guardado y verificación de dimensiones PNG.

## Estado artístico y pendientes

El arte original del repositorio es un paquete provisional generado a partir de una hoja conceptual; se conserva intacto. Las dimensiones de todas las láminas y cuadros se verifican frente al manifiesto. Esto no certifica la continuidad visual de cada animación.

Los fondos y los personajes secundarios son ilustraciones pixel art creadas con asistencia generativa y se encuentran en `assets/backgrounds` y `assets/characters`. La protagonista conserva sus recursos originales. Skia combina esos fondos con geometría jugable, objetos, partículas y sprites animados; el menú y las conversaciones mantienen controles React Native reales. La interfaz usa un lienzo de referencia de 960×540 que escala completo, mientras que la simulación conserva 480×270. Falta revisión artística de continuidad entre fondos y poses, animaciones de caída/aterrizaje y transiciones ambientales. Se incluyen música ambiental y efectos originales sintetizados con `scripts/generate-audio.py`, con controles de volumen reales. Las secuencias de conversación, cofre, recepción y celebración utilizan las láminas del paquete original. El texto de Proverbios 3:5 es una idea adaptada, marcada en el acertijo; debe verificarse antes de publicar.

La duración de 8–12 minutos requiere pruebas con jugadores y ajuste de diseño. No se han desarrollado los capítulos 2–7. El selector comunica esa limitación. La vista lógica es 480×270 con bandas para otras proporciones; falta una auditoría de accesibilidad y áreas seguras en dispositivos físicos.

La publicación del entorno y una compilación nativa distribuible son pasos separados de la exportación web.

## Prueba de navegador opcional

`tests/browser.cjs` recorre las seis misiones y comprueba descarga JSON, recarga, rechazo de una importación inválida e importación válida. Requiere Playwright y Chromium disponibles en la máquina. Servir primero `dist` en el puerto 8081; `GAME_URL`, `PLAYWRIGHT_MODULE` y `CHROMIUM_PATH` permiten seleccionar el servidor y las herramientas instaladas. En el entorno preparado Playwright está en `/opt/codex/cua_node/lib/node_modules/playwright` y Chromium en `/usr/bin/chromium`. Esta prueba no forma parte de `npm test` y no descarga navegadores automáticamente.

`tests/graphics-browser.cjs` verifica recursos gráficos, apertura de diálogos, cambios repetidos de pausa/inventario y escalado en varias ventanas. Puede ejecutarse con las mismas variables de Playwright; por defecto usa el servidor Expo del puerto 8082. Guarda capturas temporales en `/tmp`.
