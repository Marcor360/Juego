# PROMPT MAESTRO DE DESARROLLO
# EL CAMINO DE UNA PRECURSORA
## CAPÍTULO 2 — LA BIBLIOTECA DEL APRENDIZAJE
### Desarrollo integral: arte, programación, exploración RPG, narrativa, desafíos, sistemas y pruebas

---

# 0. INSTRUCCIÓN PRINCIPAL

Actúa como un equipo profesional de desarrollo de videojuegos integrado por:

- Director creativo y Game Designer.
- Desarrollador senior de React Native, Expo y TypeScript.
- Ingeniero especializado en motores de videojuegos 2D.
- Especialista en React Native Skia.
- Diseñador de niveles y escenarios RPG.
- Artista técnico especializado en pixel art.
- Diseñador de personajes y animaciones.
- Diseñador UX/UI de videojuegos.
- Guionista narrativo.
- Diseñador de mecánicas educativas.
- Ingeniero de sistemas de guardado.
- Especialista en pruebas automatizadas y rendimiento.

Tu misión es **desarrollar completamente el segundo capítulo del videojuego «El camino de una Precursora»**, llamado:

# LA BIBLIOTECA DEL APRENDIZAJE

No debes limitarte a escribir documentación, crear una maqueta, generar imágenes aisladas o implementar un pequeño prototipo.

Debes construir un capítulo verdaderamente jugable, con arte original, movimiento, exploración, personajes animados, conversaciones, misiones, investigaciones, objetos, desafíos y una conclusión funcional.

El capítulo debe integrarse en el videojuego existente, respetando las decisiones arquitectónicas del proyecto y conservando íntegramente el capítulo 1.

**Objetivo de entrega:** un capítulo 2 funcional de principio a fin, disponible en web, Android e iOS mediante el proyecto existente.

## Repositorio

Repositorio existente:

`Marcor360/Juego`

Antes de realizar cualquier cambio:

1. Inspecciona la rama `main` actualizada.
2. Revisa el `README.md` y la documentación técnica.
3. Identifica las dependencias instaladas.
4. Analiza el motor de movimiento, renderizado y animaciones.
5. Revisa el sistema de misiones.
6. Analiza los diálogos y cuestionarios existentes.
7. Examina el sistema de guardado y las migraciones.
8. Revisa el inventario y desbloqueo de capítulos.
9. Consulta las pruebas automatizadas existentes.
10. Comprueba las ramas y PR abiertos para evitar conflictos.

No asumas que el repositorio sigue exactamente igual que en una conversación anterior.

### Restricciones importantes

- NO reconstruir el proyecto desde cero.
- NO eliminar el capítulo 1.
- NO modificar arbitrariamente los diálogos del capítulo 1.
- NO sustituir el sistema de guardado sin migrar las partidas existentes.
- NO romper la compatibilidad con web y móvil.
- NO introducir elementos visuales de estilos incompatibles.
- NO simular funciones que deberían ser interactivas.
- NO utilizar imágenes con marcas de agua.
- NO descargar y reutilizar arte protegido de otros videojuegos.
- NO copiar la interfaz, logotipos ni recursos gráficos de Pokémon o JW Library.
- NO agregar anuncios, cuentas ni compras.
- NO fusionar cambios directamente con `main`.

Crea una rama de desarrollo específica, por ejemplo:

`feat/chapter2-library-rpg`

Implementa los cambios en esa rama y prepara un PR hacia `main`.

Si el alcance requiere varios commits, organízalos de forma coherente. No entregues un PR que únicamente contenga documentación y componentes incompletos.

---

# 1. CONTEXTO NARRATIVO

## 1.1. El videojuego

«El camino de una Precursora» es una aventura de siete capítulos inspirada en el crecimiento espiritual de una joven que está por graduarse de la Escuela del Servicio de Precursor de los Testigos de Jehová.

La historia presenta dificultades simbólicas, decisiones, amistades, aprendizajes y situaciones que permiten reflexionar sobre principios bíblicos.

Los capítulos son:

1. El bosque de las dudas — Fe.
2. La biblioteca del aprendizaje — Conocimiento.
3. El puente del valor — Valentía.
4. La tormenta del desánimo — Perseverancia.
5. Los amigos del camino — Buenas amistades.
6. El valle del perdón — Perdón.
7. El tesoro del camino — Todas las herramientas.

El capítulo 2 se desbloquea después de completar el capítulo 1.

El capítulo 3 solamente debe desbloquearse cuando se termine completamente el capítulo 2.

No mostrar anticipadamente el desenlace final del capítulo 7.

## 1.2. Continuidad

En el capítulo 1, la protagonista atravesó un bosque, enfrentó situaciones que le produjeron miedo, ayudó a un viajero y obtuvo una pequeña linterna como representación simbólica de la Fe.

Ahora llega a una gran biblioteca situada dentro del refugio.

Descubrirá que el conocimiento implica:

- Investigar.
- Escuchar.
- Comprender.
- Comprobar información.
- Identificar fuentes confiables.
- Reconocer información irrelevante.
- Examinar razonamientos engañosos.
- Explicar con respeto.
- Admitir cuando todavía desconoce una respuesta.
- Utilizar las Escrituras para ayudar a los demás.

La biblioteca debe sentirse como un lugar lleno de posibilidades y descubrimientos.

No será simplemente un edificio con preguntas de opción múltiple.

La protagonista debe explorar sus instalaciones, encontrar personajes, realizar actividades, comprender problemas y aprender de sus experiencias.

## 1.3. Tema principal

**El conocimiento es valioso cuando se busca cuidadosamente, se comprende y se utiliza para hacer el bien.**

El capítulo estará fundamentado en principios bíblicos de la Traducción del Nuevo Mundo y en información verificable de JW.ORG.

Todo diálogo creado para el juego será original.

Distingue claramente entre:

- Cita bíblica textual.
- Referencia bíblica.
- Explicación de un principio.
- Diálogo ficticio.
- Reflexión adaptada para el videojuego.

No inventar citas bíblicas.

No copiar indiscriminadamente capítulos completos ni grandes cantidades de texto de publicaciones.

Siempre que una actividad dependa de un texto bíblico, verificar la referencia y su contexto en JW.ORG.

---

# 2. IDENTIDAD VISUAL DEL CAPÍTULO

## 2.1. Estilo general

El videojuego utiliza pixel art 2D detallado.

El capítulo 2 conservará esa identidad, pero se diferenciará del bosque mediante una biblioteca de enormes dimensiones.

Referencias estéticas:

- RPG retro de 16 bits.
- Interiores acogedores.
- Escenarios con perspectiva superior de tres cuartos.
- Exploración de cuatro direcciones.
- Colores cálidos y pastel.
- Iluminación ambiental.
- Profundidad mediante capas.
- Personajes pixel art expresivos.
- Animaciones ambientales discretas.

La referencia a los RPG clásicos, como los primeros videojuegos de Pokémon, es exclusivamente para explicar la perspectiva y la forma de exploración.

No copiar sprites, mapas, diseños, personajes ni interfaces de esos videojuegos.

## 2.2. Paleta

Utilizar una paleta consistente.

Colores principales:

- Lavanda: `#A68EBE`
- Morado oscuro: `#393344`
- Rosa pastel: `#E8B8C8`
- Crema: `#F8EBD6`
- Dorado: `#E6BF78`
- Madera oscura: `#604638`
- Madera clara: `#AD805C`
- Azul profundo: `#344F65`
- Verde salvia: `#8FA99B`
- Blanco cálido: `#FFF7E9`

Los colores pueden ajustarse para mejorar contraste, pero deben mantenerse dentro de una estética coherente.

Evitar colores excesivamente saturados o iluminación artificial incompatible con el pixel art.

## 2.3. Iluminación

La biblioteca tendrá:

- Ventanas altas.
- Luz dorada entrando por las ventanas.
- Sombras suaves.
- Pequeños faroles.
- Lámparas de escritorio.
- Destellos de polvo suspendido.
- Zonas parcialmente iluminadas.
- Pasillos más oscuros.
- Reflejos discretos sobre el suelo.

El sistema debe permitir reducir los efectos ambientales desde Ajustes.

No utilizar efectos tan intensos que dificulten distinguir puertas, personajes o elementos interactivos.

---

# 3. NUEVA PERSPECTIVA DEL VIDEOJUEGO

## 3.1. Cambio respecto al bosque

El capítulo 1 es una aventura lateral de plataformas.

El capítulo 2 será un RPG de exploración 2D con vista superior de tres cuartos.

El personaje podrá moverse:

- Hacia arriba.
- Hacia abajo.
- Hacia la izquierda.
- Hacia la derecha.

Debe poder desplazarse libremente alrededor de muebles, escritorios, estanterías y personajes.

La cámara seguirá su posición horizontal y vertical.

## 3.2. Profundidad

Aunque el juego siga siendo 2D, deberá transmitir la sensación de profundidad.

Implementa:

- Orden de dibujo basado en la posición vertical del personaje.
- Ocultación parcial detrás de objetos altos.
- Colisiones en X e Y.
- Separación entre suelo, mobiliario y elementos superiores.
- Puertas que conducen a diferentes habitaciones.
- Escaleras que conectan distintas plantas.
- Transiciones entre pisos.
- Diferentes alturas visuales.
- Sombras de contacto.
- Objetos interactivos con una zona de activación.

Ejemplo:

Si la protagonista pasa detrás de una estantería alta, parte de su cuerpo debe quedar oculta.

Si camina delante de ella, la protagonista debe dibujarse por encima del mueble.

Los elementos altos deben contar con una zona de colisión y una zona visual independientes.

## 3.3. Arquitectura del movimiento

No modificar la física lateral del capítulo 1 para convertirla en un motor de cuatro direcciones.

Crear una implementación independiente para exploración RPG.

Puede compartir:

- Entrada del jugador.
- Animaciones.
- Audio.
- Inventario.
- Guardado.
- Eventos.
- Diálogos.
- Sistema de misiones.

El motor RPG tendrá:

- Posición X/Y.
- Velocidad normalizada.
- Movimiento diagonal, si resulta apropiado.
- Colisiones con paredes.
- Colisiones con objetos.
- Interacciones con NPC.
- Detección de puertas.
- Zonas de transición.
- Cámara bidimensional.
- Orientación del personaje.
- Profundidad visual.
- Trayectorias para NPC.

Utilizar un bucle de actualización estable y evitar que la velocidad del personaje dependa de los FPS.

La velocidad diagonal no debe ser mayor que la horizontal o vertical.

## 3.4. Controles

### Computadora

- W o flecha arriba: subir.
- S o flecha abajo: bajar.
- A o flecha izquierda: izquierda.
- D o flecha derecha: derecha.
- E o Enter: interactuar.
- J: abrir diario.
- I: inventario.
- M: mapa.
- Esc: pausa.

### Móvil

Implementar una cruceta direccional o joystick virtual.

Agregar botones independientes para:

- Interactuar.
- Diario.
- Inventario.
- Mapa.
- Pausa.

La zona de controles debe ser accesible y no debe cubrir el objetivo principal.

La interfaz debe funcionar en orientación horizontal. Considerar también pantallas pequeñas y áreas seguras.

## 3.5. Tamaño del mundo

