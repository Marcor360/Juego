# Revisión del menú y próximos pasos

## Problemas encontrados y mejoras aplicadas

1. **Acciones ambiguas.** «Comenzar aventura» abría capítulos al existir una partida. Ahora una partida en curso destaca «Continuar mi camino» y separa «Diario de capítulos». Al completar el capítulo, la acción destacada invita a ver los capítulos; el regreso al bosque sigue disponible. Sin partida se ofrece comenzar, sin un botón Continuar inutilizable.
2. **Controles pequeños y diseño escalado como una imagen.** Se sustituyó el escalado global de controles por un diseño con tamaños reales: botones de al menos 44 px, tipografía legible, tarjeta flexible y desplazamiento en pantallas cortas o con textos grandes. Se conservan los tres paisajes, vestuarios y animaciones existentes. En vertical se muestra un retrato enmarcado.
3. **Progreso poco visible.** La tarjeta muestra ubicación, próxima escena y una barra accesible con el avance real del capítulo. Las recompensas migradas no inventan escenas completadas. No se muestran fechas de guardado porque el esquema no las registra.
4. **Falta de ayuda y de navegación modal.** «Cómo jugar» explica los controles detectados y las reglas básicas. Tab permanece dentro del diálogo; Escape cierra ayuda, créditos o ajustes y devuelve el foco al botón que los abrió. Al cerrar un panel dentro del juego se devuelve el foco al área de juego para que Espacio no active por accidente el botón del cuaderno. El foco inicial no desplaza los textos largos al botón de cierre; Ajustes abierto desde Pausa vuelve a Pausa. Los controles del menú quedan ocultos para lectores de pantalla mientras hay un diálogo. El foco tiene una marca visible.
5. **Ajustes perdidos antes de iniciar una partida.** Las preferencias de música, efectos y movimiento reducido se guardan en una clave independiente, validada y con escrituras ordenadas. Cerrar Ajustes mediante Volver o Escape conserva esas preferencias incluso sin partida. Los ajustes inválidos o no disponibles se notifican sin impedir recuperar una partida válida. Importar una partida conserva sus ajustes y actualiza las preferencias.
6. **Audio web al navegar rápido.** La reproducción web gestiona las promesas de inicio y sus cancelaciones al pausar o cambiar pista. Se evita el error de reproducción interrumpida sin alterar el reproductor nativo. La música espera a terminar de leer las preferencias para respetar el silencio configurado desde el arranque.
7. **Fondo de biblioteca incompleto al cambiar a vertical.** El fondo ahora tiene dimensiones explícitas para cubrir el área real de la vista previa, en lugar de depender del tamaño intrínseco de la imagen.

## Qué conviene mejorar después

| Prioridad | Mejora | Evidencia y motivo |
| --- | --- | --- |
| Resuelto | Guardar avances de cuestionarios | El reto pendiente conserva respuestas aceptadas, selección, pistas y orden. Se valida al cargar y se reabre al continuar. Ver `GUARDADO_PARCIAL_Y_RESPALDOS.md`. |
| Alta | Pruebas reales de móvil | El respaldo nativo ya usa el selector y la hoja de compartir del sistema. Falta probarlos en teléfonos físicos y medir memoria, FPS, latencia y áreas seguras. |
| Resuelto | Pruebas de interfaz en CI | El workflow instala Chromium y ejecuta dieciséis recorridos con capturas y registros. La ejecución remota queda pendiente de subir los cambios. |
| Resuelto | Movimiento y animación del acompañante | Sigue la ruta real, mantiene separación y usa doce poses nuevas de espera, caminar y salto. Ver `CAPITULO_2_Y_ACOMPANANTE.md`. |
| Jugable | Biblioteca como capítulo | Recorrido, ocho mesas, retos, guardado y recompensa del Aprendizaje integrados. Falta evaluación con jugadores y rendimiento en teléfonos físicos. |
| Media | Separar la coordinación de la pantalla principal | `app/index.tsx` concentra bucle, menús, diálogos, misiones y persistencia. Extraer paneles y coordinación facilitaría corregir fallos sin tocar toda la pantalla. |

## Verificación

- Pruebas de preferencias independientes del progreso, recuperación después de un error de escritura y resumen correcto de escenas.
- `tests/menu-browser.cjs`: tres fases, controles de 44 px, ayuda, Tab/Escape, descarga y continuación; tamaños 1280×720, 667×375, 390×844, 600×800, 320×568 y 568×320.
- `tests/menu-preferences-browser.cjs`: ajustes antes de la primera partida, persistencia tras recargar y restauración del foco.
- Regresión de las 16 escenas, controles táctiles, audio e importación/exportación.

La validación móvil del navegador es emulada; las exportaciones Android/iOS no equivalen a pruebas en teléfonos físicos.

Resultados locales: **54 pruebas aprobadas**, TypeScript y exportación web aprobados; tres variantes del menú en seis tamaños aprobadas. Se verificaron preferencias tras recargar sin partida, navegación con teclado, controles táctiles, audio, las 16 escenas en PC/móvil emulado, recuperación con almacenamiento fallido y repetición sin reemplazar la partida principal. Los bundles Android/iOS se exportan correctamente. `dist/` contiene la versión revisada.

La figura del menú conserva ahora la resolución del original en una tira de dos poses por portada, con menos memoria que la hoja reducida anterior. Los emblemas se ilustraron para cada etapa y se añadieron motas discretas. Ver `ARTE_NPC_AGUA_Y_MENU.md`.
