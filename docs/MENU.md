# Menús del viaje

El menú principal tiene tres composiciones originales y cambia automáticamente con el progreso guardado del capítulo 1, que es el capítulo actualmente jugable.

| Variante | Momento | Protagonista | Paisaje |
| --- | --- | --- | --- |
| Amanecer | Antes de completar la escena 8 | Blusa azul, falda lavanda y mochila | Árbol florido, pueblo, montañas y amanecer |
| En camino | Escena 8 completada y capítulo sin terminar | La misma protagonista con pantalón de vestir lavanda, zapatos formales y mochila | Arroyo y puente de piedra entre árboles |
| Nuevos horizontes | Escena 16 completada | Falda lavanda y linterna de la Fe | Valle al anochecer, primeras estrellas y luces del pueblo |

Las recompensas importadas de una versión antigua no adelantan el aspecto de cierre si las escenas nuevas todavía no se han jugado. No se muestran graduación ni recompensas de capítulos futuros.

## Composición e interacción

La protagonista ocupa el lado izquierdo y los controles se reúnen en una tarjeta de diario a la derecha. La tarjeta tiene borde doble fino, libro con ramas de olivo, título de alto contraste y botones nativos con estados de foco, pulsación, hover y deshabilitado. Continuar solamente está activo cuando hay una partida válida.

Se mantienen Comenzar aventura, Continuar, Cargar partida web, Ajustes, Créditos y descarga de la partida. El cambio visual no modifica el esquema de guardado ni las misiones.

Los teléfonos verticales tienen una composición apilada con controles ampliados. En proporciones verticales cortas, se presenta un retrato enmarcado de la protagonista. El juego conserva su vista horizontal y controles originales.

El parpadeo alterna dos fotogramas reales por vestuario, registrados con apoyo estable. La respiración y las pocas motas ambientales se detienen al activar efectos reducidos. La portada no necesita inicializar el escenario Skia para mostrar sus controles.

## Recursos

- `assets/menu/beginning.png`, `middle.png`, `ending.png`: fondos originales sin texto ni botones incrustados.
- `assets/menu/hero.png`: seis poses originales con transparencia. Las portadas inicial y de cierre conservan este recurso.
- `assets/menu/hero-formal.png`: vestuario intermedio corregido en dos poses, con pantalón de vestir lavanda de corte recto y raya, y zapatos formales crema de tacón bajo. El menú usa sus celdas centrales para el estado normal y el parpadeo.
- `game/rendering/menu-art.json` y `menu-formal-art.json`: dimensiones reales, celdas, límites alfa y anclajes. El segundo se regenera con `python scripts/register-menu-art.py assets/menu/hero-formal.png game/rendering/menu-formal-art.json` (Pillow opcional; no modifica las imágenes).
- `assets/fonts/CormorantGaramond.ttf`: fuente Cormorant Garamond, distribuida junto a su licencia SIL OFL. Pixelify se conserva para las etiquetas de viaje.

El arte fue creado con asistencia generativa para este proyecto. Las animaciones y los controles se implementan por separado mediante React Native y Reanimated.

## Verificación

- `npm run typecheck` y `npm test` (39 pruebas).
- Exportaciones web, Android e iOS.
- `tests/menu-browser.cjs`: las tres variantes en 1280×720, 667×375, 390×844 y 600×800; verifica vestuario asociado, botones dentro de la pantalla, Continuar deshabilitado, ajustes, créditos, descarga y retorno al menú tras guardar. Comprueba errores de página y recursos ausentes.
- `tests/browser-v3.cjs`: regresión de las 16 escenas con teclado y controles táctiles web.

Las pruebas móviles se ejecutan en navegador con eventos táctiles. La exportación nativa no sustituye la validación en teléfonos Android/iOS físicos.
