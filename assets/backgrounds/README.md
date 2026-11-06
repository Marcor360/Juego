# Paisajes de la aventura

`v3/` contiene seis originales: entrada, arroyo, puente, claro, niebla y refugio. `library.png` es el interior original de la biblioteca, disponible como vista previa del capítulo 2. Los menús tienen sus tres fondos actuales en `assets/menu/`.

El juego carga copias WebP optimizadas desde `assets/runtime/` y solo monta los fondos cercanos. Las colisiones pertenecen al mapa, no a las ilustraciones. El suelo y los objetos de primer plano se dibujan por separado; `assets/props/v3/foreground.png` añade follaje transparente sin tapar el centro del recorrido.

La luz cálida del claro/refugio, la neblina del tramo de niebla, el agua y las partículas se animan en capas. El ajuste de movimiento reducido detiene el balanceo, la deriva y los destellos decorativos. Los fondos antiguos de amanecer y bosque se retiraron al quedar sustituidos por este conjunto.