Mantener una resolución lógica compatible con el sistema actual, tomando 480 × 270 píxeles como referencia inicial.

Utilizar tiles de 16 × 16 píxeles.

Los mapas podrán ser mayores que la pantalla visible.

No crear todo el edificio como una sola imagen gigantesca.

Construirlo mediante:

- Tilesets.
- Capas.
- Habitaciones.
- Objetos individuales.
- Atlas de sprites.
- Mapas de colisión.
- Zonas de navegación.

El escenario debe poder ampliarse sin rehacer el motor.

---

# 4. DISEÑO COMPLETO DE LA BIBLIOTECA

## 4.1. Organización general

La biblioteca estará dividida en seis regiones principales, con habitaciones conectadas y diferentes pisos.

### Región 1 — Vestíbulo principal

Contiene:

- Entrada desde el refugio.
- Mostrador.
- Mesa de bienvenida.
- Grandes ventanas.
- Bancos.
- Plantas.
- Mapas.
- Reloj.
- Puerta hacia el catálogo.
- Viajero del capítulo anterior.
- Bibliotecaria.

Función narrativa:

Presentar la biblioteca y explicar por qué la protagonista desea seguir aprendiendo.

Escenas:

01 y 02.

### Región 2 — Catálogo y estanterías

Contiene:

- Grandes estanterías.
- Ficheros de referencias.
- Mesas de clasificación.
- Escaleras.
- Balcones.
- Elevador de libros.
- Puertas.
- Pequeños mecanismos.
- Archivos.

Función:

Aprender a encontrar libros y referencias.

Escenas:

03 y 04.

### Región 3 — Investigación

Contiene:

- Escritorios individuales.
- Biblias y ayudas de estudio.
- Lámparas.
- Mapas.
- Cuadernos.
- Sala de investigación.
- Pasillo sin iluminación.
- Interruptores.

Función:

Comprobar afirmaciones, estudiar ejemplos y utilizar la Fe.

Escenas:

05, 06 y 07.

### Región 4 — Sala de visitantes

Contiene:

- Mesas de conversación.
- Sillas.
- Ventanas.
- Fichas bíblicas.
- Pequeña sala de lectura.
- Biblioteca de consulta.

Personajes:

Visitante y estudiante.

Función:

Aprender a escuchar, investigar y explicar.

Escenas:

08, 09, 10 y 11.

### Región 5 — El laberinto de las ideas

Será una sección especialmente importante.

Contiene:

- Pasillos entre estanterías.
- Secciones de historia.
- Secciones de ciencia.
- Secciones de filosofía.
- Secciones de literatura.
- Secciones de religión.
- Comentarios personales.
- Documentos sin referencias.
- Libros de consulta.
- Puertas interiores.
- Carritos móviles.
- Paneles de información.
- Un investigador visitante.
- Acceso a la sala tranquila.

Función:

Aprender discernimiento, reconocer información irrelevante y evaluar argumentos.

Escenas:

12 y 13.

### Región 6 — Archivo superior y gran sala

Contiene:

- Escaleras.
- Ascensor.
- Pasillos elevados.
- Balcones.
- Plataformas de acceso.
- Mecanismos de apertura.
- Gran mesa central.
- Biblioteca monumental.
- Ventanas altas.
- Mesa del reto final.
- Puerta hacia el balcón exterior.

Función:

Superar los últimos obstáculos, demostrar conocimientos y ordenar los 66 libros.

Escenas:

14, 15 y 16.

## 4.2. Conexiones

Crear un mapa navegable real.

No usar transiciones ficticias donde el personaje desaparezca sin explicación.

Las puertas deben tener:

- Identificador.
- Habitación de origen.
- Habitación de destino.
- Posición de aparición.
- Dirección inicial.
- Condición de desbloqueo.
- Estado visual.

Las escaleras y ascensores deberán conectar pisos y conservar el progreso.

La cámara podrá cambiar de habitación suavemente.

## 4.3. Minimapa

Agregar un mapa de la biblioteca consultable desde el diario.

Mostrar:

- Habitación actual.
- Salas descubiertas.
- Puertas desbloqueadas.
- Escaleras.
- Objetivo actual.
- Lugares importantes visitados.

No mostrar automáticamente habitaciones secretas que todavía no han sido exploradas.

---

# 5. CREACIÓN DE TODO EL ARTE NECESARIO

Este apartado es obligatorio.

No entregar únicamente rectángulos, colores planos o formas geométricas como escenario final.

Debes generar recursos visuales originales y coherentes.

## 5.1. Auditoría de recursos existentes

Antes de crear nuevo arte, inspecciona:

- `assets/characters`
- `assets/backgrounds`
- `assets/props`
- `assets/sheets`
- `assets/frames`
- `game/rendering/art.json`
- Componentes de animación y renderizado.

Reutiliza los recursos compatibles.

No reemplaces la protagonista aprobada por otro personaje.

## 5.2. Protagonista

Conservar su identidad:

- Cabello largo, oscuro y rizado.
- Lentes redondos plateados.
- Accesorio floral blanco.
- Blusa azul pastel.
- Falda en tonos rosa/lavanda.
- Zapatos claros.
- Collar floral discreto.
- Mochila pequeña con libros.

Respetar el diseño definitivo que esté aprobado en los recursos activos del repositorio.

### Sprites adicionales obligatorios

La nueva perspectiva requiere animaciones que el motor lateral del bosque no necesariamente incluye.

Crear:

**Reposo**

- Mirando abajo.
- Mirando arriba.
- Mirando izquierda.
- Mirando derecha.

**Caminar**

- Abajo: 6 fotogramas.
- Arriba: 6 fotogramas.
- Izquierda: 6 fotogramas.
- Derecha: 6 fotogramas.

**Interactuar**

- Abrir libro.
- Leer.
- Señalar.
- Tomar objeto.
- Activar mecanismo.
- Encender linterna.
- Escribir.
- Pensar.
- Celebrar.

**Expresiones**

- Curiosidad.
- Alegría.
- Confusión.
- Concentración.
- Sorpresa.
- Reflexión.
- Tranquilidad.

Crear retratos pixel art para los diálogos.

Todos los sprites deberán conservar proporciones, escala y paleta.

No producir spritesheets con tamaños de celdas inconsistentes.

## 5.3. Personajes secundarios

Crear arte para:

### Bibliotecaria

Mujer adulta de apariencia amable, ropa formal y tonos lavanda/crema.

Personalidad visual:

- Serena.
- Cercana.
- Expresiva.
- Inteligente.
- Amable.

Animaciones:

- Reposo.
- Caminar.
- Hablar.
- Leer.
- Señalar.
- Entregar objeto.

### Auxiliar de la biblioteca

Persona encargada de mecanismos y accesos.

Animaciones:

- Reposo.
- Caminar.
- Revisar mecanismo.
- Señalar.
- Hablar.

### Visitante

Persona curiosa que plantea preguntas y objeciones de buena fe.

Animaciones:

- Reposo.
- Sentarse.
- Pensar.
- Hablar.
- Alegría.

### Estudiante

Joven que necesita ayuda para comprender textos.

Animaciones:

- Reposo.
- Leer.
- Preguntar.
- Pensar.
- Agradecer.

### Investigador

Persona con interés en distintas ideas y fuentes de información.

No representarlo como un antagonista malvado.

Su función es plantear cuestionamientos razonables que ayuden a la protagonista a pensar.

Animaciones:

- Reposo.
- Consultar libros.
- Examinar documentos.
- Preguntar.
- Reflexionar.
- Sonreír.

### Viajero del capítulo 1

Reutilizar su diseño y darle una adaptación coherente a la nueva perspectiva.

No cambiar su identidad visual.

## 5.4. Tilesets

Crear tilesets originales de:

- Suelo de madera.
- Suelo de piedra.
- Alfombras.
- Paredes.
- Columnas.
- Escaleras.
- Balcones.
- Barandales.
- Ventanas.
- Puertas.
- Estanterías.
- Libreros.
- Mesas.
- Sillas.
- Bancos.
- Plantas.
- Lámparas.
- Relojes.
- Archivadores.
- Carteles.
- Cajas.
- Esculturas decorativas.
- Libros.
- Cuadernos.
- Papeles.
- Mecanismos.
- Ascensor.
- Carritos de libros.

Los objetos deben tener límites de colisión separados de sus representaciones visuales.

## 5.5. Elementos interactivos

Crear recursos específicos para:

- Libro cerrado.
- Libro abierto.
- Biblia.
- Ficha de referencia.
- Tarjeta bíblica.
- Documento verificado.
- Documento pendiente de verificar.
- Nota personal.
- Estantería bloqueada.
- Estantería desbloqueada.
- Interruptor apagado.
- Interruptor encendido.
- Linterna de Fe apagada/encendida.
- Ascensor detenido/activo.
- Puerta cerrada/abierta.
- Cofre de recompensa.
- Cuaderno de Conocimiento.

Cada objeto deberá tener los estados visuales necesarios para su mecánica.

## 5.6. Efectos

Crear:

- Polvo ambiental.
- Luz de ventana.
- Brillo de interacción.
- Animación de apertura de puertas.
- Luz de linterna.
- Partículas de descubrimiento.
- Destello de objetivo completado.
- Animación de logro.
- Animación de intercambio de tarjetas.
- Animación de victoria.
- Efecto de iluminación de la herramienta Conocimiento.

Evitar efectos excesivos.

## 5.7. Pantallas especiales

Crear arte para:

1. Presentación del capítulo.
2. Mapa de la biblioteca.
3. Cuaderno de investigación.
4. Panel de diálogo.
5. Panel de preguntas.
6. Inventario.
7. Pantalla de pausa.
8. Selección de dificultad.
9. Reto de los 66 libros.
10. Tiempo agotado.
11. Reto completado.
12. Obtención del Conocimiento.
13. Desbloqueo del capítulo 3.

Los textos, botones y contadores deben ser elementos reales de React Native.

No dibujarlos dentro de imágenes estáticas.

## 5.8. Método de generación artística

Utiliza las herramientas de generación de imágenes disponibles en tu entorno si permiten producir recursos adecuados para videojuegos.

Si no existe una herramienta de generación visual, crea un pipeline de arte pixelado mediante Python/Pillow u otras herramientas locales compatibles.

El pipeline debe producir archivos PNG reales con:

- Fondo transparente cuando corresponda.
- Resoluciones definidas.
- Paleta controlada.
- Bordes pixelados nítidos.
- Atlases consistentes.
- Metadatos.
- Coordenadas de fotogramas.
- Puntos de anclaje.
- Estados de animación.

No dependas de capturas o imágenes remotas para que el juego funcione.

Si un recurso provisional no alcanza la calidad requerida, identifícalo como provisional y continúa implementando su mecánica. No afirmes que el arte es definitivo si todavía necesita revisión.

### Prompts de dirección artística para generación

**Escenario principal:**

"Original polished 16-bit pixel art top-down three-quarter-view fantasy library interior for a cozy indie RPG. Beautiful wooden bookshelves, warm golden afternoon sunlight, lavender tapestries, wooden floors, ornate reading tables, books, arched windows, small plants, detailed hand-crafted pixel textures, coherent tiled perspective, warm atmospheric depth, no characters, no typography, no UI, no copyrighted game assets."

**Archivo superior:**

