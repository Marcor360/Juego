# Audio original del juego

22 recursos sintetizados con `scripts/generate-audio.py`, sin grabaciones ni muestras externas. Para regenerarlos se necesita Python, NumPy y ffmpeg; jugar utiliza los archivos ya incluidos.

- Ocho ambientes estéreo de 48 s: menú, bosque, arroyo, puente, claro, niebla, refugio y biblioteca. MP3 a 96 kb/s. Los fondos varían con ráfagas y movimiento estéreo; las aves, crujidos y páginas aparecen a intervalos irregulares. Cada lugar tiene una dirección propia: claro/refugio cálidos, puente con viento y madera, niebla más tensa y biblioteca tranquila.
- Dos pasos alternados para hierba, madera y piedra.
- Salto, caída, aterrizaje, daño, páginas, cofre, interacción y descubrimiento, en WAV mono corto.

Las pistas de lugares vecinos se solapan mediante un fundido; leer o pausar atenúa el ambiente. Música y efectos se pueden silenciar por separado y el audio se pausa en segundo plano. Los fundidos dejan de ejecutar su temporizador al llegar al volumen deseado.

Los efectos de movimiento se disparan desde sucesos físicos, no desde pulsar botones. La música web comienza tras una interacción. `audio-manifest.json` registra niveles, duración y peso. Los dos sonidos antiguos del prototipo se retiraron; la biblioteca mantiene su vista previa mientras se desarrolla su aventura.
