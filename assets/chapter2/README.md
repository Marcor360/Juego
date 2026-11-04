# Arte y audio de la biblioteca

Recursos originales creados para este proyecto con asistencia generativa, sin imágenes extraídas de otros videojuegos. Los personajes conservan la identidad visual de la protagonista y una vestimenta coherente con el diseño del capítulo. La portada intermedia con pantalón de vestir permanece en `assets/menu/`.

Ocho atlas: protagonista (24 pasos), acciones (9 poses), NPC narrativos (24 poses), visitantes (16 poses), retratos (9), muebles (8), objetos (8) y módulos de suelo/decoración (8). La fachada y el paisaje del balcón son imágenes independientes. La fachada se utiliza únicamente en el patio; los interiores se construyen con módulos y mobiliario separado.

`game/chapter2/art/manifest.json` registra los recortes reales. Para recalcularlos después de sustituir una imagen: `python scripts/register-chapter2-art.py` (requiere Pillow). El script analiza transparencia y dimensiones; no modifica las imágenes. El render usa muestreo por vecino más cercano.

Los cinco temas y cinco efectos WAV son síntesis original, sin muestras ni grabaciones externas. Pueden reproducirse con `python scripts/generate-library-audio.py` (biblioteca estándar de Python).

Las referencias y el estado de su comprobación se documentan en `docs/CHAPTER_2_EDITORIAL.md`.

Dirección vigente: [Biblia negra, biblioteca natural y arte sin símbolos ornamentales](../../docs/ART_DIRECTION.md). El edificio y mobiliario usan nogal, piedra crema, pizarra y salvia; la lavanda queda como acento de vestuario/interfaz.
