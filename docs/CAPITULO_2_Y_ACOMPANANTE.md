# Claridad del bosque, acompañante y biblioteca jugable

## Primer capítulo

El objetivo anterior mostraba un título, pero no indicaba qué faltaba para resolverlo. `game/chapter1/guidance.ts` elige un destino concreto: una pista sin recoger, la ayuda junto a la rama, una pieza del farol, la entrada de la niebla o el personaje de la escena. La dirección aparece en el HUD, el cuaderno explica el recorrido y un marcador dorado señala el destino cuando está en pantalla. Las luces siguen siendo opcionales.

El final del cofre no es el epílogo: después de obtener la Fe hay que seguir hasta el libro de la salida del refugio. Ese libro ahora tiene arte y marcador; el cuaderno explica el paso. Tras completar la escena 16 se puede entrar directamente en la biblioteca o abrirla desde el diario de capítulos. No se regalan escenas por abrir una interfaz.

Los retos explican si se elige una opción, varias, una reflexión personal o un orden con distractores. Las respuestas parciales conservan el guardado existente. Los avisos táctiles se colocan encima de la altura de los personajes para que no tapen su cuerpo en pantallas pequeñas.

## Acompañante

El viajero de seguimiento ya no usa las poses con una roca dibujada. Se creó `assets/characters/v3/traveler.png`: doce cuadros, cuatro de espera, cuatro de caminar y cuatro de preparación/salto/caída/aterrizaje. Se registran las plantas de los pies de cada pose y se genera un atlas compacto de ejecución. Las direcciones comparten arte reflejado.

`CompanionTrail` sigue el camino realmente recorrido por la protagonista. Mantiene separación al estar en tierra, reproduce los cambios de altura y termina el salto antes de detenerse. Acelera de forma limitada para recuperar distancia si una secuencia de saltos lo retrasa. No busca el apoyo más alto por coordenada X ni cambia de lado al girar la protagonista. Reaparecer, recibir daño y cargar otra zona limpian la ruta anterior. Solo acompaña después de la conversación de la escena 7 y a partir del puente; no se transporta a las zonas anteriores al volver atrás.

Los personajes animados se dibujan mediante un recorte local de su hoja y sus anclajes, sin el búfer Atlas de antes. Se quitó el desplazamiento vertical artificial de los personajes de pie. La desaparición exacta de la captura del usuario no se reprodujo en el exportado local previo; por eso no se atribuye a una causa confirmada. Ahora hay una regresión que busca píxeles reales del personaje y de sus botas sobre el suelo en el puente y el claro, además de capturar caminar, salto y aterrizaje en escritorio y móvil emulado.

## Capítulo II: La biblioteca del aprendizaje

La biblioteca anterior solo tenía fondo y sonido. Ahora tiene una sala lateral de 1440 unidades, movimiento, salto, ocho mesas y un viajero que espera a la salida. Conserva el ambiente de biblioteca, pasos de madera, pasar páginas, salto, aterrizaje y descubrimiento. Se crearon cuatro atriles originales con libros, mapa, diario y cuaderno de recompensa; se carga únicamente su atlas reducido. El bosque se desmonta mientras se está en la biblioteca para evitar mantener ambos paisajes activos.

Las ocho tareas de `game/chapter2/library.ts` son:

1. Formular una pregunta que se pueda investigar.
2. Distinguir una observación de una generalización.
3. Contrastar fuentes, fechas y responsables.
4. Leer una reflexión bíblica en contexto, identificada como adaptación.
5. Ordenar un plan para orientar al visitante.
6. Ayudar con paciencia a quien no comprende un mapa.
7. Explicar con palabras sencillas y comprobar comprensión.
8. Reconocer que aprender continúa y recibir el Aprendizaje.

Es una primera versión jugable de ocho lecturas, no una duración de capítulo validada con jugadores. Los capítulos III–VII siguen pendientes de contenido jugable; completar la biblioteca deja el III desbloqueado en el selector.

### Cómo entrar

Completa el epílogo del bosque y usa **Entrar en la biblioteca · capítulo II**, o abre **Diario de capítulos → Jugar capítulo II**. Las partidas anteriores con el capítulo II desbloqueado también pueden entrar. Dentro, sigue la indicación de la mesa, acércate al libro y usa **E · Leer mesa** en PC o **Leer mesa** en táctil. Ayuda explica los controles. Se puede cerrar una lectura, pausar, salir y continuar desde el menú.

### Guardado y compatibilidad

El esquema 2 conserva los datos del bosque y añade `library` y `activeChapter` opcionales. El lector normaliza partidas anteriores sin cambiar su progreso. La biblioteca guarda posición segura, lecturas resueltas y selección actual; las elecciones equivocadas no avanzan y el orden se valida. Completar las ocho tareas añade `aprendizaje` y desbloquea el capítulo III. Inventario, capítulo activo y respuestas deben ser coherentes al importar. Exportar/importar incluye la biblioteca y las repeticiones del bosque protegen la partida principal.

## Comprobaciones

`npm run typecheck`, `npm test` y `npm run test:browser` son los comandos de verificación. El runner incluye quince suites, entre ellas `library-browser.cjs` y `companion-browser.cjs`, con capturas y registros en `browser-artifacts/`. La biblioteca se recorre con controles reales, sin teletransportes o accesos de prueba en producción. El móvil se emula con eventos táctiles reales de Chromium; esto no sustituye una prueba en teléfono físico.

## Compilar en Windows sin Python

Con los archivos actualizados en el equipo, desde PowerShell:

```powershell
npm ci
npm run build:web
npx serve dist -l 8080
```

Abre `http://localhost:8080`. Mantén la terminal abierta. La carpeta `dist` debe regenerarse después de cambiar el código; servir una exportación antigua muestra el juego antiguo. No borres los datos del navegador si quieres conservar tu partida. Los cambios de esta sesión permanecen locales hasta llevarlos a tu copia o subirlos a GitHub.

## Resultado de la revisión local

TypeScript y las 68 pruebas de lógica pasan. El comando completo de navegador terminó con las trece suites aprobadas sobre el exportado entregado. Incluye las 16 escenas del bosque en escritorio y táctil, las ocho lecturas de la biblioteca, respuestas incorrectas, reanudación parcial después de recargar, exportación de la biblioteca y protección del Aprendizaje al repetir el bosque. La regresión visual confirmó personaje y botas sobre el suelo en el puente y el claro. Las exportaciones Android e iOS también terminaron correctamente. No se ejecutó el workflow en GitHub ni se probaron teléfonos físicos.

`dist/` contiene esta versión web. La entrega incluye ZIP web compilado y ZIP de fuentes, sin `node_modules` ni historial Git; el web trae `INICIAR_WINDOWS.cmd`. Detén el servidor anterior antes de abrir el nuevo en el puerto 8080.
