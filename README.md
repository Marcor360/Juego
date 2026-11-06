# El camino de una Precursora

Aventura 2D en Expo SDK 54, React Native, TypeScript, Expo Router y Skia. El capítulo 1 v3 tiene 16 escenas conectadas en un bosque de 8000 píxeles lógicos, con seis zonas y contenido narrativo separado del motor. Web, Android e iOS comparten físicas y misiones.

Conversaciones con personajes visibles, nuevos NPC y efectos de retirada de la rama y encendido de faroles: [detalle de la actualización](docs/INTERACCIONES_Y_CONVERSACIONES.md).

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

En Windows, para servir el exportado sin Python: `npx serve dist -l 8080` y abre `http://localhost:8080`.

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

El selector tiene siete capítulos. El segundo ya es jugable: una biblioteca con recorrido lateral, ocho lecturas, retos, guardado propio y la herramienta del Aprendizaje. Se entra después del epílogo o desde el diario de capítulos al estar desbloqueado. Los capítulos 3–7 quedan para fases posteriores. Ver [biblioteca y acompañante](docs/CAPITULO_2_Y_ACOMPANANTE.md).

Controles: **A/D o flechas** para caminar, **Espacio** para saltar, **E** para conversar, **J** para el cuaderno, **I** para inventario y **Esc** para pausa. En Android/iOS y navegadores con puntero táctil aparecen flechas para caminar, ↑ para saltar y ◇ para interactuar. En PC con ratón/teclado se ocultan. La detección usa el puntero principal y se adapta al cambiar de entrada en equipos híbridos, sin depender del tamaño de pantalla. Las instrucciones del tutorial, cuaderno, pausa y avisos de interacción acompañan el tipo de entrada. Los botones del HUD se reducen a iconos accesibles en pantallas estrechas. La vista lógica es 480×270, horizontal, con bandas seguras para otras proporciones.

## Guardado

AsyncStorage guarda al completar escenas, recoger pistas/materiales, activar checkpoints, recibir daño y salir al menú. También conserva el reto pendiente: pasos aceptados, selección, pistas y orden de opciones. Continuar la partida lo reabre directamente; Pausa ofrece Retomar reto. En web se descargan e importan copias JSON y en Android/iOS se usa el selector y el menú de compartir del sistema. Las copias se validan antes de reemplazar el progreso y admiten hasta 1 MB.

Las partidas anteriores del esquema 2 siguen siendo válidas sin un reto pendiente. Si el contenido de un reto cambia o sus respuestas guardadas no son válidas, solo se descarta ese reto y se avisa; se conserva el resto del capítulo.

El esquema 2 usa la clave `precursora-save-v2`. Se conserva el guardado válido anterior en `precursora-save-v2-last-good`. Si la partida reciente está dañada, se intenta recuperar una copia local o la versión anterior. Los candidatos dañados se archivan antes de reemplazarlos, y una lectura o un respaldo fallidos bloquean la sobrescritura. Los avisos se mantienen hasta leerlos; la sesión actual puede descargarse incluso si el almacenamiento falla. Las partidas válidas de la versión anterior se migran desde `precursora-save-v1`, que permanece como respaldo: conservan la Fe y el capítulo 2 obtenidos, pero comienzan las 16 escenas nuevas desde la entrada. Repetir un capítulo no sobrescribe la partida principal hasta terminarlo.

## Arquitectura y arte

- `app/`: navegación y coordinación de interfaz.
- `game/engine/`: simulación mutable, cámara, física y colisiones; pasos de 1/120 s, sin renderizados React completos por fotograma.
- `game/levels/`: zonas, plataformas, objetos y checkpoints.
- `game/missions/`: progresión y requisitos de las 16 escenas.
- `game/chapter1/` y `game/dialogues/`: validación de respuestas y contenido independiente.
- `game/save/`: esquema, migración, persistencia y transferencia por plataforma.
- `components/`: escenarios Skia, atlas animados, retratos e interfaz nativa.
- `assets/backgrounds/v3/`, `assets/characters/v3/` y `assets/props/v3/`: seis fondos, personajes adicionales, terreno, letreros, rama y cofre nuevos. Se conservan las poses v2 de la protagonista, guía y viajero.
- `game/rendering/art.json`: recortes y anclajes de los atlas activos. `scripts/register-art.py` analiza sus límites alfa sin cambiar píxeles; es una herramienta opcional de arte con Python y Pillow.

