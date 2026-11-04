# Personajes y retratos v2

Arte nuevo creado con asistencia generativa para esta aventura, tomando los diseños previos como referencia. Los PNG no se consideran automáticamente spritesheets válidos: se inspeccionaron sus distribuciones y se registraron sus celdas, límites alfa y anclajes de apoyo en `game/rendering/art.json`.

- `hero.png`: 4×3 poses. Índices 0–1 reposo/parpadeo; 2–5 marcha; 6 salto; 7 caída; 8 conversación/interacción; 9 recepción de la linterna; 10–11 celebración.
- `npcs.png`: 4×2 poses. 0–3 guía (reposo, parpadeo, conversación, saludo); 4–5 viajero desanimado; 6–7 viajero alegre y agradecido.
- `portraits.png`: 3×2 retratos. 0–1 protagonista; 2–3 guía; 4 viajero desanimado; 5 viajero alegre.

La escala de cada personaje se calcula respecto a la altura de referencia del atlas; los recortes y anclajes corrigen las diferencias de posición de las poses. Las direcciones se reflejan en el renderizado, sin duplicar el arte. Los PNG originales no se alteraron para alinearlos.
