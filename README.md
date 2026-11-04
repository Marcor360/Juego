# El camino de una Precursora

Aventura 2D en Expo SDK 54, React Native, TypeScript, Expo Router y Skia. El capítulo 1 v3 tiene 16 escenas conectadas en un bosque de 8000 píxeles lógicos, con seis zonas y contenido narrativo separado del motor. El capítulo 2 añade una biblioteca RPG con 16 escenas y NPC ambientales. Web, Android e iOS comparten los motores y el progreso.

## Ejecutar en local

Node 22 LTS o 24 y npm:

```bash
npm ci
npm run web
```

Para móvil, `npm start` y un cliente compatible con Expo SDK 54 o una compilación de desarrollo. No hay cuentas ni servidor de aplicación. La exportación de bundles Android/iOS está comprobada; falta probar el juego en dispositivos físicos.

```bash
npm run typecheck
npm test
npm run build:web
```

El `postinstall` prepara CanvasKit desde la dependencia instalada. Se sirve `public/canvaskit-0.40.0.wasm`, con la misma versión que su JavaScript y sin depender de un CDN.

## Menús que acompañan el viaje

Tres portadas originales cambian con el avance del capítulo: **Amanecer**, **En camino** (tras la escena 8, con pantalón de vestir lavanda y zapatos formales) y **Nuevos horizontes** (tras el epílogo). Incluyen retratos animados, paisajes propios, tarjeta de diario, detalles de olivo y tipografía Cormorant Garamond con licencia OFL. En móvil vertical, los controles se reorganizan para seguir siendo legibles. Ver [diseño del menú](docs/MENU.md).

## Capítulo 1 v3

El [documento de diseño](docs/CHAPTER_1_V3.md) guía esta versión:

- Entrada, arroyo, puente dañado, claro, niebla y refugio, cada zona con fondo original y transiciones suaves.
- Plataformas de roca y madera, apoyos móviles, piedras húmedas, ruta cooperativa, agua, ramas y un puente que obliga a buscar un desvío. Las pistas y los materiales elevados requieren explorar y saltar.
- Tres corazones, invulnerabilidad breve, apoyos seguros y checkpoints. Perder todos los corazones conserva misiones, decisiones y objetos.
- Dieciséis escenas: preparación, guía, señales y testimonios, ayuda con una rama, puente, viajero, aplicación bíblica, reparación de farol, descanso y reflexión, segundo farol, niebla, confianza, entrega del mapa, cofre y epílogo.
- Desafíos de varias etapas, decisiones con evidencias y referencias alternativas aceptadas cuando la explicación es coherente. Las palabras se mezclan, usan la misma capitalización y contienen distractores. Las pistas son opcionales.
- Cuaderno con misiones, mapa, evidencias, materiales y reflexiones; siete luces opcionales que se recogen automáticamente.
- Viajero acompañante, personajes con distintas poses, retratos según el hablante y cofre de madera con cuatro fases de apertura.
- Entrada a la niebla con confirmación del punto de no retorno. La Fe se obtiene en la escena 15 y el capítulo 2 se desbloquea después del epílogo.

El selector tiene siete capítulos. El segundo ya es jugable tras completar el bosque. El capítulo 3 se desbloquea al finalizar la biblioteca; su historia y los capítulos posteriores quedan para futuras entregas.

Controles: **A/D o flechas** para caminar, **Espacio** para saltar, **E** para conversar, **J** para el cuaderno, **I** para inventario y **Esc** para pausa. También hay controles táctiles. La vista lógica es 480×270, horizontal, con bandas seguras para otras proporciones.

## Capítulo 2 — La biblioteca del aprendizaje

Aventura RPG en cuatro direcciones con cámara propia y colisión a la altura de los pies. Incluye **16 escenas en 13 salas**: patio, vestíbulo, catálogo, archivo, investigación, pasillo oscuro, visitantes, laberinto, sala tranquila, archivo superior, acceso a la gran sala, gran sala y balcón.

Los visitantes ambientales pasean, esperan, leen y saludan. Conservan su posición y rutina al salir de una sala o continuar una partida. Los NPC de las misiones tienen identidad y retratos propios. Las estanterías ocultan por profundidad y se atenúan cuando tapan a la protagonista.

- Fuentes y documentos consultables, mecanismos, escaleras y elevadores funcionales.
- Linterna de Fe equipada desde la mochila para explorar el pasillo sin luz.
- Investigación con selección, clasificación, relaciones, orden y reflexión; opciones mezcladas por ID, pistas y guardado parcial.
- Debate principal y preguntas adicionales opcionales sobre fuentes y discernimiento.
- Carritos móviles y paso estrecho temporizado en el archivo superior. Los errores de investigación no quitan corazones.
- Desafío final de **66 tarjetas**, intercambiables mediante arrastre, pulsaciones o Tab/Entrar. Tres tiempos: 10, 6 y 3 minutos. Tablero, semilla, intercambios, avance y tiempo restante se conservan; pausa y segundo plano detienen el reloj.
- Conocimiento se obtiene al resolver el tablero, se guarda permanentemente y desbloquea el capítulo 3. El epílogo continúa en el balcón, con arte original del puente lejano.

Controles del capítulo 2: **WASD/flechas**, **E** interactuar, **M** mapa, **J** cuaderno, **I** herramientas y **Esc** pausa. Cruceta y botones táctiles disponibles. No hay salto en este capítulo.

