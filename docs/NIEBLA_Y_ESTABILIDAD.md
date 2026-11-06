# Niebla visible y estabilidad del recorrido

## Por qué no se distinguía

La zona existía entre el claro y el refugio, pero el efecto era muy tenue. La capa general tenía una opacidad máxima del 20 % y después de completar la escena 13 se multiplicaba por 0,3: quedaba aproximadamente en un 6 %. La banda ambiental añadida también era tenue. Tener una función llamada «niebla» no garantizaba que el jugador reconociera el lugar.

## Cambio visual

`components/MistVeil.tsx` separa el fondo y el primer plano. El fondo pierde contraste mediante una transición azul grisácea y cuatro bancos suaves con degradado radial, sin bordes recortados ni un filtro de desenfoque costoso. Las plataformas y los actores se dibujan delante de esa profundidad; una bruma ligera a ras de suelo es la única capa que pasa delante de ellos. Los apoyos de esta zona resaltan su borde caminable.

La densidad sigue la posición real de la protagonista. Empieza a aparecer al acercarse al letrero del claro y ya se reconoce en el checkpoint de entrada; se disipa al entrar al refugio. Completar la escena de confianza abre algo la visibilidad, pero conserva el 68 % de la densidad del lugar. El modo de movimiento reducido detiene los bancos, sin quitar la niebla ni cambiar su dificultad visual. Las capas solo se montan cerca del tramo mediante la ventana de visibilidad del mundo.

No se añadieron imágenes grandes ni nuevas dependencias para este efecto.

## Cómo llegar

1. Completa el segundo farol, escena 11.
2. Sigue a la derecha, hasta el letrero **Entrar en la niebla**, al final del claro.
3. Interactúa y confirma **Estoy lista · entrar en la niebla**.
4. Aparece el aviso **Entraste en la niebla · checkpoint guardado**. Antes, el mensaje del checkpoint podía sobrescribir ese aviso; ahora el motor emite ambos en el orden correcto.
5. Sigue las piedras y apoyos móviles hasta el farol del tramo. El cuaderno describe los saltos y la recuperación. Después continúa hasta la inscripción de confianza y finalmente el refugio.

El marcador y las indicaciones distinguen la entrada, el farol de orientación y la inscripción. La niebla no requiere comenzar otra partida: las partidas anteriores siguen siendo válidas.

## Acompañante sobre plataformas móviles

Se reprodujo otro problema: la ruta conservaba posiciones absolutas de un apoyo móvil, de modo que un viajero esperando podía quedar en la posición anterior mientras la plataforma se alejaba. Cada punto de contacto ahora registra el identificador del apoyo. El desplazamiento del apoyo transporta al acompañante y sus aterrizajes pendientes, tanto en horizontal como en vertical, antes de continuar el seguimiento.

La regresión recorre doce segundos de cada ciclo y verifica que el viajero que está de pie conserve el contacto con la superficie. Las pruebas de caminar, girar, saltar y reanudar una ruta siguen vigentes.

## Controles, segundo plano y guardado

Perder el foco del bosque ahora guarda también la posición segura de la sesión, además de liberar controles y pausar. Cuando está abierta la biblioteca, su controlador toma la instantánea de posición y selección; el controlador del bosque evita emitir otra copia antigua del mismo estado.

`tests/suspension-browser.cjs` comprueba con teclado y eventos táctiles de Chromium:

- Cancelar una pulsación sin que llegue su evento de liberación normal.
- Confirmar que el personaje permanece quieto después de continuar.
- Pasar al estado de documento oculto y conservar la posición.
- Perder el foco mientras se camina en la biblioteca, continuar sin movimiento pegado y recargar la respuesta pendiente.
- Conservar las dieciséis escenas del bosque al reanudar la biblioteca.

`tests/mist-browser.cjs` comprueba la entrada, el checkpoint, capturas y diferencias de luminosidad del fondo antes/después de orientarse, tanto con animación como con movimiento reducido. La densidad también se prueba como función de posición y progresión.

## Límites

Estas comprobaciones no equivalen a apagar un teléfono físico durante una escritura. Los selectores nativos, rendimiento real de teléfonos y el bloqueo exacto de la captura anterior todavía requieren validación en ese equipo. No se afirma que todos los posibles bloqueos estén resueltos. Los capítulos III–VII siguen pendientes de contenido, y publicar en GitHub o en tiendas es otro trabajo.

## Resultado local de esta revisión

TypeScript y las 70 pruebas de lógica pasan. El comando completo de navegador terminó con quince suites aprobadas sobre el exportado entregado, incluidos bosque, biblioteca, niebla normal y con movimiento reducido, cancelación táctil, pérdida de foco, recuperación y copias de partida. Las exportaciones web, Android e iOS finalizaron correctamente. `git diff --check` no encontró errores de espacios.

`dist/` contiene la versión probada. Se prepararon `Juego-niebla-web.zip`, `Juego-niebla-codigo.zip` y una captura de entrada. Los ZIP se verificaron por lectura y CRC. Los cambios siguen locales; no se ejecutó un workflow remoto ni se publicaron en GitHub.
