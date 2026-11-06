# Menús del viaje

El menú conserva tres paisajes y vestuarios originales, elegidos por escenas realmente completadas: Amanecer antes de la escena 8, En camino desde la escena 8 y Nuevos horizontes después de la escena 16. Las recompensas migradas no adelantan el aspecto de cierre.

## Acciones y progreso

Sin partida se ofrece **Comenzar aventura**. Con una partida en curso, **Continuar mi camino** retoma el bosque y **Diario de capítulos** abre el selector. Al terminar el capítulo, la acción destacada invita a ver los capítulos y se conserva **Volver al bosque**. No se reinicia una partida desde una acción que solo debería continuarla.

La tarjeta muestra ubicación, próxima escena y progreso accesible sobre las 16 escenas. Las herramientas web para cargar y descargar se reúnen junto a Ajustes, Créditos y Cómo jugar. Las acciones que podrían competir con la lectura inicial del guardado permanecen deshabilitadas hasta terminar la carga.

## Adaptación y accesibilidad

El paisaje y los retratos mantienen su arte propio, pero los controles ya no se escalan desde una maqueta de 480 px. Todos los botones tienen al menos 44 px de altura, con estados de foco, pulsación y hover. La tarjeta usa tamaños reales y se puede desplazar cuando falta altura o aumenta el texto. En vertical hay un retrato enmarcado; en horizontal se conserva el cuerpo completo.

Cómo jugar explica la entrada detectada. Los diálogos mantienen Tab dentro del panel, Escape los cierra y el foco vuelve a su origen cuando sigue presente en el menú. Dentro del juego vuelve a la zona de juego para que Espacio siga sirviendo para saltar tras cerrar el cuaderno. El foco inicial se coloca en el diálogo sin desplazar la lectura al último botón. Al regresar de Ajustes dentro del juego se vuelve a Pausa, conservando la intención de detener el recorrido.

La música, los efectos y el movimiento reducido se guardan al cerrar Ajustes en `precursora-settings-v1`, aunque aún no exista partida. Los datos se validan y las escrituras se ordenan. Las partidas siguen teniendo su propio esquema y respaldos.

## Recursos y comprobaciones

Los originales se mantienen en `assets/menu/` y las copias optimizadas en `assets/runtime/`. Los recortes de ejecución son `menu-art-runtime.json` y `menu-formal-art-runtime.json`; las fuentes reducidas conservan caracteres españoles y sus licencias.

`tests/menu-browser.cjs` prueba las tres variantes en seis tamaños, desde 320×568 hasta 1280×720, con acciones accesibles de 44 px, ayuda, foco, Escape, continuación y descarga. `tests/menu-preferences-browser.cjs` comprueba preferencias persistentes antes de comenzar una partida. Las pruebas de navegador móvil son emuladas; las exportaciones nativas no equivalen a una prueba en teléfonos físicos.