"Original 16-bit pixel art RPG library upper floor, top-down three-quarter perspective, wooden balconies, railings, tall bookshelves, staircases, a mechanical book elevator, cozy golden lanterns, dark wooden floor, lavender and cream decorations, seamless tile-compatible architecture, clean readable walkways, no characters, no text."

**Laberinto de las ideas:**

"Detailed original pixel art RPG library maze, top-down three-quarter perspective, multiple interconnected bookshelves and narrow walkable passages, science and history sections, philosophy books, reading desks, scattered documents, cozy mysterious lighting, warm and violet color palette, believable navigation spaces, clean pixel grid, no characters, no text."

**Gran sala final:**

"Magnificent original 16-bit pixel art library great hall in three-quarter overhead RPG view, vast illuminated bookshelves, tall windows, warm golden light rays, large ceremonial wooden table for a 66-card Bible book sorting challenge, elegant lavender decorations, beautiful cozy atmosphere, playable walkable floor, no characters, no text, no interface."

La dirección artística es una referencia de producción. Adapta las instrucciones a la herramienta real de generación y verifica el resultado.

## 5.9. Organización de recursos

Crear una estructura similar a:

`assets/chapter2/characters/`

`assets/chapter2/tilesets/`

`assets/chapter2/backgrounds/`

`assets/chapter2/props/`

`assets/chapter2/ui/`

`assets/chapter2/effects/`

`assets/chapter2/audio/`

`assets/chapter2/portraits/`

Crear también:

`game/chapter2/art-manifest.json`

Cada recurso debe registrar:

- Identificador.
- Ruta.
- Dimensiones.
- Tipo.
- Tamaño de celda.
- Fotogramas.
- Estado.
- Punto de anclaje.
- Licencia/origen.
- Versión.

Crear una hoja de presentación visual de los sprites y escenarios para facilitar su revisión.

---

# 6. MECÁNICAS GENERALES DEL CAPÍTULO

## 6.1. Exploración

El jugador deberá:

- Recorrer habitaciones.
- Abrir puertas.
- Subir y bajar escaleras.
- Utilizar ascensores.
- Hablar con personajes.
- Leer documentos.
- Recoger fichas.
- Activar mecanismos.
- Consultar el mapa.
- Abrir el inventario.
- Resolver actividades.
- Investigar referencias bíblicas.

## 6.2. Misiones

Implementar 16 escenas:

`CH2_01` a `CH2_16`.

Cada escena deberá tener:

- Identificador.
- Título.
- Descripción.
- Localización.
- Personajes.
- Diálogos.
- Objetivos.
- Condiciones previas.
- Acciones necesarias.
- Preguntas.
- Respuestas.
- Pistas.
- Consecuencias.
- Recompensas.
- Estado completado.
- Checkpoint, si aplica.

No marcar misiones completadas solamente por abrir o cerrar un panel.

Utilizar eventos del mundo y verificaciones explícitas.

## 6.3. Misiones no bloqueantes

Evitar los problemas identificados en el capítulo 1.

Nunca dejar una misión imposible de completar porque un NPC desapareció, un objeto quedó detrás de una puerta cerrada o una transición eliminó un estado requerido.

Todas las actividades obligatorias deben tener una ruta alcanzable.

Si el jugador cierra un cuestionario, debe poder retomarlo.

Si se reinicia el juego, los objetos completados no deben reaparecer incorrectamente.

Los personajes cambiarán sus diálogos según el estado de la misión.

## 6.4. Sistema de salud

Mantener tres corazones.

El daño solamente se aplicará en situaciones físicas concretas, por ejemplo:

- Caer por una zona insegura.
- Chocar con un mecanismo móvil peligroso.
- Entrar en un área restringida con obstáculos.

La mayor parte de la biblioteca será segura.

No descontar salud por responder incorrectamente.

Al perder los tres corazones, recuperar el último checkpoint conservando el progreso narrativo.

## 6.5. Checkpoints

Definir:

- Checkpoint inicial: vestíbulo.
- Checkpoint 1: archivo intermedio, después de la escena 04.
- Checkpoint 2: investigación, después de la escena 09.
- Checkpoint 3: sala tranquila, escena 13.
- Checkpoint 4: acceso a la gran sala.

El estado de los NPC y las puertas debe recuperarse correctamente.

---

# 7. SISTEMA DE PREGUNTAS Y RESPUESTAS

Crear un sistema de desafíos reutilizable para todos los capítulos.

Debe admitir:

- Selección única.
- Selección múltiple.
- Ordenamiento.
- Clasificación.
- Relación de elementos.
- Investigación por etapas.
- Diálogo con opciones.
- Conversaciones ramificadas.
- Respuestas condicionales.
- Reflexiones sin calificación.
- Tarjetas arrastrables.
- Intercambio de posiciones.
- Pistas.
- Reintentos.

## 7.1. Aleatorización obligatoria

El orden de las opciones correctas nunca debe depender de una posición fija.

Ejemplo:

No validar mediante:

`selectedIndex === 1`

Validar mediante:

`selectedOptionId === correctOptionId`

Mezclar las opciones mediante Fisher-Yates o un método equivalente.

La aleatorización también debe aplicarse al orden de preguntas independientes.

No mezclar preguntas dependientes de una respuesta anterior de manera que se rompa el sentido narrativo.

Cada intento debe utilizar una semilla registrable.

Al reanudar un intento interrumpido, debe conservarse la misma selección y el mismo orden.

## 7.2. Retroalimentación

No utilizar únicamente un mensaje genérico como:

"Respuesta incorrecta".

Cada pregunta deberá tener:

- Explicación de la respuesta adecuada.
- Explicación de por qué una alternativa no corresponde.
- Pista opcional.
- Posibilidad de volver a intentar.
- Referencia de estudio, cuando corresponda.

No mostrar una reprimenda espiritual.

No evaluar la fe o espiritualidad de una persona por su puntuación.

## 7.3. Guardado de cuestionarios

Guardar:

- Preguntas seleccionadas.
- Orden generado.
- Opciones mostradas.
- Respuestas aceptadas.
- Paso actual.
- Pistas utilizadas.
- Estado de finalización.
- Versión del banco de preguntas.

Una interrupción no debe obligar a repetir todo el cuestionario.

---

# 8. GUION DEFINITIVO DEL CAPÍTULO 2

Los siguientes textos serán el contenido narrativo base del juego.

Pueden ajustarse únicamente para corregir ortografía, evitar incoherencias y adaptarse al espacio de los cuadros de diálogo.

No cambiar el propósito doctrinal ni reemplazar las escenas por explicaciones genéricas.

## ESCENA 01 — UNA PUERTA AL CONOCIMIENTO

**Ubicación:** vestíbulo.

**Personajes:** precursora y viajero del capítulo 1.

### Diálogo inicial

VIAJERO:
"¡Qué sorpresa verte aquí! Pensé que después de atravesar el bosque querrías descansar".

PRECURSORA:
"Lo hice un rato, pero cuando supe que había una biblioteca, no pude resistirme".

VIAJERO:
"¿Vienes a buscar algo en especial?".

PRECURSORA:
"Quiero aprender a investigar mejor. A veces recuerdo un texto, pero no sé exactamente dónde encontrarlo".

VIAJERO:
"Entonces has venido al lugar indicado. Escuché que están preparando una sala para ayudar a otros viajeros a estudiar".

PRECURSORA:
"¡Qué buena idea! Tal vez también pueda colaborar".

VIAJERO:
"Busca a la bibliotecaria. Seguro que estará encantada de conocerte".

### Mecánica

El jugador deberá:

- Caminar en cuatro direcciones.
- Rodear una mesa.
- Interactuar con un libro.
- Consultar el mapa.
- Hablar con el viajero.
- Encontrar a la bibliotecaria.

### Condición de finalización

Completar el tutorial de movimiento RPG y localizar a la bibliotecaria.

No requerir interacciones ocultas que el jugador no pueda conocer.

---

## ESCENA 02 — LA BIBLIOTECARIA Y EL CONOCIMIENTO

**Referencia:** Proverbios 2:1-6.

### Diálogo

BIBLIOTECARIA:
"¡Bienvenida! Me dijeron que una joven ayudó a reparar las señales del bosque. ¿Eras tú?".

PRECURSORA:
"Sí, aunque no lo hice sola. Conocí a personas que me ayudaron muchísimo".

BIBLIOTECARIA:
"Me alegra escuchar eso. Dime, ¿qué te trae a nuestra biblioteca?".

PRECURSORA:
"Quiero conocer mejor las Escrituras y aprender a utilizarlas cuando alguien necesite ayuda".

BIBLIOTECARIA:
"Es un propósito muy bonito. Vamos a comenzar con una pregunta".

BIBLIOTECARIA:
"Proverbios 2 compara la búsqueda de sabiduría con buscar un tesoro. ¿Por qué crees que utiliza esa comparación?".

### Pregunta 1

A. Porque el conocimiento se obtiene sin esfuerzo.

B. Porque la sabiduría es valiosa y merece una búsqueda constante.

C. Porque solo algunas personas pueden aprender.

**Respuesta válida:** B.

### Retroalimentación correcta

BIBLIOTECARIA:
"Exactamente. La sabiduría es valiosa, por eso merece que dediquemos tiempo y esfuerzo a buscarla".

### Pregunta 2

"Según Proverbios 2:6, ¿de dónde viene la verdadera sabiduría?".

A. De quienes saben más que todos.

B. De Jehová.

C. De memorizar muchos libros.

**Respuesta válida:** B.

### Diálogo de cierre

BIBLIOTECARIA:
"Aquí no se trata de competir para demostrar quién sabe más. Queremos aprender a utilizar bien lo que Jehová nos enseña".

PRECURSORA:
"Entonces comenzaré buscando con cuidado, como quien busca algo muy valioso".

### Resultado

Se desbloquea el catálogo.

---

## ESCENA 03 — EL CATÁLOGO DESORDENADO

**Ubicación:** catálogo central.

### Diálogo

BIBLIOTECARIA:
"Antes de abrir la sala de consulta necesitamos organizar algunas fichas del catálogo".

PRECURSORA:
"¿Qué debo hacer?".

BIBLIOTECARIA:
"Hay referencias bíblicas, ayudas de estudio y notas de investigación. Cada una cumple una función diferente".

PRECURSORA:
"Entonces primero debo identificar qué estoy buscando".

BIBLIOTECARIA:
"Exactamente. Prueba con esta referencia: Hechos 17:11".

### Mecánica

Implementar un panel de clasificación.

El jugador deberá organizar fichas mediante:

- Arrastrar y soltar.
- Seleccionar una ficha y luego seleccionar su categoría.

Categorías:

1. Libros bíblicos.
2. Ayudas de estudio.
3. Notas de investigación.

Después deberá encontrar Hechos.

### Pregunta

"¿A qué sección de la Biblia pertenece Hechos?".

A. Escrituras Hebreoarameas.

B. Escrituras Griegas Cristianas.

C. No pertenece a la Biblia.

**Respuesta válida:** B.

### Diálogo final

BIBLIOTECARIA:
"¡Muy bien! Localizar una referencia es el primer paso. Ahora iremos a descubrir qué nos enseña".

### Resultado

Se desbloquea la ruta hacia el archivo.

---

## ESCENA 04 — LAS ESTANTERÍAS SUPERIORES

