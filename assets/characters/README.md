# Arte de personajes

Los originales actuales son `v2/` (protagonista, guía, viajero y retratos) y `v3/` (caminante, personajes secundarios y guardián). El motor carga sus versiones optimizadas desde `assets/runtime/`, con recortes y anclajes de `game/rendering/art-runtime.json`.

`game/rendering/art.json` conserva la geometría de los originales para poder regenerar las versiones de ejecución. Las direcciones se reflejan en el renderizado; no se mantienen cuadros duplicados para izquierda y derecha. Los sprites segmentados de la primera iteración se retiraron por estar en desuso.

`v3/traveler.png` contiene doce poses nuevas del acompañante, sin la roca de las poses estáticas. El seguimiento usa la ruta recorrida y cada pose ancla sus propias plantas al pie físico.

`v3/cast.png` contiene las nuevas poses de cuatro NPC; `v3/cast-portraits.png` contiene sus ocho retratos de conversación. Sustituyen el dibujo de secundarios y el recorte de cabezas desde el cuerpo. La bibliotecaria ahora tiene presencia en el capítulo II.

Conversaciones ampliadas: `v3/cast.png` ahora tiene 24 poses (6 × 4); `locals.png` incluye guardabosques y aprendiz (6 × 2), con cuatro retratos en `locals-portraits.png`. `hero-talk.png` y `traveler-talk.png` aportan seis poses cada uno. Ver `docs/INTERACCIONES_Y_CONVERSACIONES.md`.
