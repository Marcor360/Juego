# Revisión y correcciones del PR #1

PR: https://github.com/Marcor360/Juego/pull/1
Rama de trabajo: `fix/ch1-progress-performance-20261104`.

## Problemas corregidos

1. **Riesgo de perder el candidato dañado al fallar el respaldo.** La recuperación era de mejor esfuerzo, pero la siguiente escritura podía reemplazar los datos sin haberlos conservado. Ahora la escritura debe leer y proteger el valor existente antes de reemplazarlo. Se mantiene el último guardado válido, se archivan candidatos dañados distintos y una lectura o un respaldo fallidos rechazan la sobrescritura. La sesión actual sigue siendo descargable.
2. **Cámara y objetos desincronizados al cargar o reaparecer.** El recorte dependía de un sector React que solo se actualizaba jugando cada 100 ms. Al detenerse inmediatamente en un diálogo o pausa podía quedar un sector antiguo. Se sincronizan sector, zona y proximidad al restaurar y al procesar eventos de mundo, sin esperar al intervalo del HUD.
3. **Suelo lejano aún dibujado dentro de segmentos largos.** El PR descartaba segmentos completos fuera de pantalla, pero recorría todas las teselas de un segmento parcialmente visible. El renderer ahora calcula solo sus teselas próximas a la cámara, conservando los bordes reflejados y los huecos físicos.
4. **Avisos y errores de escritura poco fiables.** El aviso inicial desaparecía tras 6,5 s, incluso mientras cargaban imágenes; la salida al menú anunciaba éxito aunque fallara la escritura. Los avisos importantes requieren cierre explícito y la salida distingue guardado local de progreso disponible solo en la sesión. Se capturan los rechazos al guardar ajustes.
5. **Tipado DOM/Node después de incorporar el nuevo menú.** La prueba de recursos del menú utilizaba `URL` global en llamadas de `node:fs`; se importa la variante de `node:url` para evitar el error de TypeScript observado.

## Integración y arte

Se incorporó `main` en la rama del PR y se resolvió el conflicto del renderer conservando los tres menús, vestuarios, paisajes y diseño vertical recientes. No faltaban imágenes para este alcance: se comprobaron las portadas y los seis fondos del bosque, incluidos suelo, plataformas y personajes, sin agregar recursos redundantes.

Los diálogos, las preguntas bíblicas y su evaluación no se modificaron.

## Evidencia

- `npm run typecheck`: aprobado.
- `npm test`: 39 pruebas aprobadas, incluidas recuperación con errores de almacenamiento, serialización/reintentos, fondos y tiempo físico.
- `npm run build:web`: aprobado.
- Exportación de bundles Android e iOS: aprobada.
- `tests/browser-v3.cjs`: las 16 escenas, descarga/importación y controles de escritorio y web táctil aprobados.
- `tests/menu-browser.cjs`: tres variantes en cuatro tamaños, incluidos teléfonos verticales; aprobado.
- `tests/stability-browser.cjs`: recuperación real en navegador, respaldo fallido sin sobrescritura, descarga de la sesión reciente, aviso persistente, tutorial completado con controles táctiles lejos del libro y capturas de seis zonas pausadas tras saltos de checkpoint; aprobado.

La igualdad de movimiento a 5–120 FPS se comprueba en una simulación de pasos; no representa una medición de FPS en un dispositivo. Siguen pendientes pruebas en teléfonos físicos y la carga/liberación diferida de texturas. El estado de GitHub Actions debe leerse en los checks remotos del PR; la lista anterior describe validación local.