**Ubicación:** pasillos del archivo.

**Personaje:** auxiliar.

### Diálogo

AUXILIAR:
"¿Vienes por el archivo de investigación?".

PRECURSORA:
"Sí. La bibliotecaria me pidió buscar algunas referencias".

AUXILIAR:
"El elevador de libros está detenido. Para llegar arriba tendrás que utilizar las escaleras y los balcones".

PRECURSORA:
"¡Vaya! Parece que aquí también tendré que superar algunos obstáculos".

AUXILIAR:
"Con cuidado. Las plataformas señaladas en azul están fijas, pero algunos mecanismos se desplazan".

PRECURSORA:
"Gracias por avisarme. Prefiero observar bien antes de comenzar".

### Mecánica

El jugador deberá:

- Encontrar las escaleras.
- Subir al segundo piso.
- Recorrer un balcón.
- Activar dos mecanismos.
- Evitar un carrito de libros que se desplaza.
- Recuperar una ficha bíblica.
- Activar el elevador.

Adaptar los obstáculos a la perspectiva superior.

No exigir saltos laterales incompatibles con el nuevo motor.

### Diálogo final

PRECURSORA:
"¡Lo conseguí! Ahora entiendo por qué tienen tantos pasillos".

AUXILIAR:
"Y todavía quedan varios pisos. Pero por ahora ya tienes lo que necesitabas".

### Resultado

Checkpoint 1.

---

## ESCENA 05 — EL EJEMPLO DE LOS BEREANOS

**Referencia:** Hechos 17:11.

### Diálogo

BIBLIOTECARIA:
"¿Encontraste la referencia?".

PRECURSORA:
"Sí. Habla de unas personas de Berea que escucharon lo que enseñaban Pablo y Silas".

BIBLIOTECARIA:
"¿Qué hicieron después de escuchar?".

PRECURSORA:
"Examinaron cuidadosamente las Escrituras para comprobar lo que estaban aprendiendo".

BIBLIOTECARIA:
"¿Y qué podríamos aprender de su ejemplo?".

### Pregunta

A. Aceptar inmediatamente cualquier explicación.

B. Investigar con interés y comprobar las enseñanzas usando las Escrituras.

C. Evitar escuchar ideas que no conocemos.

**Respuesta válida:** B.

### Retroalimentación

BIBLIOTECARIA:
"Los bereanos tenían interés en aprender y dedicaban tiempo a examinar cuidadosamente lo que escuchaban".

PRECURSORA:
"Entonces, cuando tenga una pregunta, no debería conformarme con recordar algo a medias. Es mejor investigar".

BIBLIOTECARIA:
"Exactamente. Y también podemos pedir ayuda cuando algo no está claro".

### Resultado

Se desbloquea la sala de investigación.

---

## ESCENA 06 — LA SALA SIN LUZ

**Ubicación:** pasillo del archivo.

**Herramienta:** Fe.

### Diálogo

PRECURSORA:
"Está demasiado oscuro para distinguir las marcas del suelo".

AUXILIAR:
"Estamos reparando las lámparas. El interruptor está al otro lado de este pasillo".

PRECURSORA:
"Traigo una pequeña linterna desde mi viaje por el bosque. Tal vez pueda utilizarla".

AUXILIAR:
"¡Excelente! La necesitarás para distinguir los escalones. Avanza con cuidado".

### Mecánica

La protagonista deberá:

1. Abrir el inventario.
2. Seleccionar la linterna de Fe.
3. Equiparla.
4. Iluminar el entorno.
5. Observar las marcas del suelo.
6. Encontrar el interruptor.
7. Activarlo.

La linterna tiene una función física de iluminación y un significado simbólico.

No representarla como un poder sobrenatural.

### Resultado

Se restaura la iluminación.

PRECURSORA:
"¡Ahora sí podemos ver todo el pasillo! Me alegra haber conservado esta linterna".

AUXILIAR:
"Y gracias a ti podremos volver a utilizar el archivo".

---

## ESCENA 07 — PARA QUÉ SIRVEN LAS ESCRITURAS

**Referencia:** 2 Timoteo 3:16, 17.

### Diálogo

BIBLIOTECARIA:
"Ya sabes cómo buscar una referencia. Ahora veamos cómo comprender su utilidad".

PRECURSORA:
"De acuerdo. ¿Por dónde empezamos?".

BIBLIOTECARIA:
"Lee 2 Timoteo 3:16, 17. ¿Qué nos enseña sobre las Escrituras?".

PRECURSORA:
"Que pueden enseñarnos y ayudarnos a corregir lo que sea necesario".

BIBLIOTECARIA:
"Exactamente. No solo nos permiten adquirir información; también pueden ayudarnos a mejorar nuestra conducta".

### Pregunta

"¿Cuál es una de las utilidades de las Escrituras mencionadas en 2 Timoteo 3:16, 17?".

A. Aprender todos los acontecimientos futuros.

B. Enseñar, rectificar las cosas y prepararnos para hacer buenas obras.

C. Evitar que tengamos que tomar decisiones.

**Respuesta válida:** B.

### Minijuego adicional

Relacionar situaciones:

- Una persona desea conocer una enseñanza bíblica → Enseñar.
- Alguien descubre que actuaba de manera equivocada → Rectificar.
- Una joven aprende cómo ayudar mejor → Prepararse para buenas obras.

### Diálogo final

PRECURSORA:
"Ahora lo entiendo. No se trata de llenar mi cuaderno de referencias, sino de aprender a ponerlas en práctica".

BIBLIOTECARIA:
"Exactamente. El conocimiento debería influir positivamente en nuestra manera de vivir".

---

## ESCENA 08 — LA PRIMERA PREGUNTA DIFÍCIL

**Referencia:** 1 Pedro 3:15.

### Diálogo

VISITANTE:
"Disculpa, ¿puedo hacerte una pregunta?".

PRECURSORA:
"¡Por supuesto! ¿En qué puedo ayudarte?".

VISITANTE:
"Te he visto estudiando durante un buen rato. ¿Por qué confías tanto en lo que dice la Biblia?".

PRECURSORA:
"Es una buena pregunta. ¿Qué es lo que más te gustaría saber?".

VISITANTE:
"Me interesa comprender qué razones tienes para creer lo que estás aprendiendo".

### Pregunta

"¿Cómo continuarías la conversación?".

A. Porque yo sé que tengo razón.

B. Me alegra que lo preguntes. Podemos examinar juntos algunas razones y textos bíblicos.

C. No deberías cuestionar estas cosas.

**Respuesta válida:** B.

### Reacción correcta

VISITANTE:
"Eso me parece bien. No quiero discutir; solo entender".

PRECURSORA:
"Y me parece importante que puedas hacer preguntas con confianza".

VISITANTE:
"Gracias por escucharme".

### Reacción ante una respuesta poco adecuada

VISITANTE:
"No pretendía molestarte. Solo quería comprender mejor tu opinión".

Permitir rectificación.

No penalizar la espiritualidad ni quitar corazones.

---

## ESCENA 09 — ¿DÓNDE ESTÁ LA RESPUESTA?

**Referencia:** Hebreos 11:1.

### Diálogo

VISITANTE:
"Hay algo más. Una vez escuché a alguien decir que la Biblia promete que, si tenemos fe, siempre conoceremos todas las respuestas".

PRECURSORA:
"¿Recuerdas qué texto utilizó?".

VISITANTE:
"No. Solo recuerdo la idea".

PRECURSORA:
"Entonces prefiero no atribuir esa afirmación a la Biblia sin comprobarla. Podemos investigar juntos".

VISITANTE:
"Me gusta eso. Prefiero una respuesta bien fundamentada a una explicación apresurada".

### Mecánica

Buscar una referencia relacionada con la fe.

Consultar el contexto.

Distinguir entre el contenido del pasaje y una afirmación que no está respaldada por él.

### Pregunta

"Si alguien recuerda una idea, pero no sabe de qué texto procede, ¿qué sería mejor hacer?".

A. Repetirla como si fuera una cita bíblica.

B. Cambiar las palabras hasta que parezca un versículo.

C. Buscar la referencia, comprobar el contenido y evitar atribuirle ideas que no expresa.

**Respuesta válida:** C.

### Diálogo final

PRECURSORA:
"Hebreos 11 habla de la fe, pero no deberíamos utilizarlo para asegurar algo que no dice".

VISITANTE:
"Ahora comprendo por qué es importante revisar las referencias".

### Resultado

Checkpoint 2.

---

## ESCENA 10 — APRENDER A ESCUCHAR

**Referencia:** Proverbios 18:13.

### Diálogo

ESTUDIANTE:
"Hola, ¿puedes ayudarme? Llevo un rato tratando de entender algo".

PRECURSORA:
"Claro. ¿Qué estás estudiando?".

ESTUDIANTE:
"Estoy leyendo una parte de la Biblia, pero...".

### Pregunta

"¿Qué debería hacer la protagonista?".

A. Interrumpirla para recomendarle un texto.

B. Dejar que termine de explicar lo que no comprende.

C. Suponer que necesita ayuda para encontrar un libro.

**Respuesta válida:** B.

### Continuación

ESTUDIANTE:
"El problema no es encontrar el texto. Puedo leerlo, pero me cuesta comprender cómo se relaciona con el resto del pasaje".

PRECURSORA:
"Ah, ahora entiendo. Entonces necesitas ayuda para comprender el contexto".

ESTUDIANTE:
"¡Exactamente! Eso es lo que quería decir".

PRECURSORA:
"Vamos a revisarlo juntas, sin apresurarnos".

### Resultado

Se habilita una investigación conjunta.

---

## ESCENA 11 — UNA INVESTIGACIÓN COMPLETA

**Referencia:** Hechos 8:30-35.

### Diálogo

ESTUDIANTE:
"¿Alguna vez has leído algo y has tenido que pedir ayuda para entenderlo?".

PRECURSORA:
"Claro. Y eso me recuerda una conversación que aparece en el libro de Hechos".

ESTUDIANTE:
"¿Qué ocurrió?".

PRECURSORA:
"Un hombre estaba leyendo al profeta Isaías. Felipe se acercó y se interesó por saber si comprendía lo que leía".

ESTUDIANTE:
"¿Y pudo ayudarlo?".

PRECURSORA:
"Sí. Primero escuchó su pregunta y después utilizó las Escrituras para explicarle las buenas noticias acerca de Jesús".

### Actividad de tres pasos

**Paso 1.**

Localizar Hechos 8:30-35.

**Paso 2.**

Identificar qué hizo Felipe.

Respuesta válida:

"Comprobó si el hombre comprendía lo que leía y lo ayudó a entenderlo".

**Paso 3.**

Seleccionar la mejor aplicación.

Respuesta válida:

"Escuchar la pregunta, revisar el contexto y explicar la información de manera sencilla".

### Diálogo final

ESTUDIANTE:
"¡Muchas gracias! Me ayudó que no intentaras darme una respuesta antes de escuchar mi pregunta".

PRECURSORA:
"Y a mí me ayudó volver a leer el ejemplo de Felipe. Las dos aprendimos algo".

ESTUDIANTE:
"Creo que ahora podré continuar investigando por mi cuenta".

---

# 9. ESCENA 12 — EL LABERINTO DE LAS IDEAS

