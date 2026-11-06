# Conversaciones e interacciones visibles

Los diálogos del bosque se colocan en una franja superior transparente alrededor del papel. Se oculta el HUD durante la conversación; el suelo, los actores y sus gestos quedan visibles. En pantallas pequeñas el texto se puede desplazar. El avance sigue siendo manual, sin obligar a leer deprisa.

Las nuevas secuencias de conversación tienen seis poses: reposo, parpadeo, gesto cerrado, articulación intermedia, articulación abierta y sonrisa. El ciclo intercala pausas y una sonrisa sostenida, en vez de alternar dos bocas rápidamente. La precursora mira a su interlocutor y un pequeño indicador identifica al que habla. Movimiento reducido mantiene una pose estable.

Se incorporan el guardabosques junto a la rama y un aprendiz en la biblioteca, con arte y retratos propios. El guardabosques conserva la opción de ayuda de la escena 5 y permanece para orientar después. El aprendiz conversa al acercarse e interactuar; no entrega respuestas ni completa tareas automáticamente.

## Retirar la rama

La escena 5 representa apartar un tronco ya roto, no cortar un árbol sano. Al confirmar una solución, la precursora camina hasta la rama; después esta se inclina y rueda hacia la orilla en ocho cuadros. El tronco final permanece junto al camino. Hay gesto de esfuerzo, polvo breve y sonidos de madera desplazándose y asentándose. La colisión se mantiene durante la secuencia y los controles se liberan al terminar. Con movimiento reducido se muestran los estados inicial/final sin polvo ni desplazamiento interpolado.

La misión se guarda al aceptar la solución. Al cargar se muestra directamente el estado despejado, evitando repetir sonidos o quedarse esperando una animación perdida. Pausar detiene el reloj de la acción.

## Faroles y sonido

Reparar el primer farol o preparar el segundo produce una transición de encendido con seis cuadros de llama y sonido. Una partida cargada conserva el farol encendido sin repetir el efecto. Cuatro efectos originales sintetizados: `wood-shift`, `wood-land`, `ignite` y `talk-soft`. El último es una señal suave al avanzar el diálogo, no una voz grabada. Respetan el volumen de efectos y la pausa de audio en segundo plano.

## Recursos y regeneración

Originales en `assets/characters/v3`, `assets/props/v3` y `assets/effects`. Se conservan los originales y el juego usa copias reducidas con anclajes registrados:

```sh
python3 scripts/register-art.py
node scripts/optimize-art.cjs
python3 scripts/generate-interaction-audio.py
python3 scripts/audit-art.py
node scripts/build-art-gallery.cjs
npm run typecheck
npm test
npm run build:web
npm run test:browser
```

Pillow y NumPy son herramientas de desarrollo; Sharp se usa para optimizar y empaquetar recursos. No se requieren para ejecutar el juego exportado. La galería permite revisar las poses fuera del juego.

Queda comprobar el resultado y la latencia de sonido en teléfonos físicos Android/iOS. Las pruebas con pantalla táctil emulada y la exportación de bundles no sustituyen esa comprobación.

## Validación de esta entrega

- Revisión general del navegador: 17 suites aprobadas, incluidos menú, controles, audio, capítulos, guardados, niebla, acompañante, gráficos y cofre.
- TypeScript y 77 pruebas de lógica, registro de arte, audio y guardado aprobadas.
- Nuevas interacciones verificadas en navegador de escritorio y móvil emulado: cuadros de conversación por encima de los actores, cambio visible de gestos, retirada de rama, pausa, sonidos, encendido y conversación con el aprendiz.
- Tras separar al aprendiz de la posición de interacción, se repitieron las suites de interacciones y biblioteca en la exportación final: ocho estaciones, respuestas incorrectas, recarga parcial y recompensa aprobadas.
- Exportación web y bundles Android/iOS aprobados. No son instaladores firmados.
- Galería sin conexión: 39 vistas de arte cargadas y cuatro botones de sonido; ZIP de juego y código revisados por integridad.
