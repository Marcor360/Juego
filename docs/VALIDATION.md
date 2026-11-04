# Validación del prototipo

Ejecutada en el entorno actual con Node 24.22.1 y npm 11.9.0.

| Comprobación | Resultado |
| --- | --- |
| `npm ci --no-audit --no-fund` | Correcta; hook de CanvasKit ejecutado |
| `npm run typecheck` | Correcta |
| `npm test` | 8 pruebas aprobadas, 0 fallidas, 0 omitidas |
| `expo export --platform web` | Correcta |
| `expo export --platform android --platform ios` | Ambos bundles Hermes generados |
| Inicio de Expo sin CI, puerto 8082 | Menú mostrado en Chromium, sin errores de página |
| `tests/browser.cjs`, partida nueva | Recorrido completo aprobado |
| Mismo test desde checkpoint del viajero | Aprobado |

El recorrido automatizado comenzó en el menú, habló con la guía, recogió las tres luces (incluida la plataforma elevada), encendió ambos faroles, ayudó al viajero, ordenó las palabras, abrió el cofre y comprobó Fe y capítulos `[1,2]` en la partida. Después descargó JSON, recargó, continuó, rechazó una importación incompatible conservando la partida y restauró el archivo válido. No hubo errores JavaScript de página.

Las primeras pruebas detectaron rutas de sprites no resueltas en web y un margen de salto insuficiente en las ruinas; se corrigieron y el recorrido completo pasó después de esos cambios.

Los archivos de arte originales, `manifest.json` y `LEEME.md` permanecen sin cambios. Las dimensiones de todas las láminas y cuadros se compararon con el manifiesto; la calidad visual de sus poses sigue siendo provisional.

## Límites de esta validación

- Generar bundles Android/iOS no demuestra ejecución, persistencia ni rendimiento en dispositivos físicos. Estas pruebas siguen pendientes.
- No se ha validado la duración objetivo de 8–12 minutos mediante sesiones con jugadores.
- Los paisajes son placeholders de Skia. Falta el arte final detallado de las referencias y una auditoría de continuidad de animaciones y accesibilidad.
- La idea de Proverbios 3:5 está marcada como adaptación pendiente de verificación editorial.
- El capítulo 2 se desbloquea, pero los capítulos 2–7 aún no tienen escenarios jugables.
- Se guardaron `install_script` y `start_skill` en el borrador. No se publicó el entorno ni se validó una restauración en una tarea nueva.