Esta es una escena fundamental del capítulo.

Sustituye la anterior actividad del archivo de referencias.

Debe combinar:

- Exploración RPG.
- Laberinto de estanterías.
- Documentos.
- Información irrelevante.
- Afirmaciones sin fundamento.
- Investigación.
- Filosofías y razonamientos.
- Debate respetuoso.
- Preguntas variables.
- Consecuencias narrativas.
- Desbloqueo de la sala tranquila.

## 9.1. Contexto

La protagonista entra en una sección general de la biblioteca.

Encuentra información sobre:

- Historia.
- Ciencia.
- Filosofía.
- Literatura.
- Religiones.
- Cultura.
- Comentarios personales.
- Investigaciones bíblicas.

El juego debe enseñar que una biblioteca puede contener información útil, información irrelevante para una pregunta determinada, opiniones, datos incompletos y razonamientos engañosos.

**No representar todo el conocimiento no religioso como falso.**

La diferencia entre conocimiento general, opinión y enseñanza religiosa debe quedar clara.

La aplicación de Colosenses 2:8 tiene que respetar el contexto de la advertencia sobre razonamientos falsos o vacíos que no están de acuerdo con Cristo.

## 9.2. Diálogo inicial

INVESTIGADOR:
"¡Vaya! Hay tanta información aquí que podríamos pasar años leyendo".

PRECURSORA:
"¡Es increíble! Nunca había visto una biblioteca tan grande".

INVESTIGADOR:
"Pero dime, si encuentras muchas ideas diferentes sobre el mismo tema, ¿cómo decides cuáles aceptar?".

PRECURSORA:
"Supongo que primero tendría que saber qué quiero investigar y comprobar qué fundamento tiene cada afirmación".

INVESTIGADOR:
"Interesante. ¿Y qué harías si alguien presenta una idea que parece muy convincente, pero contradice lo que tú has aprendido?".

PRECURSORA:
"No quisiera rechazarla sin entenderla, ni aceptarla simplemente porque suena interesante. Preferiría examinar sus argumentos".

## 9.3. Mecánica física

Crear un pequeño laberinto de estanterías.

El jugador deberá:

1. Explorar pasillos.
2. Encontrar documentos.
3. Consultar referencias.
4. Reconocer información pertinente.
5. Identificar documentos incompletos.
6. Evitar perder el objetivo de investigación.
7. Regresar con el investigador.
8. Participar en el debate.

Incluir información que pueda ser verdadera pero irrelevante para la pregunta.

No calificar automáticamente como falsa la información que no sirve para una investigación concreta.

## 9.4. Tipos de documentos

Crear cinco categorías:

- Fuente principal.
- Fuente de apoyo.
- Información general.
- Opinión.
- Afirmación pendiente de comprobar.

Cada documento deberá indicar:

- Título.
- Tema.
- Fuente.
- Autor, cuando corresponda.
- Fecha, si resulta pertinente.
- Contenido resumido.
- Relación con la pregunta.
- Estado de verificación.

## 9.5. Debate interactivo

El debate tendrá seis rondas.

La selección de preguntas independientes deberá variar entre intentos.

El investigador planteará preguntas y responderá a lo que el jugador elija.

### RONDA A — INFORMACIÓN PERTINENTE

INVESTIGADOR:
"Aquí hay cientos de libros. ¿Crees que deberíamos leerlos todos para responder una pregunta sobre la Biblia?".

Opciones:

A. Sí, toda la información es igualmente importante.

B. No, deberíamos consultar solamente un libro sin investigar nada más.

C. Primero identificaría la pregunta y buscaría fuentes relacionadas y confiables.

**Respuesta válida:** C.

**Explicación:**

Una buena investigación comienza por definir lo que necesitamos conocer. Eso permite seleccionar fuentes pertinentes.

### RONDA B — POPULARIDAD

INVESTIGADOR:
"Muchas personas repiten una afirmación. ¿No debería bastar su popularidad para considerarla verdadera?".

Opciones:

A. Sí, porque la mayoría siempre tiene razón.

B. Una afirmación merece examinarse, aunque la repitan muchas personas.

C. No, porque toda idea popular tiene que ser falsa.

**Respuesta válida:** B.

INVESTIGADOR:
"Es verdad. Que una idea sea conocida no demuestra por sí mismo que sea correcta. Necesitamos analizar sus fundamentos".

### RONDA C — RAZONAMIENTOS ENGAÑOSOS

**Referencia:** Colosenses 2:8.

INVESTIGADOR:
"Colosenses 2:8 advierte sobre filosofías y razonamientos falsos. ¿Significa eso que todo conocimiento fuera de la Biblia es malo?".

Opciones:

A. Sí, cualquier conocimiento externo debe rechazarse.

B. No. El pasaje advierte específicamente contra enseñanzas y razonamientos engañosos que no están de acuerdo con Cristo.

C. No importa si una enseñanza es engañosa mientras parezca interesante.

**Respuesta válida:** B.

INVESTIGADOR:
"Entiendo. El problema no es aprender sobre distintos temas, sino aceptar razonamientos engañosos sin examinarlos".

### RONDA D — VERSIONES CONTRADICTORIAS

**Referencia:** Proverbios 18:17.

INVESTIGADOR:
"Leí dos explicaciones diferentes de un mismo acontecimiento. La primera parecía completamente convincente. ¿Cuál aceptarías?".

Opciones:

A. La primera, porque fue la que leí antes.

B. La segunda, porque contradice a la primera.

C. Examinaría ambas, su contexto y las evidencias disponibles.

**Respuesta válida:** C.

PRECURSORA:
"Proverbios 18:17 me recuerda que escuchar una sola explicación no siempre es suficiente para comprender un asunto".

INVESTIGADOR:
"Eso me parece sensato. Quizás ambas versiones contengan información que necesitemos investigar".

### RONDA E — NO SABER UNA RESPUESTA

INVESTIGADOR:
"Te preguntan algo que todavía no has investigado. ¿Cómo responderías?".

Opciones:

A. Inventaría una explicación para no parecer insegura.

B. Cambiaría inmediatamente de tema.

C. Reconocería que necesito investigar más y ofrecería buscar la respuesta.

**Respuesta válida:** C.

INVESTIGADOR:
"Me parece una respuesta sincera. A veces reconocer lo que desconocemos demuestra más responsabilidad que intentar contestarlo todo".

### RONDA F — CLASIFICACIÓN FINAL

INVESTIGADOR:
"Entonces, ¿cómo distinguirías entre algo que sabes, algo que crees y algo que todavía no puedes comprobar?".

Crear tres documentos con afirmaciones ficticias y claramente identificadas.

El jugador deberá clasificarlas como:

- Dato comprobado.
- Opinión.
- Información pendiente de verificar.

El desafío debe verificar que cada clasificación corresponde con la evidencia disponible en la propia actividad.

No convertir interpretaciones doctrinales complejas en afirmaciones supuestamente comprobadas sin contexto.

## 9.6. Banco adicional de preguntas

Además de las seis rondas principales, implementar preguntas alternativas.

### Pregunta G

"Un documento no tiene autor, fecha ni referencias. ¿Qué deberíamos hacer?".

Respuesta válida:

"Buscar información que permita verificar su origen y sus afirmaciones".

### Pregunta H

"Un libro trata un tema distinto al que estamos investigando. ¿Significa que es falso?".

Respuesta válida:

"No necesariamente. Puede contener información válida, pero no ser pertinente ahora".

### Pregunta I

"Una persona presenta una idea usando palabras complicadas. ¿Eso demuestra que tiene razón?".

Respuesta válida:

"No. La complejidad del lenguaje no sustituye las evidencias".

### Pregunta J

"Una información confirma lo que yo ya pensaba. ¿Necesito comprobarla?".

Respuesta válida:

"Sí, también debemos examinar cuidadosamente las afirmaciones con las que estamos de acuerdo".

### Pregunta K

"Dos personas discrepan sobre una interpretación. ¿Cuál sería una manera respetuosa de continuar?".

Respuesta válida:

"Escuchar sus argumentos, revisar las fuentes pertinentes y evitar ataques personales".

### Pregunta L

"Una afirmación utiliza una cita fuera de contexto. ¿Qué sería mejor hacer?".

Respuesta válida:

"Consultar el pasaje completo y comprobar si la interpretación corresponde con el contexto".

Para estas preguntas adicionales, crea opciones incorrectas razonables y explicaciones específicas.

No hacer que todas las respuestas válidas sean siempre la opción más larga.

## 9.7. Final del debate

INVESTIGADOR:
"Me ha gustado hablar contigo. No hemos tenido que convertir nuestras diferencias en una discusión".

PRECURSORA:
"Yo también aprendí algo. Escuchar otras preguntas me ayuda a investigar mejor y explicar con más claridad lo que creo".

INVESTIGADOR:
"Espero volver a conversar contigo algún día".

### Resultado

Se desbloquea la sala tranquila.

Guardar:

- Documentos consultados.
- Información clasificada.
- Preguntas seleccionadas.
- Respuestas.
- Reflexiones.
- Estado del investigador.

---

## ESCENA 13 — LA SALA TRANQUILA

**Referencia:** Proverbios 18:15.

### Diálogo

BIBLIOTECARIA:
"Parece que encontraste muchas más cosas de las que buscabas".

PRECURSORA:
"¡Sí! Había tantas ideas diferentes que por un momento no sabía por dónde comenzar".

BIBLIOTECARIA:
"¿Y qué te ayudó a encontrar una respuesta?".

PRECURSORA:
"Recordar cuál era mi pregunta, examinar las fuentes y no dejarme llevar solamente por lo convincente que sonaba una idea".

BIBLIOTECARIA:
"Has aprendido algo importante: no toda la información tiene el mismo valor para cada investigación. También necesitas discernimiento para saber qué aceptar y cómo utilizarlo".

PRECURSORA:
"Y descubrí que puedo conversar con alguien que piensa diferente sin perder el respeto ni dejar de investigar".

### Reflexión

"¿Qué te gustaría seguir mejorando?".

Opciones:

- Encontrar referencias con mayor rapidez.
- Escuchar antes de responder.
- Comprender los textos en su contexto.
- Investigar más cuando tenga dudas.

Todas son válidas.

### Resultado

- Registrar reflexión.
- Recuperar tres corazones.
- Activar checkpoint.
- Desbloquear el último piso.

---

## ESCENA 14 — EL ÚLTIMO PISO

**Ubicación:** archivo superior.

### Diálogo

AUXILIAR:
"La gran sala está casi lista. Pero necesito que revises el acceso superior".

PRECURSORA:
"¿Hay algún problema?".

AUXILIAR:
"El elevador está funcionando otra vez, aunque algunos mecanismos se desplazan. Tendrás que coordinar bien tus movimientos".

PRECURSORA:
"Después de cruzar el bosque, creo que puedo intentarlo".

AUXILIAR:
"Recuerda que puedes detenerte y observar el movimiento antes de avanzar".

### Mecánica

Implementar:

- Pasillos estrechos.
- Mecanismos móviles.
- Carritos que bloquean el paso.
- Interruptores.
- Puertas conectadas.
- Escaleras.
- Un ascensor.
- Obstáculos con tiempo.
- Zonas de apoyo seguras.

El jugador deberá:

