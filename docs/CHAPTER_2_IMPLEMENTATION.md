# Capítulo 2 — implementación y validación

## Alcance

La rama `feat/chapter2-library-rpg` nace del `main` actualizado (`96c652a`, que ya contiene el PR #1). Conserva el capítulo 1 y los tres menús existentes, incluido el pantalón **de vestir** lavanda de la portada intermedia. No fusiona a main ni publica el entorno.

La biblioteca incluye 16 escenas secuenciales, 13 salas conectadas, investigación, un debate con documentos y preguntas opcionales, mecanismos, linterna, corazones/checkpoints y tablero final de 66 libros. El capítulo 3 se desbloquea pero no se implementa su historia.

## Organización

- `game/chapter2/engine/world.ts`: simulación mutable de movimiento normalizado, cámara, NPC, colisiones, puertas y daño físico. Pasos fijos de 1/120 s; límite de trabajo por fotograma.
- `game/chapter2/maps/library.ts`: 13 salas, mobiliario independiente con huella de colisión, puertas y destinos, interacciones, actores y rutas.
- `game/chapter2/content/`: diálogos, desafíos, libros y documentos separados del código. Las explicaciones son originales, no transcripciones bíblicas.
- `game/questions.ts`: orden aleatorio estable por semilla, respuestas por ID, selecciones, pistas, pasos y respuestas aceptadas.
- `game/chapter2/puzzles.ts`: permutación inicial sin tarjetas resueltas, intercambios, tres cronómetros, validación y resultado.
- `game/chapter2/state.ts`: requisitos y validación de escenas, posición, sala, inventario temporal, intentos, reflexiones y rutinas.
- `game/chapter2/campaign.ts` y `game/save/schema.ts`: esquema 3 compatible con v1/v2 y el repositorio de recuperación existente. Mantienen una instantánea independiente del bosque.
- `components/chapter2/`: render Skia cargado con CanvasKit compatible en web; interfaz nativa para conversación, documentos, plano, cuaderno, inventario, pausa, ajustes, investigación y tablero.

## NPC y arte

Se generaron atlas originales para 24 pasos de la protagonista (6 por dirección), 9 acciones, 6 NPC narrativos con 4 poses, 4 visitantes ambientales con 4 poses, 9 retratos, 8 muebles, 8 objetos y 8 módulos de suelo/decoración. La fachada y el paisaje del balcón son capas propias. No se copió arte de videojuegos ni interfaces de bibliotecas existentes.

Los recortes se registran según los tamaños y límites alfa reales de cada archivo mediante `scripts/register-chapter2-art.py`; el script no altera píxeles. Los muebles y puertas se dibujan por separado. El edificio completo se usa únicamente como fachada exterior, sin sustituir las salas jugables.

Hay **23 visitantes ambientales**, ocho rutas de paseo y 13 instancias de los seis personajes narrativos distribuidas por las salas. Los paseantes se detienen en puntos de su ruta y dejan distancia al jugador y otros actores. Sus rutas evitan puertas y muebles. Los lectores permanecen en los espacios de lectura; puedes saludarlos. Los diálogos utilizan el retrato del interlocutor, incluidos los visitantes ambientales. Las rutinas, posición, espera y sentido horizontal se guardan por sala. En conversaciones y pausa la simulación se detiene.

Los atlas de NPC tienen dos pasos laterales y poses de actividad; no tienen el mismo repertorio direccional completo de la protagonista. Esa diferencia es una limitación artística explícita. El arte usa escalado por vecino más cercano; no se presenta como un atlas dibujado manualmente.

## Persistencia y recuperación

La clave de almacenamiento permanece estable para no perder copias locales. El esquema 3 guarda ambos capítulos y `activeChapter`, `level`, sala/piso/posición, checkpoint, corazones, diálogos, documentos, respuestas/pistas/orden de opciones, rutinas, tablero y récords. V2 se conserva hasta que el jugador entra a la biblioteca; v1 utiliza la migración existente.

Guardar ocurre al interactuar, avanzar un diálogo o pregunta, activar un mecanismo, cambiar sala, recibir daño, mover tarjetas, pausar y volver al menú. En exploración hay guardado adicional cada cinco segundos; en el tablero, al cambiar el segundo restante. Cerrar o cambiar de aplicación pausa el tablero. Al continuar se requiere reanudarlo expresamente.

La importación valida antes de escribir. Se rechazan salas bloqueadas, posiciones dentro de muebles, capítulos/herramientas adelantados, intentos incoherentes, tarjetas repetidas y tiempos incompatibles. La cantidad y paridad de los intercambios deben poder producir la disposición importada desde su semilla. El repositorio conserva la copia válida anterior y no sobrescribe lecturas o respaldos fallidos.

## Música

Cinco temas originales sintetizados de 24 segundos para patio, biblioteca, investigación, descanso y gran sala; efectos de página, mecanismo, logro, tarjeta y pasos. `scripts/generate-library-audio.py` reproduce las fuentes WAV sin muestras de terceros. Música y efectos tienen volumen configurable.

## Validación

Validación ejecutada el 4 de noviembre de 2026:

| Comprobación                                                                              | Resultado                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                                                                  | Instalación limpia correcta; postinstall prepara el WASM versionado                                                                                                                                                                                                                           |
| `npm run typecheck`                                                                       | Sin errores                                                                                                                                                                                                                                                                                   |
| `npm test`                                                                                | **52 pruebas correctas**, incluidas las regresiones del bosque                                                                                                                                                                                                                                |
| `npm run build:web`                                                                       | Exportación web correcta                                                                                                                                                                                                                                                                      |
| `npx expo export --platform android --platform ios --output-dir /tmp/ch2-native-delivery` | Ambos paquetes Hermes generados; no son aplicaciones firmadas                                                                                                                                                                                                                                 |
| `node tests/chapter2-browser.cjs`                                                         | Recorrido continuo de las **16 escenas del capítulo 2** mediante controles y UI; documentos, puertas, mecanismos, preguntas, tablero completo, Conocimiento, desbloqueo 3, exportación y reanudación; 0 errores JavaScript                                                                    |
| `node tests/chapter2-panels-browser.cjs`                                                  | Contexto offline, selección/semilla/orden persistentes, importación parcial, respuestas incorrectas sin daño, pulsaciones/teclado/arrastre reales, pausa/reanudación del reloj, rechazo de importación inválida, tiempo agotado con diálogo, reintento, cambio de modo, victoria y recompensa |
| Móvil web, 852×393 con emulación táctil                                                   | La cruceta mueve realmente a la protagonista; conversación de la visitante con su retrato; sin desbordamiento horizontal ni errores JavaScript                                                                                                                                                |
| `node tests/browser-v3.cjs`                                                               | Interfaz de las 16 escenas del bosque en escritorio y móvil mediante partidas de prueba; exportación, importación inválida y controles de niebla correctos                                                                                                                                    |
| `node tests/menu-browser.cjs`                                                             | Las tres portadas en cuatro tamaños, incluido el pantalón formal intermedio, correctas                                                                                                                                                                                                        |
| `node tests/replay-browser.cjs`                                                           | Repetir el bosque conserva la partida principal                                                                                                                                                                                                                                               |
| `node tests/stability-browser.cjs`                                                        | Recuperación, avisos persistentes, descarga tras fallo de almacenamiento, tutorial/cuaderno y render de las seis zonas correctos                                                                                                                                                              |
| `git diff --check`                                                                        | Sin errores de espacios                                                                                                                                                                                                                                                                       |

Los navegadores usan Chromium con software gráfico y Playwright. `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `GAME_URL` y `ARTIFACT_DIR` configuran las pruebas. El recorrido utiliza teclado real y botones; Playwright adelanta su reloj al recorrer segmentos, sin introducir atajos de misiones ni un botón de resolver en el producto.

El recorrido continuo comienza con una **partida migrada válida que ya posee Fe**. No se afirma haber jugado ambos capítulos completos en una única sesión humana. Las pruebas adicionales de paneles usan fixtures declarados y validados; no sustituyen al recorrido completo. Tampoco se infiere una duración humana a partir de la automatización.

## Evidencia visual

Capturas de la aplicación ejecutándose, sin retocar:

- [Patio con visitantes](evidence/chapter2/courtyard.png).
- [Laberinto y estanterías](evidence/chapter2/maze.png).
- [Tablero y cronómetro pausado](evidence/chapter2/book-board.png).
- [Diálogo en móvil con el retrato de la visitante](evidence/chapter2/mobile-dialogue.png).
- [Conocimiento obtenido y capítulo 3 desbloqueado](evidence/chapter2/completed.png).
- [Balcón con el puente lejano](evidence/chapter2/balcony.png).

## Revisión

Comparación preparada para revisar: [main…feat/chapter2-library-rpg](https://github.com/Marcor360/Juego/compare/main...feat/chapter2-library-rpg).

La política de red permite el transporte Git a github.com, pero bloquea api.github.com. Si la creación del PR mediante `gh` devuelve Forbidden, la rama puede revisarse desde esta comparación y abrirse el PR en GitHub. No se fusiona con main ni se publica el entorno.

## Límites de entrega

- La verificación editorial de JW.ORG sigue pendiente: la red devolvió 403. [Tabla con preguntas, respuestas y fuentes propuestas](CHAPTER_2_EDITORIAL.md). No se etiqueta ningún pasaje como verificado ni se inventan citas literales.
- La validación web no sustituye pruebas de rendimiento, sonido, áreas seguras y gestos en Android/iOS físicos. No se generan binarios firmados ni se publica a tiendas.
- La duración y dificultad para jugadores requieren sesiones humanas. El reloj de 10/6/3 minutos corresponde al tablero, no a una duración garantizada de todo el capítulo.