El arte se creó con asistencia generativa para el proyecto. El audio es original sintetizado. Los textos de los retos son reflexiones adaptadas con referencia, no citas bíblicas literales.

## Pruebas

`npm test` comprueba progresión, requisitos, alternativas coherentes, migración, rechazos de guardado, colisiones, caídas, corazones, coyote time, buffer, soportes móviles y viabilidad de los saltos entre plataformas obligatorias.

Las pruebas de navegador usan Playwright, incluido como dependencia de desarrollo. Para ejecutar la misma comprobación que CI:

```bash
npm run build:web
npx playwright install chromium
npm run test:browser
```

El comando abre un servidor local temporal con Python 3, ejecuta dieciséis recorridos de Chromium y guarda capturas/registros en `browser-artifacts/`. En un sistema con Chromium ya instalado se puede usar `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`. `GAME_URL` permite probar un servidor existente; `GAME_DIST` cambia el directorio exportado; `BROWSER_SUITES=challenge-resume-browser.cjs` permite ejecutar solo una prueba. `ARTIFACTS_DIR` cambia la carpeta de resultados.

GitHub Actions ejecuta tipos, lógica, exportación web y todas las pruebas de navegador en cada PR a `main` y al actualizar `main`. Las capturas y registros se conservan durante siete días, también cuando una comprobación falla. Esto describe el workflow configurado; sus resultados remotos aparecen después de subir los cambios.

La prueba v3 ejercita el tutorial con controles reales y usa partidas de prueba para entrar a cada escena, resolver sus etapas mediante la interfaz, recoger la recompensa, exportar, importar y rechazar archivos incorrectos. Comprueba controles simultáneos táctiles al saltar. La viabilidad física entre plataformas se verifica aparte en el motor; esto no sustituye una partida humana completa.

La duración de 45–60 minutos, más los opcionales, es un objetivo pendiente de pruebas con jugadores. También faltan validación de rendimiento y áreas seguras en teléfonos físicos. No se ha publicado el entorno ni se ha generado una aplicación firmada para tiendas.

## Arte y sonido optimizados

El juego usa versiones compactas en `assets/runtime/`, atlas con metadatos a la misma escala y fondos cargados por proximidad. Incluye ocho ambientes sonoros con transiciones suaves, pasos por material y efectos de salto, caída, aterrizaje, daño, cuaderno y cofre. La biblioteca es el capítulo II jugable, con arte y sonido propios, ocho mesas de lectura y progreso persistente. Ver [inventario, medidas y regeneración](docs/ARTE_Y_AUDIO.md).

La limpieza del paquete antiguo y los ajustes de movimiento y ambiente están documentados en [la revisión actual](docs/LIMPIEZA_Y_AMBIENTACION.md).

La [revisión del menú](docs/REVISION_MENU.md) documenta las acciones contextuales, el progreso visible, la ayuda, la navegación con teclado y las preferencias independientes de la partida, junto con los siguientes pasos recomendados.

Los [avances de guardado parcial, respaldo móvil y CI](docs/GUARDADO_PARCIAL_Y_RESPALDOS.md) detallan formatos, comprobaciones y las pruebas físicas que todavía hacen falta.

La niebla tiene profundidad y bancos visibles sin ocultar las superficies de salto. Ver [niebla y estabilidad](docs/NIEBLA_Y_ESTABILIDAD.md), incluida la corrección del acompañante en plataformas móviles y las pruebas al perder foco.

El arte incluye NPC con cuatro poses y retratos propios, agua y cascadas animadas, pistas ilustradas, detalles del entorno y emblemas del menú. Las figuras del menú conservan la resolución original con dos poses empaquetadas por portada. Ver [revisión de arte](docs/ARTE_NPC_AGUA_Y_MENU.md).