1. Reconocer el recorrido.
2. Activar un mecanismo.
3. Evitar un carrito.
4. Subir una escalera.
5. Abrir una puerta.
6. Alcanzar la gran sala.

Al completar:

PRECURSORA:
"¡Lo logré! Aunque hubo un momento en el que pensé que tendría que empezar de nuevo".

AUXILIAR:
"Y aun así observaste los obstáculos, corregiste tus movimientos y seguiste adelante".

PRECURSORA:
"Creo que eso también es parte de aprender".

---

## ESCENA 15 — LA PRUEBA DEL CONOCIMIENTO

**Referencia:** 2 Timoteo 2:15.

### Diálogo

VISITANTE:
"¡Hola de nuevo! La última vez me ayudaste a investigar una pregunta. ¿Puedo hacerte otra?".

PRECURSORA:
"Claro. ¿Qué te gustaría saber?".

VISITANTE:
"A veces encuentro textos que no comprendo. ¿Cómo puedo saber si los estoy interpretando correctamente?".

PRECURSORA:
"Es una buena pregunta. Creo que podemos seguir varios pasos para investigar con cuidado".

VISITANTE:
"¿Por dónde comenzarías?".

### Actividad

Ordenar estas acciones:

1. Comprender la pregunta.
2. Leer el texto y examinar su contexto.
3. Consultar referencias pertinentes y preparar una explicación clara.

### Pregunta

VISITANTE:
"¿Y qué harías si, después de investigar, todavía no supieras la respuesta?".

Opciones:

A. Inventar una explicación convincente.

B. Reconocer que necesito investigar más y buscar una ayuda confiable.

C. Cambiar de tema para evitar la pregunta.

**Respuesta válida:** B.

### Diálogo final

PRECURSORA:
"Preferiría decirte que todavía necesito investigar. No sería correcto darte una explicación que no puedo fundamentar".

VISITANTE:
"Te agradezco esa sinceridad".

PRECURSORA:
"También podemos consultar una ayuda de estudio y continuar investigando juntos".

VISITANTE:
"Me gusta esa idea. No necesito que alguien sepa absolutamente todo; me ayuda más saber cómo encontrar respuestas bien fundamentadas".

### Resultado

La bibliotecaria abre las puertas de la gran sala.

---

# 10. ESCENA 16 — EL GRAN DESAFÍO DE LOS 66 LIBROS

Este será el desafío final y obligatorio del capítulo 2.

No sustituirlo por un cuestionario sencillo.

Debe ser un minijuego completamente funcional.

## 10.1. Historia

La protagonista llega a la gran sala.

Sobre una enorme mesa hay 66 tarjetas correspondientes a los libros de la Biblia.

Las tarjetas están desordenadas.

La bibliotecaria le explica el desafío.

### Diálogo

BIBLIOTECARIA:
"¡Felicitaciones! Has ayudado a preparar la biblioteca, investigar preguntas y orientar a nuestros visitantes".

PRECURSORA:
"Me ha gustado mucho. Aunque hay algo que todavía quiero mejorar".

BIBLIOTECARIA:
"¿Qué cosa?".

PRECURSORA:
"Me gustaría encontrar los libros de la Biblia con más rapidez. A veces recuerdo un texto, pero tengo que buscar bastante para localizarlo".

BIBLIOTECARIA:
"Entonces tengo un último desafío para ti".

BIBLIOTECARIA:
"Aquí están representados los 66 libros de la Biblia, pero sus tarjetas están desordenadas".

PRECURSORA:
"¡Son muchas!".

BIBLIOTECARIA:
"Así es. ¿Crees que puedas colocarlas todas en el orden correcto?".

PRECURSORA:
"¡Quiero intentarlo!".

BIBLIOTECARIA:
"Puedes elegir cuánto tiempo tendrás para completar el reto. La meta es la misma en todos los niveles".

## 10.2. Dificultades

Crear tres modos:

### FÁCIL

Tiempo: 10 minutos.

### MEDIO

Tiempo: 6 minutos.

### DIFÍCIL

Tiempo: 3 minutos.

Los tres modos deberán utilizar los 66 libros.

No resolver automáticamente ninguna posición.

No reducir la cantidad de libros en dificultades fáciles.

La dificultad estará determinada por el tiempo.

## 10.3. Inicio

Antes de comenzar:

Mostrar:

- Nombre del desafío.
- Dificultad.
- Tiempo disponible.
- Instrucciones.
- Botón para comenzar.
- Botón para volver.

El cronómetro no comenzará durante el diálogo ni en la selección de dificultad.

Comenzará al pulsar:

**Comenzar desafío**.

## 10.4. Interfaz del tablero

Implementar 66 tarjetas organizables.

Separar visualmente:

**Escrituras Hebreoarameas — 39 libros.**

**Escrituras Griegas Cristianas — 27 libros.**

Las tarjetas deben poder desplazarse entre posiciones.

El tablero debe adaptarse a móvil, tablet y escritorio.

### Método de interacción 1

Arrastrar una tarjeta sobre otra.

Al soltarla, intercambiar posiciones.

### Método de interacción 2

Pulsar una tarjeta para seleccionarla.

Pulsar otra tarjeta para intercambiar las posiciones.

### Método de interacción 3

Para accesibilidad, permitir selección e intercambio mediante teclado.

Todos los métodos deben modificar el mismo estado.

## 10.5. Reglas

- Las 66 tarjetas deberán estar presentes.
- No puede haber tarjetas duplicadas.
- No puede faltar ningún libro.
- Cada libro tendrá un ID único.
- Las posiciones irán de 1 a 66.
- El orden correcto debe validarse mediante los IDs.
- No validar mediante el texto visible de las tarjetas.
- No utilizar índices fijos que dependan de la mezcla aleatoria.
- No permitir un movimiento que elimine o duplique tarjetas.

Mostrar un contador:

**Libros en su posición correcta: X/66.**

El contador se actualiza después de cada intercambio.

La victoria ocurre automáticamente cuando los 66 libros están en el orden correcto.

## 10.6. Orden oficial

Utilizar el orden siguiente como fuente de datos.

Cada entrada deberá tener:

- `id`
- `order`
- `name`
- `abbreviation`
- `section`

### ESCRITURAS HEBREOARAMEAS

01 | Génesis | Gé  
02 | Éxodo | Éx  
03 | Levítico | Le  
04 | Números | Nú  
05 | Deuteronomio | Dt  
06 | Josué | Jos  
07 | Jueces | Jue  
08 | Rut | Rut  
09 | 1 Samuel | 1Sa  
10 | 2 Samuel | 2Sa  
11 | 1 Reyes | 1Re  
12 | 2 Reyes | 2Re  
13 | 1 Crónicas | 1Cr  
14 | 2 Crónicas | 2Cr  
15 | Esdras | Esd  
16 | Nehemías | Ne  
17 | Ester | Est  
18 | Job | Job  
19 | Salmos | Sl  
20 | Proverbios | Pr  
21 | Eclesiastés | Ec  
22 | El Cantar de los Cantares | Can  
23 | Isaías | Is  
24 | Jeremías | Jer  
25 | Lamentaciones | Lam  
26 | Ezequiel | Eze  
27 | Daniel | Da  
28 | Oseas | Os  
29 | Joel | Joe  
30 | Amós | Am  
31 | Abdías | Abd  
32 | Jonás | Jon  
33 | Miqueas | Miq  
34 | Nahúm | Na  
35 | Habacuc | Hab  
36 | Sofonías | Sof  
37 | Ageo | Ag  
38 | Zacarías | Zac  
39 | Malaquías | Mal

### ESCRITURAS GRIEGAS CRISTIANAS

40 | Mateo | Mt  
41 | Marcos | Mr  
42 | Lucas | Lu  
43 | Juan | Jn  
44 | Hechos | Hch  
45 | Romanos | Ro  
46 | 1 Corintios | 1Co  
47 | 2 Corintios | 2Co  
48 | Gálatas | Gál  
49 | Efesios | Ef  
50 | Filipenses | Flp  
51 | Colosenses | Col  
52 | 1 Tesalonicenses | 1Te  
53 | 2 Tesalonicenses | 2Te  
54 | 1 Timoteo | 1Ti  
55 | 2 Timoteo | 2Ti  
56 | Tito | Tit  
57 | Filemón | Flm  
58 | Hebreos | Heb  
59 | Santiago | Snt  
60 | 1 Pedro | 1Pe  
61 | 2 Pedro | 2Pe  
62 | 1 Juan | 1Jn  
63 | 2 Juan | 2Jn  
64 | 3 Juan | 3Jn  
65 | Judas | Jud  
66 | Apocalipsis | Ap

Verificar el orden con la Traducción del Nuevo Mundo disponible en JW.ORG.

Las capturas proporcionadas por el usuario son la referencia para las abreviaturas y el orden.

No copiar el diseño exacto de JW Library: crear una interfaz pixel art original.

## 10.7. Aleatorización del tablero

Crear una mezcla aleatoria de las 66 tarjetas.

Utilizar una semilla registrable.

Comprobar que el tablero no comience completamente ordenado.

Crear una prueba que confirme:

- 66 tarjetas.
- 66 IDs únicos.
- Sin tarjetas perdidas.
- Orden mezclado.
- Posibilidad de alcanzar el orden correcto mediante intercambios.

No alterar la solución correcta entre dificultades.

## 10.8. Temporizador

Utilizar tiempo monotónico durante la partida.

Guardar:

- Dificultad.
- Tiempo inicial.
- Tiempo restante.
- Tiempo activo transcurrido.
- Tablero actual.
- Número de intercambios.
- Identificador del intento.

El tiempo debe continuar correctamente al reanudar una partida.

No reiniciarlo accidentalmente al cerrar y abrir el juego.

La pausa explícita detendrá el cronómetro.

No permitir que una conversación o una animación previa consuma tiempo.

Al terminar el tiempo:

- Bloquear nuevos movimientos.
- Mostrar el resultado.
- Conservar el mejor progreso del intento.
- Permitir repetir.
- Permitir cambiar dificultad.

## 10.9. Tiempo agotado

### Diálogo

PRECURSORA:
"¡Oh! Se terminó el tiempo y todavía me faltaban algunos libros".

BIBLIOTECARIA:
"Has conseguido colocar varios correctamente. Puedes seguir practicando y volver a intentarlo".

PRECURSORA:
"Creo que esta vez recordaré mejor algunas posiciones".

BIBLIOTECARIA:
"Puedes repetir con la misma dificultad o elegir otra. Cada intento es una oportunidad para familiarizarte más con la Biblia".

Botones:

- Reintentar.
- Cambiar dificultad.
- Volver a la biblioteca.

No perder corazones.

No perder herramientas.

## 10.10. Victoria

Al ordenar los 66 libros:

- Detener cronómetro.
- Bloquear intercambios.
- Reproducir animación de victoria.
- Iluminar las tarjetas.
- Mostrar puntuación.
- Registrar tiempo.
- Registrar dificultad.
- Guardar récord.
- Completar escena 16.

### Diálogo

BIBLIOTECARIA:
"¡Excelente! ¡Los 66 libros están en el orden correcto!".

PRECURSORA:
"¡Lo conseguí! Pensé que me confundiría con tantos nombres".

BIBLIOTECARIA:
"Te has esforzado por aprender a encontrar las referencias y utilizar las Escrituras".

