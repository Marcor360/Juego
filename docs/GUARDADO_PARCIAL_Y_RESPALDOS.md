# Guardado parcial, respaldo móvil y pruebas automáticas

## Retos que se pueden retomar

La partida mantiene un `challenge` opcional dentro del esquema 2. Las partidas anteriores, incluidas las migradas del esquema 1, se normalizan con `challenge: null` y conservan su progresión. La clave de almacenamiento y los respaldos de partidas válidas no cambian.

El estado pendiente contiene la escena, una huella del contenido, los pasos aceptados, la selección actual, el orden de las opciones y si se consultó la pista. Cada cambio se guarda con la misma cola y protección de respaldos del repositorio existente. Al completar una escena se elimina el reto pendiente. No se conceden escenas o recompensas por el mero hecho de restaurar un borrador.

Al cargar se reevalúan las respuestas aceptadas contra las preguntas actuales y sus requisitos. No se aceptan pasos saltados, opciones desconocidas o duplicadas, ni un borrador de otra escena. Si el contenido cambió o el reto no se puede restaurar, se descarta solo ese estado parcial y se avisa; una partida válida no se rechaza por un cuestionario pendiente dañado.

Continuar una partida con un reto pendiente lo abre directamente. También se retoma desde Pausa o al volver a interactuar con su personaje. El siguiente paso vuelve al principio del panel y se anuncia como encabezado. Salir del reto no borra lo ya aceptado. Repetir un capítulo conserva la protección de la partida principal: el borrador de una repetición tampoco la reemplaza.

## Copias en web, Android e iOS

Un único lector/escritor JSON valida el archivo y su tamaño, con un límite de 1 MiB. Se tolera la marca UTF-8 BOM de algunos editores. La importación no cambia la partida hasta haber validado los datos; los errores y las cancelaciones liberan el bloqueo de la operación.

En web se descarga el archivo y se usa el selector del navegador. Android/iOS usan `expo-document-picker`, `expo-file-system` y `expo-sharing` de Expo SDK 54. El menú, Pausa y el cierre del capítulo permiten crear copias; el menú permite cargarlas. En móvil se abre la hoja del sistema para que el jugador elija dónde guardar o compartir. Abrir la hoja no permite afirmar que el usuario haya conservado una copia, por lo que no se anuncia un éxito que la API no puede confirmar.

Las exportaciones nativas usan archivos temporales con nombres únicos. Se mantienen como máximo diez copias recientes y se limpian las de más de un día; no se borra la copia al cerrar inmediatamente la hoja, porque la aplicación receptora puede leer su URI después. La limpieza opcional no impide preparar otra copia.

Pasar a segundo plano o abrir un selector ya no sustituye un panel que esté abierto por Pausa. Si falla la preparación de una copia, el error aparece en un diálogo visible y al cerrarlo se restaura el panel anterior; se puede volver a intentar. No hay envío automático a servidores ni se necesita una cuenta.

## Un comando para las comprobaciones de navegador

`npm run test:browser` abre un servidor temporal ligado a 127.0.0.1 en un puerto libre y ejecuta quince suites de Chromium. Usa el mismo código de prueba local y de GitHub Actions, y termina el servidor incluso si una suite falla. Cada prueba tiene un límite de tiempo. Al cancelar el comando también se termina el grupo de procesos de la suite en sistemas POSIX.

`browser-artifacts/` contiene capturas y registros, está ignorado por Git y se publica como artefacto del workflow durante siete días. `GAME_DIST`, `GAME_URL`, `CHROMIUM_PATH`, `ARTIFACTS_DIR` y `BROWSER_SUITES` permiten seleccionar el exportado, servidor o subconjunto local. Los nombres de suites se validan contra una lista permitida.

El workflow realiza `npm ci`, TypeScript, pruebas de lógica, exportación web, instalación de Chromium y los quince recorridos. Su estado en GitHub solo puede comprobarse tras subir los cambios; una ejecución local no se presenta como un check remoto aprobado.

## Evidencia y límites

Se corrigió además la restauración de partidas antiguas cuya posición quedaba dentro del cofre: el personaje reaparece al lado más cercano, conserva una posición segura y puede interactuar sin quedar incrustado. Una prueba de motor cubre ambos lados.

Las pruebas cubren compatibilidad con partidas v2 anteriores, respuestas manipuladas, cambios de contenido, orden de opciones, UTF-8, archivos grandes y conservación del capítulo. En navegador se prueba cerrar/reabrir, recargar, retomar desde Pausa, exportar/importar un reto parcial, terminarlo, cancelar el selector y recuperarse de una exportación fallida. Se mantienen además los recorridos de 16 escenas, menú, controles, gráficos, cofre, recuperación y repetición del capítulo.

La prueba del tutorial usa su posición guardada observada para acercarse al cuaderno mediante controles reales. No depende de que una pulsación de duración fija termine exactamente dentro de los 34 px de interacción, que era una fuente de variación entre equipos.

No hay dispositivos Android/iOS físicos conectados a esta sesión. Las exportaciones nativas comprueban los bundles, pero faltan estas pruebas manuales:

1. Guardar una copia real desde la hoja del sistema y abrirla después desde Archivos/Documentos.
2. Confirmar que una aplicación receptora puede leer el archivo tras cerrar la hoja.
3. Cancelar ambos selectores varias veces y comprobar que se puede reintentar.
4. Pasar a segundo plano dentro de un reto, volver y luego reiniciar la aplicación para comprobar el estado persistido.
5. Probar denegaciones de lectura, poco espacio, un archivo inválido y áreas seguras; medir rendimiento y latencia en un teléfono de gama media.

La duración de los capítulos requiere pruebas con jugadores. El acompañante y la biblioteca jugable se implementaron después; ver `CAPITULO_2_Y_ACOMPANANTE.md`.

## Resultado local — 2026-11-05

TypeScript y las 60 pruebas de lógica pasan. Las once suites de navegador pasaron sobre el exportado final: ocho en el recorrido principal y las tres restantes tras corregir la prueba de acercamiento al cuaderno. Los recorridos de cofre pasan en escritorio y móvil emulado. Las exportaciones web, Android e iOS terminaron correctamente; `dist/` contiene la versión web verificada. `git diff --check` no encontró errores de espacios.

El workflow está configurado, pero no se ha ejecutado en GitHub ni se han subido estos cambios. Los selectores y la hoja de compartir nativos todavía requieren pruebas en teléfonos físicos.