Ver [diseño completo](docs/CHAPTER_2_MASTER.md), [control editorial](docs/CHAPTER_2_EDITORIAL.md) e [informe técnico y validación](docs/CHAPTER_2_IMPLEMENTATION.md). Las referencias requieren comprobación editorial externa antes de publicar: el entorno bloquea JW.ORG. Las reflexiones son adaptaciones originales, no citas textuales verificadas.

## Guardado

AsyncStorage guarda al completar escenas, recoger pistas/materiales, activar checkpoints, recibir daño y salir al menú. En web se pueden descargar e importar partidas JSON validadas antes de reemplazar el progreso. El archivo contiene versión, checkpoint, posición segura, corazones, misiones, evidencias, decisiones, materiales, reflexiones, inventario, capítulos y ajustes.

Los esquemas 2 y 3 usan la clave estable `precursora-save-v2` para conservar la recuperación existente. Al entrar a la biblioteca, la versión 3 conserva el bosque y añade el capítulo activo, sala, piso, posición, rutinas de NPC, diálogos, investigaciones y tablero. Las partidas v2 siguen siendo válidas y se actualizan al entrar al nuevo capítulo. El importador comprueba también el estado del reloj, las permutaciones y la coherencia de las recompensas. Se conserva el guardado válido anterior en `precursora-save-v2-last-good`. Si la partida reciente está dañada, se intenta recuperar una copia local o la versión anterior. Los candidatos dañados se archivan antes de reemplazarlos, y una lectura o un respaldo fallidos bloquean la sobrescritura. Los avisos se mantienen hasta leerlos; la sesión actual puede descargarse incluso si el almacenamiento falla. Las partidas válidas de la versión anterior se migran desde `precursora-save-v1`, que permanece como respaldo: conservan la Fe y el capítulo 2 obtenidos, pero comienzan las 16 escenas nuevas desde la entrada. Repetir un capítulo no sobrescribe la partida principal hasta terminarlo.

## Arquitectura y arte

- `app/`: navegación y coordinación de interfaz.
- `game/engine/`: simulación mutable, cámara, física y colisiones; pasos de 1/120 s, sin renderizados React completos por fotograma.
- `game/levels/`: zonas, plataformas, objetos y checkpoints.
- `game/missions/`: progresión y requisitos de las 16 escenas.
- `game/chapter1/` y `game/dialogues/`: validación de respuestas y contenido independiente.
- `game/chapter2/`: motor RPG, salas, 16 escenas, preguntas, tablero, música y extensión de campaña.
- `assets/chapter2/`: atlas originales registrados de protagonistas, NPC, visitantes, acciones, retratos, mobiliario, objetos y suelos; fachada y paisaje del balcón.
- `game/questions.ts`: motor de preguntas independiente de la interfaz, con intentos persistentes y respuestas por ID.
- `game/save/`: esquema, migración, persistencia y transferencia por plataforma.
- `components/`: escenarios Skia, atlas animados, retratos e interfaz nativa.
- `assets/backgrounds/v3/`, `assets/characters/v3/` y `assets/props/v3/`: seis fondos, personajes adicionales, terreno, letreros, rama y cofre nuevos. Se conservan las poses v2 de la protagonista, guía y viajero.
- `game/rendering/art.json`: recortes y anclajes de los atlas activos. `scripts/register-art.py` analiza sus límites alfa sin cambiar píxeles; es una herramienta opcional de arte con Python y Pillow.

El arte se creó con asistencia generativa para el proyecto. El audio es original sintetizado. Los textos de los retos son reflexiones adaptadas con referencia, no citas bíblicas literales.

## Pruebas

`npm test` comprueba progresión, requisitos, alternativas coherentes, migración, rechazos de guardado, colisiones, caídas, corazones, coyote time, buffer, soportes móviles y viabilidad de los saltos entre plataformas obligatorias.

Las pruebas de navegador requieren Playwright y Chromium instalados y un servidor para `dist`:

```bash
python3 -m http.server 8081 --directory dist
# En otra terminal:
node tests/browser-v3.cjs
node tests/graphics-browser.cjs
node tests/replay-browser.cjs
node tests/menu-browser.cjs
node tests/stability-browser.cjs
node tests/chapter2-browser.cjs
node tests/chapter2-panels-browser.cjs
```

`GAME_URL`, `PLAYWRIGHT_MODULE` y `CHROMIUM_PATH` permiten configurar el servidor y las herramientas. En el entorno de desarrollo: Playwright `/opt/codex/cua_node/lib/node_modules/playwright`, Chromium `/usr/bin/chromium`.

La prueba v3 ejercita el tutorial con controles reales y usa partidas de prueba para entrar a cada escena, resolver sus etapas mediante la interfaz, recoger la recompensa, exportar, importar y rechazar archivos incorrectos. Comprueba controles simultáneos táctiles al saltar. La viabilidad física entre plataformas se verifica aparte en el motor; esto no sustituye una partida humana completa.

La duración de 45–60 minutos, más los opcionales, es un objetivo pendiente de pruebas con jugadores. También faltan validación de rendimiento y áreas seguras en teléfonos físicos. No se ha publicado el entorno ni se ha generado una aplicación firmada para tiendas.