PRECURSORA:
"Ahora puedo localizar los libros con más confianza. ¡Y todavía quiero seguir practicando!".

BIBLIOTECARIA:
"Eso me alegra. El conocimiento es valioso, especialmente cuando lo utilizamos bien y seguimos aprendiendo".

## 10.11. Recompensa

La bibliotecaria entrega un cuaderno especial.

BIBLIOTECARIA:
"Quiero regalarte este cuaderno para que sigas registrando lo que investigues".

PRECURSORA:
"¡Muchas gracias! Lo utilizaré para recordar lo que voy aprendiendo".

BIBLIOTECARIA:
"Que te acompañe en tus próximas aventuras".

Mostrar:

# ¡HAS OBTENIDO EL CONOCIMIENTO!

Descripción:

"Has aprendido a investigar, comprender y utilizar lo que descubres para ayudar a los demás".

Agregar permanentemente la herramienta:

`conocimiento`

No utilizar el mismo identificador que Fe.

La herramienta Conocimiento será un cuaderno de investigación que permitirá consultar pistas y referencias en futuros capítulos.

## 10.12. Transición

La protagonista sale al balcón exterior.

Se observa un puente entre las montañas.

PRECURSORA:
"Qué hermoso paisaje... Aunque ese puente parece bastante alto".

BIBLIOTECARIA:
"Conduce al siguiente tramo del camino".

PRECURSORA:
"Después de todo lo que he aprendido, creo que estoy mejor preparada para afrontar lo que venga".

Mostrar:

**Capítulo 3 desbloqueado — El puente del valor.**

No implementar todavía su historia completa.

---

# 11. SISTEMA DE DIÁLOGOS

Desarrollar un sistema reutilizable de conversaciones.

Características:

- Retrato pixel art.
- Nombre del personaje.
- Texto progresivo opcional.
- Avance manual.
- Indicador de continuación.
- Opciones.
- Respuestas condicionales.
- Conversaciones por misión.
- Diálogos posteriores a una misión.
- Reacciones correctas.
- Reacciones ante respuestas poco adecuadas.
- Diálogos opcionales.

## 11.1. Interacciones repetidas

Los personajes no deben repetir indefinidamente su introducción.

Ejemplo:

La bibliotecaria puede:

- Dar la bienvenida.
- Explicar una misión.
- Comentar un progreso.
- Dar pistas.
- Despedirse.

Seleccionar el diálogo según el estado real de la partida.

## 11.2. Diálogos largos

Dividir el texto en cuadros legibles.

No colocar párrafos enormes en una sola pantalla.

Mostrar preferentemente una o dos frases por cuadro.

En móvil, permitir desplazamiento cuando sea necesario.

La conversación no debe continuar automáticamente sin una acción del jugador.

## 11.3. Guardado

Conservar:

- Conversación actual.
- Línea actual.
- Opción seleccionada.
- Estado del personaje.
- Próxima interacción disponible.

Al reanudar, no comenzar automáticamente conversaciones que ya se habían completado.

---

# 12. SISTEMA DE INVESTIGACIÓN BÍBLICA

Crear un cuaderno interactivo.

Debe permitir:

- Consultar las referencias necesarias para el capítulo.
- Ver los nombres de los libros bíblicos.
- Consultar una explicación breve.
- Leer notas originales del juego.
- Revisar evidencias.
- Consultar conversaciones anteriores.
- Guardar reflexiones.
- Registrar descubrimientos.

## 12.1. Contenido

Incluir referencias a:

- Proverbios 2:1-6.
- Hechos 17:11.
- 2 Timoteo 3:16, 17.
- 1 Pedro 3:15.
- Hebreos 11:1.
- Proverbios 18:13.
- Hechos 8:30-35.
- Colosenses 2:8.
- 1 Tesalonicenses 5:21.
- Proverbios 18:17.
- Proverbios 18:15.
- 2 Timoteo 2:15.

No es necesario incluir toda la Biblia dentro del videojuego.

Crear una biblioteca de referencias específicas para las actividades.

No depender de una conexión a internet para completar el capítulo.

Si se ofrece un enlace hacia JW.ORG, debe ser una función complementaria.

## 12.2. Fuentes

Los contenidos religiosos deben utilizar referencias verificables de JW.ORG.

No inventar interpretaciones.

No tratar comentarios originales del juego como citas textuales.

Crear una tabla de control editorial con:

- Escena.
- Referencia.
- Tema.
- Pregunta.
- Respuesta aceptada.
- Explicación.
- Fuente.
- Estado de verificación.

---

# 13. SISTEMA DE INVENTARIO

El capítulo 2 inicia con:

**Fe**, si el jugador completó el capítulo 1.

Durante el capítulo obtiene documentos, fichas y evidencias temporales.

Al terminar obtiene:

**Conocimiento**.

## 13.1. Fe

Habilidad:

Iluminar zonas especiales con una linterna.

Debe funcionar en la escena 06.

## 13.2. Conocimiento

Habilidad:

Consultar referencias y pistas de investigación en desafíos posteriores.

No representar el conocimiento como un poder mágico.

## 13.3. Inventario compartido

Crear un inventario común para los capítulos.

Evitar duplicar las herramientas.

Guardar el desbloqueo de forma persistente.

---

# 14. SISTEMA DE GUARDADO Y MIGRACIÓN

Este apartado es crítico.

Actualmente el proyecto utiliza un esquema de guardado centrado en el capítulo 1.

Debes ampliar su estructura sin invalidar las partidas existentes.

## 14.1. Requisitos

Crear una nueva versión del esquema cuando sea necesario.

Conservar:

- Progreso del capítulo 1.
- Herramienta Fe.
- Decisiones.
- Reflexiones.
- Capítulos desbloqueados.
- Ajustes.
- Partidas importadas.
- Compatibilidad con versiones anteriores.

No cambiar la propiedad `level` de forma incompatible sin implementar una migración.

## 14.2. Nuevo progreso

Guardar por capítulo:

- Capítulo activo.
- Escena activa.
- Misiones completadas.
- Habitación actual.
- Piso actual.
- Coordenadas X/Y.
- Dirección del personaje.
- Corazones.
- Inventario.
- Puertas abiertas.
- Mecanismos activados.
- NPC.
- Diálogos.
- Preguntas.
- Respuestas.
- Documentos.
- Pistas.
- Checkpoint.
- Reto de los 66 libros.
- Récords.

## 14.3. Web

Permitir:

- Guardado local.
- Exportación JSON.
- Importación JSON.
- Restauración.
- Validación de versión.
- Rechazo seguro de archivos incompatibles.

## 14.4. Android/iOS

Mantener almacenamiento persistente.

Guardar automáticamente al completar escenas, interactuar con objetos importantes y activar checkpoints.

## 14.5. Seguridad

No sobrescribir una partida válida con otra dañada.

Validar:

- IDs.
- Capítulos.
- Coordenadas.
- Misiones.
- Herramientas.
- Cronómetros.
- Tarjetas.
- Récords.

Prohibir estados imposibles, por ejemplo:

- Capítulo 3 desbloqueado sin finalizar el capítulo 2.
- Conocimiento obtenido antes del reto final.
- Tablero con tarjetas duplicadas.
- Posición dentro de una pared.
- Misión completada sin cumplir requisitos.

Crear pruebas de migración del esquema anterior.

---

# 15. ARQUITECTURA DEL CÓDIGO

Respetar la estructura del proyecto y modularizar el capítulo 2.

Propuesta orientativa:

`game/chapter2/content/`

`game/chapter2/dialogues/`

`game/chapter2/questions/`

`game/chapter2/maps/`

`game/chapter2/entities/`

`game/chapter2/missions/`

`game/chapter2/puzzles/`

`game/chapter2/art/`

`game/chapter2/tests/`

Crear módulos específicos para:

- Movimiento RPG.
- Colisiones.
- Cámara.
- Navegación entre habitaciones.
- Orden de profundidad.
- Renderizado.
- Detección de interacciones.
- NPC.
- Diálogos.
- Preguntas.
- Clasificación de información.
- Debate.
- Investigación.
- Minijuego de los 66 libros.
- Inventario.
- Guardado.
- Audio.
- Efectos.

No colocar toda la lógica del capítulo 2 dentro de `app/index.tsx`.

Extraer componentes compartidos cuando resulte necesario, manteniendo compatibilidad con el capítulo 1.

---

# 16. RENDIMIENTO

El capítulo 2 debe funcionar de manera fluida.

Objetivo de rendimiento:

- 60 FPS cuando el dispositivo pueda mantenerlos.
- Movimiento estable con FPS variables.
- Sin bloqueos prolongados del hilo principal.
- Sin pérdida perceptible de controles.
- Sin recargar todas las texturas en cada habitación.

## Optimizaciones obligatorias

- Renderizar solamente objetos visibles o próximos a la cámara.
- Cargar recursos por habitación o grupo de habitaciones.
- Utilizar atlases.
- Reducir imágenes innecesariamente grandes.
- Evitar renderizados completos de React por cada fotograma.
- Reutilizar sprites y componentes.
- Liberar recursos que ya no sean necesarios.
- Mantener estados complejos fuera del bucle de renderizado.
- Separar la simulación del renderizado.
- Utilizar colisiones eficientes.
- No reproducir sonidos múltiples innecesariamente.

## Métricas

Medir, cuando el entorno lo permita:

- FPS.
- Tiempo de carga inicial.
- Tiempo de transición.
- Uso de memoria.
- Duración de renderizado.
- Tamaño del paquete web.
- Rendimiento del tablero de 66 tarjetas.

No afirmar que se alcanzaron 60 FPS sin medirlos.

---

# 17. AUDIO

Crear o integrar audio original.

Necesitamos:

- Música principal de la biblioteca.
- Música ambiental de investigación.
- Música suave de sala tranquila.
- Música de laberinto.
- Música del desafío final.
- Sonido de pasos.
- Cambio de habitación.
- Apertura de puerta.
- Selección de tarjeta.
- Intercambio.
- Respuesta correcta.
- Respuesta incorrecta.
- Descubrimiento.
- Activación de mecanismos.
- Victoria.
- Obtención de Conocimiento.

Permitir ajustar música y efectos por separado.

Respetar silencio, pausa y ajustes del sistema cuando corresponda.

No utilizar música comercial sin autorización.

---

# 18. EXPERIENCIA DE USUARIO

El diseño debe ser comprensible desde los primeros minutos.

## 18.1. Objetivos

Mostrar el objetivo actual de forma discreta.

El jugador debe saber:

- Qué tiene que hacer.
- Dónde debe hacerlo.
- Qué información necesita.
- Cómo interactuar.
- Qué recompensa obtendrá.

No revelar soluciones automáticamente.

## 18.2. Pistas

Implementar un sistema de pistas progresivas.

Ejemplo:

Primera pista:

Indica qué zona explorar.

Segunda pista:

Indica el tipo de información necesaria.

Tercera pista:

Ofrece una orientación más específica.

No bloquear el juego cuando el jugador no comprende una pregunta.

## 18.3. Accesibilidad

- Texto legible.
- Contraste adecuado.
- Botones suficientemente grandes.
- Controles táctiles.
- Opciones de sonido.
- Reducción de movimiento.
- Identificación visual de elementos interactivos.
- Compatibilidad con teclado.
- Alternativa táctil al arrastre.
- Pausa del cronómetro cuando corresponda.
- Retroalimentación que no dependa solamente del color.

