# Personajes secundarios

`forest-npcs.png` contiene dos ilustraciones estáticas con transparencia, creadas con asistencia generativa usando la protagonista original como referencia de estilo: guía a la izquierda y viajero a la derecha. Se inspeccionó su distribución antes de usar dos celdas iguales; no se utiliza como animación.

La protagonista continúa usando los sprites originales descritos en `manifest.json`. El último fotograma de `idle_right` contiene una línea aislada en la columna 99; el renderizador limita su ventana de dibujo al personaje para no mostrar ese artefacto y mantiene el PNG original intacto.
