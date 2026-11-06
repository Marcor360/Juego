# Revisión de controles y suelo · 5 de noviembre de 2026

## Correcciones

- La plataforma web no identifica por sí sola si se juega en teléfono o PC. Se detecta el puntero principal con `pointer: coarse` y se escucha el uso real de pantalla táctil, ratón y teclado. Android/iOS comienzan en modo táctil. Cambiar de entrada libera el movimiento anterior.
- Las flechas, salto e interacción táctil se muestran únicamente en modo táctil. El tutorial, cuaderno, pausa y aviso de proximidad usan instrucciones adecuadas. El botón de interacción táctil muestra ◇, sin exigir la tecla E.
- Caminar y saltar usan eventos táctiles independientes: un segundo dedo no necesita obtener el responder del primero. El salto se solicita al tocar, sin repetirlo al soltar. Se libera cada dirección al terminar o cancelar su toque.
- Soltar A/D con mayúsculas también detiene el movimiento.
- En pantallas estrechas, Cuaderno, Inventario y Pausa se muestran como iconos de al menos 44 px, conservando los nombres accesibles. La ayuda inicial es más breve para no cubrir el terreno.
- Las plataformas dibujan su superficie pisable exactamente en la altura usada por las colisiones. Musgo, postes y cuerdas sobresalen por encima; la base queda debajo. Los letreros y ramas utilizan su propio anclaje inferior, sin compartir una altura media con objetos distintos. Los metadatos y su script de registro conservan estas referencias.

## Pendientes encontrados, en orden recomendado

1. **Rendimiento móvil:** los seis fondos se cargan en `Scene.tsx` aunque solo se dibujen los próximos. Implementar carga y liberación de texturas por zonas; medir memoria, FPS y tiempo de arranque en teléfonos reales antes de elegir la optimización de imágenes.
2. **Reanudar cuestionarios:** `ChallengePanel.tsx` conserva el paso y las respuestas aceptadas solo en estado local React. Guardar ese avance con validación y migración permitiría continuar después de cerrar el panel o la aplicación.
3. **Validación física:** probar Android/iOS reales, gestos del sistema, cambios de orientación, áreas seguras y multitáctil. La emulación de Chromium no acredita el comportamiento de dispositivos nativos.
4. **Pruebas integrales y CI:** automatizar Playwright en CI y completar una partida humana continua. Las pruebas actuales de las 16 escenas cargan partidas preparadas entre escenas.
5. **Contenido y publicación:** el capítulo 2 se desbloquea pero su aventura aún no existe; faltan los capítulos 2–7. También están pendientes las pruebas de duración con jugadores, revisión editorial y compilaciones firmadas/publicación.

## Verificación

- `npm run typecheck`, `npm test` y `npm run build:web`.
- `tests/art.test.ts`: alineación entre superficie gráfica y colisión; bases individuales de objetos del suelo.
- `tests/controls-browser.cjs`: PC grande/pequeño, móvil horizontal/vertical, botones dentro de pantalla, instrucciones, dos dedos y cambio automático de entrada.
- `tests/browser-v3.cjs`: tutorial, 16 escenas, importación/exportación, niebla y controles de PC/móvil emulado.
- `tests/graphics-browser.cjs` y `tests/chest-browser.cjs`: comprobaciones visuales y apertura del cofre.

Resultados locales: 41 pruebas de lógica aprobadas; TypeScript, exportación web y exportaciones de bundles Android/iOS aprobadas. Controles aprobados en cuatro configuraciones, revisión gráfica en cuatro tamaños y cofre aprobado en escritorio y móvil emulado. Las exportaciones nativas no son una prueba en dispositivos físicos ni generan aplicaciones firmadas.

La ejecución final de `tests/browser-v3.cjs` aprobó las 16 escenas en escritorio y móvil emulado, exportación/importación, rechazo de partidas inválidas y controles en la niebla, sin errores de página ni recursos fallidos.