---

# 19. PRUEBAS OBLIGATORIAS

Crear pruebas unitarias, de integración y de navegación real.

## 19.1. Movimiento

Comprobar:

- Arriba.
- Abajo.
- Izquierda.
- Derecha.
- Diagonal.
- Colisiones.
- Interacciones.
- Escaleras.
- Ascensor.
- Puertas.
- Cambios de habitación.
- Cámara.
- Profundidad de sprites.

## 19.2. Progreso

Comprobar las 16 escenas.

Cada escena debe:

- Activarse correctamente.
- Mostrar sus diálogos.
- Presentar sus actividades.
- Validar respuestas.
- Guardar progreso.
- Desbloquear la siguiente.
- Evitar duplicar recompensas.
- Permitir regresar cuando corresponda.

## 19.3. Cuestionarios

Comprobar:

- Opciones mezcladas.
- Respuestas válidas.
- Respuestas incorrectas.
- Pistas.
- Reintentos.
- Guardado parcial.
- Continuación de un intento.
- Preguntas dependientes.
- Diferentes órdenes de opciones.

## 19.4. Debate

Comprobar:

- Documentos disponibles.
- Clasificaciones.
- Información irrelevante.
- Respuestas alternativas.
- Referencias.
- Reacciones del investigador.
- Finalización de la escena.
- Desbloqueo posterior.

## 19.5. Los 66 libros

Crear pruebas específicas para:

- Cantidad total de libros.
- 39 libros hebreoarameos.
- 27 libros griegos cristianos.
- Orden correcto.
- Nombres.
- Abreviaturas.
- IDs únicos.
- Mezcla aleatoria.
- Intercambio por arrastre.
- Intercambio por pulsación.
- Intercambio con teclado.
- Contador de aciertos.
- Temporizador fácil.
- Temporizador medio.
- Temporizador difícil.
- Tiempo agotado.
- Reintento.
- Cambio de dificultad.
- Victoria.
- Récord.
- Guardado.
- Recuperación.
- Desbloqueo de Conocimiento.
- Desbloqueo del capítulo 3.

Las pruebas deben verificar que todas las posiciones pueden corregirse mediante intercambios.

## 19.6. Regresiones

El capítulo 1 deberá seguir funcionando.

Comprobar:

- Movimiento lateral.
- Tutorial.
- Cuaderno.
- Misiones.
- Viajero.
- Guía.
- Plataformas.
- Salud.
- Guardado.
- Cofre de Fe.
- Desbloqueo del capítulo 2.

No aceptar el trabajo si el nuevo motor RPG rompe el bosque.

---

# 20. ORDEN DE IMPLEMENTACIÓN

Trabaja por fases, pero continúa hasta completar el alcance.

## FASE A — AUDITORÍA

Inspeccionar repositorio y dependencias.

Revisar recursos.

Identificar cambios necesarios.

Preparar arquitectura.

Crear rama de trabajo.

## FASE B — SISTEMA RPG

Crear movimiento de cuatro direcciones.

Crear colisiones X/Y.

Crear cámara.

Crear navegación entre habitaciones.

Crear sistema de pisos.

Crear profundidad visual.

## FASE C — ARTE

Crear protagonista en cuatro direcciones.

Crear NPC.

Crear tilesets.

Crear mobiliario.

Crear puertas, escaleras y ascensores.

Crear efectos.

Crear interfaces.

Crear atlas y manifiestos.

## FASE D — ESCENARIOS

Construir las seis regiones.

Crear habitaciones navegables.

Definir colisiones.

Colocar NPC.

Colocar objetos.

Configurar transiciones.

## FASE E — SISTEMAS

Crear misiones.

Crear diálogos.

Crear cuestionarios.

Crear investigación.

Crear inventario.

Crear checkpoints.

Crear guardado.

## FASE F — ESCENAS 01 A 05

Desarrollar introducción, bibliotecaria, catálogo, archivo y bereanos.

## FASE G — ESCENAS 06 A 11

Desarrollar linterna, estudio, visitante, estudiante e investigación completa.

## FASE H — ESCENAS 12 A 15

Desarrollar laberinto, documentos, debate, sala tranquila, último piso y prueba de conocimiento.

## FASE I — ESCENA 16

Desarrollar tablero de 66 tarjetas.

Integrar tres dificultades.

Agregar cronómetro.

Agregar interacciones táctiles.

Agregar validación.

Agregar récords.

Agregar recompensa.

## FASE J — INTEGRACIÓN

Unificar progreso entre capítulos.

Migrar partidas.

Conservar Fe.

Desbloquear Conocimiento.

Desbloquear capítulo 3.

## FASE K — CALIDAD

Ejecutar:

`npm ci`

`npm run typecheck`

`npm test`

`npm run build:web`

Ejecutar también las pruebas de navegador existentes y agregar pruebas nuevas.

Verificar que los cambios funcionan en el navegador y en dispositivos compatibles, cuando estén disponibles.

Corregir los errores encontrados antes de presentar el trabajo como terminado.

---

# 21. DOCUMENTACIÓN Y ENTREGABLES

Crear los siguientes documentos o sus equivalentes integrados en la documentación existente:

### Diseño narrativo

`docs/CHAPTER_2_STORY.md`

Debe contener:

- Historia.
- Personajes.
- Las 16 escenas.
- Diálogos.
- Decisiones.
- Consecuencias.

### Diseño de niveles

`docs/CHAPTER_2_LEVEL_DESIGN.md`

Debe incluir:

- Mapas.
- Habitaciones.
- Pisos.
- Puertas.
- Escaleras.
- NPC.
- Objetos.
- Checkpoints.
- Recorridos.

### Mecánicas

`docs/CHAPTER_2_GAMEPLAY.md`

Debe describir:

- Movimiento RPG.
- Interacciones.
- Misiones.
- Investigación.
- Debate.
- Obstáculos.
- Inventario.
- Guardado.

### Recursos gráficos

`docs/CHAPTER_2_ART.md`

Debe contener:

- Paleta.
- Assets.
- Dimensiones.
- Animaciones.
- Estados.
- Origen.
- Ubicación.
- Imágenes de revisión cuando sea posible.

### Desafío final

`docs/CHAPTER_2_66_BOOKS.md`

Debe documentar:

- Los 66 libros.
- Orden.
- Abreviaturas.
- Mecánica.
- Intercambios.
- Dificultades.
- Cronómetro.
- Reglas.
- Validaciones.
- Récords.

### Pruebas

`docs/CHAPTER_2_VALIDATION.md`

Registrar:

- Pruebas ejecutadas.
- Resultado.
- Errores corregidos.
- Limitaciones.
- Problemas pendientes.
- Evidencias verificables.

---

# 22. CRITERIOS DEFINITIVOS DE ACEPTACIÓN

El capítulo 2 solamente podrá considerarse completo si:

1. El jugador puede acceder desde el diario después de completar el capítulo 1.
2. La protagonista conserva la herramienta Fe.
3. Existe un mundo RPG de cuatro direcciones.
4. Puede recorrer habitaciones reales.
5. Puede subir y bajar pisos.
6. Existen estanterías, mesas, puertas y objetos interactivos.
7. Hay profundidad y ocultación correcta de personajes.
8. Los personajes están animados.
9. Se han implementado las 16 escenas.
10. Los diálogos son funcionales.
11. Las preguntas muestran opciones variables.
12. El jugador puede utilizar pistas.
13. El sistema guarda el avance de los cuestionarios.
14. La biblioteca puede recorrerse sin bloqueos.
15. Se puede utilizar la linterna de Fe.
16. El visitante responde a las decisiones.
17. La estudiante participa en una investigación.
18. Existe el laberinto de las ideas.
19. Se pueden consultar documentos.
20. Se puede distinguir entre opinión, información irrelevante y evidencia.
21. El investigador desarrolla un debate interactivo.
22. Las actividades se fundamentan en referencias bíblicas verificadas.
23. Se mantienen tres corazones.
24. Funcionan los checkpoints.
25. Existe una gran sala final.
26. Se pueden organizar los 66 libros.
27. Funciona arrastrar y soltar.
28. Funciona pulsar para intercambiar.
29. Funcionan los modos de 3, 6 y 10 minutos.
30. El cronómetro se conserva al reanudar.
31. Se detecta automáticamente el orden correcto.
32. Se registran récords personales.
33. Se obtiene Conocimiento.
34. Se desbloquea el capítulo 3.
35. El progreso se guarda en móvil.
36. El progreso puede exportarse e importarse en web.
37. El capítulo 1 sigue funcionando.
38. No existen errores conocidos que impidan terminar el capítulo.
39. Los recursos gráficos están integrados y no son solamente imágenes sueltas.
40. Se ejecutan las comprobaciones técnicas disponibles.
41. Se documentan honestamente los resultados de las pruebas y sus limitaciones.
42. Existe un PR revisable con los cambios implementados.

---

# 23. INSTRUCCIÓN FINAL PARA CODEX

Quiero que desarrolles el capítulo 2 completo del videojuego existente.

No quiero únicamente una propuesta visual.

No quiero solamente textos y documentación.

No quiero un ejemplo de movimiento.

No quiero un tablero aislado de los 66 libros.

Quiero que todos estos elementos formen parte de una misma experiencia jugable, coherente y persistente.

**Debes crear el arte original necesario, programar los mecanismos, construir las habitaciones, integrar las animaciones, incorporar los diálogos, implementar las preguntas, crear el sistema de investigación, programar el debate y desarrollar el reto final.**

Respeta la arquitectura actual del repositorio.

No elimines el capítulo 1.

Utiliza React Native, Expo, TypeScript y el sistema gráfico compatible con el proyecto.

Aplica buenas prácticas de UX, accesibilidad, rendimiento y mantenimiento.

No inventes resultados de pruebas.

No marques como terminado un sistema que todavía use simulaciones o elementos provisionales.

Si una función necesita un recurso adicional, créalo cuando sea posible mediante las herramientas disponibles. Si no es posible producirlo con calidad suficiente, documenta claramente la limitación sin comprometer la funcionalidad del juego.

Trabaja por commits coherentes y crea un PR para revisión.

Al finalizar, entrega un informe que incluya:

- Número y enlace del PR.
- Resumen de cambios.
- Archivos creados.
- Recursos gráficos generados.
- Escenarios implementados.
- Misiones funcionales.
- Sistemas integrados.
- Pruebas ejecutadas.
- Resultados.
- Evidencia visual.
- Limitaciones pendientes.

**META FINAL:**

Al terminar, debo poder abrir «El camino de una Precursora», completar el bosque de la Fe, entrar a la Biblioteca del Aprendizaje, explorar un mundo RPG pixel art de cuatro direcciones, conversar con sus personajes, investigar referencias, resolver desafíos, distinguir información útil de razonamientos engañosos, participar en un debate respetuoso, superar los obstáculos del archivo superior y finalmente organizar los 66 libros de la Biblia antes de que termine el tiempo.

Después de conseguirlo, la protagonista deberá recibir el Conocimiento y desbloquear «El puente del valor».

Todo debe funcionar como un videojuego real.

# FIN DEL PROMPT