# Guía rápida del juego actual

El proyecto activo es una aventura Expo/React Native con Skia. Las instrucciones de ejecución y las pruebas están en [README.md](README.md).

- `assets/runtime/`: imágenes y fuentes optimizadas que carga el juego.
- `assets/characters/v2/` y `v3/`: originales de los atlas actuales, con metadatos de recortes y anclajes en `game/rendering/art.json`.
- `assets/backgrounds/v3/`, `assets/backgrounds/library.png`, `assets/menu/` y `assets/props/`: originales actuales para regenerar las versiones compactas.
- `assets/sounds/`: ocho ambientes y efectos de movimiento/interacción, generados por el script incluido.
- `scripts/`: registro, optimización, inventario y generación de audio. No son necesarios para ejecutar recursos ya incluidos.

Se retiró el paquete antiguo de cuadros individuales y hojas segmentadas, junto con su manifiesto, porque ya no pertenece al renderizador actual. El listado de archivos retirados está en `docs/REMOVED_ASSETS.json`. El guardado y su migración siguen en `game/save/`; retirar arte antiguo no elimina las partidas.

El bosque incluye indicaciones del siguiente destino y el viajero tiene animaciones propias. El capítulo II ya es jugable desde el diario cuando está desbloqueado: ocho mesas, retos, guardado y recompensa del Aprendizaje. Ver [cómo entrar y compilar en Windows](docs/CAPITULO_2_Y_ACOMPANANTE.md).
