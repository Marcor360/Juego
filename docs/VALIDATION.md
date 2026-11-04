# Validación del capítulo 1 v3

Entorno: Node 24.22.1, Expo SDK 54, Skia 2.2.12. Esta versión reemplaza el bosque anterior de seis misiones por 16 escenas en 8000 píxeles lógicos.

| Comprobación | Alcance |
| --- | --- |
| `npm run typecheck` | Tipos del proyecto |
| `npm test` | 21 pruebas: progresión, evidencias, decisiones, salud, físicas, guardado, migración y arte |
| `npm run build:web` | Exportación web y recursos locales CanvasKit |
| `expo export --platform android --platform ios` | Bundles Hermes de ambas plataformas; no equivale a prueba en teléfono |
| `tests/browser-v3.cjs` | Tutorial, 16 escenas, desafío por etapas, recompensa, exportación, importación válida y rechazo de archivo incompatible |
| `tests/menu-browser.cjs` | Tres portadas, vestuarios, controles y guardado en cuatro tamaños de pantalla |
| `tests/chest-browser.cjs` | Cuerpo sólido, apertura animada y Fe permanente en escritorio y táctil |
| `tests/replay-browser.cjs` | Repetición sin sobrescribir y continuación de la partida principal |
| `tests/graphics-browser.cjs` | Canvas, cuaderno y escalado en 1280×720, 812×375, 667×375 y 390×844 |

## Escenarios y dificultad

Los tramos obligatorios del puente y la niebla incluyen huecos largos bajo una cadena de apoyos: no se puede completar la exploración caminando por el suelo. Las plataformas de cuerda requieren haber escuchado al viajero. Los materiales y las pistas elevados coinciden con sus alturas reales de apoyo y se recogen automáticamente al aproximarse.

`tests/routes.test.ts` busca una trayectoria física válida entre cada par de apoyos obligatorios, incluyendo distintas fases de las plataformas móviles. Exige llegar sin recibir daño. Esta prueba detectó una rama demasiado cerca del borde de despegue; se ajustó su posición. La prueba de recolección también comprueba todas las pistas y materiales en sus soportes efectivos.

Se verifican coyote time, buffer de salto, agua y ramas, transporte sobre plataformas móviles, invulnerabilidad y retorno al checkpoint al agotar corazones, conservando evidencias y progreso narrativo. La simulación usa pasos de 1/120 s, con un límite de recuperación por fotograma.

## Pruebas de interfaz

La prueba de navegador utiliza el tutorial con controles reales y partidas de prueba para entrar a las escenas restantes. No afirma haber recorrido físicamente los 8000 píxeles en una única partida humana.

Cada desafío se resuelve mediante sus botones, con orden mezclado y texto uniforme. Se comprueba una respuesta incorrecta, ausencia de daño por respuestas y aceptación de la elección correcta posterior. El reto de confianza permite intercambiar tokens de palabras repetidas y agrega una decisión de aplicación después del ordenamiento.

En escritorio se usa teclado. En formato móvil se usan toques y eventos Chromium `touchStart`/`touchEnd`, incluyendo dos dedos para caminar y saltar simultáneamente. Una pulsación rápida de Saltar tenía un problema de activación que se corrigió. Se verifican el cuaderno, la confirmación del punto de no retorno, la animación del cofre, la Fe y capítulos `[1,2]`.

La partida exportada contiene las 16 escenas completadas. Una importación incompatible no reemplaza el progreso existente. Las partidas v1 válidas conservan sus recompensas, comienzan las escenas nuevas desde la entrada y mantienen el archivo local anterior como respaldo. La repetición conserva la partida principal mientras se está jugando de nuevo.

## Arte

Se incorporaron seis fondos de zona originales, seis poses de tres personajes adicionales, cuatro fases del cofre, cuatro conjuntos de terreno/objetos y una franja de suelo. Se mantienen las poses animadas v2 de protagonista, guía y viajero. El registro analiza alfa y celdas sin alterar los PNG. Los límites de las celdas de terreno se ajustaron a la distribución observada, en lugar de asumir cuatro recortes iguales.

Los fondos cambian por zona con fundido y desplazamiento; no repiten el gran árbol a lo largo del bosque. El suelo utiliza una textura específica de tierra y raíces, con franjas reflejadas que comparten el mismo borde de origen. Las plataformas muestran salientes completos de roca/musgo y madera. El cofre mantiene una base estable durante su apertura y eleva la linterna al final.

## Pendientes de validación

- Medir la duración con jugadores: 45–60 minutos y opcionales son objetivos del diseño, no una duración comprobada.
- Probar rendimiento, multitáctil, áreas seguras, audio y persistencia en Android/iOS físicos.
- Revisar editorialmente las referencias antes de una publicación pública. Los retos actuales indican que contienen reflexiones adaptadas, no citas literales.
- El capítulo 2 está desbloqueable, pero aún no es jugable. No se implementaron los capítulos 2–7.

No se publicó el entorno ni una aplicación firmada para tiendas durante esta revisión.

## Rediseño del menú

Se agregaron tres paisajes y seis poses de menú, incluida la protagonista con pantalón en la variante intermedia. La selección visual depende de las escenas realmente completadas, sin migrar ni alterar los datos de partida. El menú vertical mantiene controles ampliados y usa un retrato enmarcado cuando falta altura para el cuerpo completo. La tipografía nueva se incluye con su licencia OFL. Ver `docs/MENU.md`.
