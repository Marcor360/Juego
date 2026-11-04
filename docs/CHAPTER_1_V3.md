El camino de una Precursora
Capítulo 1 · Documento de diseño completo v3.0
El bosque de las dudas
Voy a completar el diseño del primer capítulo para que tengamos una base sólida antes de programarlo. Incluiremos el guion, las conversaciones alternativas, la distribución exacta del escenario, las mecánicas, los personajes, los recursos visuales y las condiciones para completar cada misión.

La idea central se mantiene: la protagonista comienza con miedo e incertidumbre, pero descubre que la fe se demuestra mediante decisiones, confianza en Jehová, ayuda a los demás y acciones concretas.
Duración objetivo45–60 minutos

GéneroAventura / Plataformas 2D

Dificultad inicialFácil → Media-alta

RecompensaFe — Linterna



Las actividades secundarias podrán añadir otros 15–25 minutos. Estas duraciones son objetivos que deberán validarse jugando.

1. Estructura definitiva del capítulo
Tendremos 16 escenas narrativas organizadas en seis zonas físicas. Algunas serán conversaciones, otras exploración y otras desafíos de plataformas.
Escena	Acontecimiento	Acción del jugador
01	El comienzo de la aventura	Aprender controles, preparar el cuaderno
02	Primer encuentro con la guía	Conversar y estudiar Hebreos 11
03	Primera señal: observar	Explorar y corregir una señal
04	Segunda señal: escuchar	Investigar información contradictoria
05	Tercera señal: pedir ayuda	Resolver un obstáculo
06	El puente dañado	Superar plataformas y buscar un desvío
07	Encuentro con el viajero	Escucharlo y entender su preocupación
08	Un texto oportuno	Seleccionar y aplicar un texto bíblico
09	La ayuda práctica	Resolver un rompecabezas cooperativo
10	Segundo encuentro con la guía	Descansar, conversar y recuperar salud
11	El segundo farol	Reparar el camino y explicar una decisión
12	La niebla del bosque	Superar obstáculos de mayor dificultad
13	La prueba de confianza	Resolver y aplicar Proverbios 3:5, 6
14	La llegada al refugio	Explicar lo sucedido y entregar el mapa
15	El cofre de la Fe	Obtener la herramienta y celebrar
16	Una nueva pregunta	Descubrir la biblioteca del capítulo 2

La progresión será lineal a nivel narrativo, pero permitirá explorar libremente las zonas desbloqueadas y regresar a lugares anteriores hasta llegar al punto de no retorno.
2. Diseño técnico del mapa
Utilizaremos un mundo horizontal continuo, con cámara lateral y escenarios por capas.
Distribución espacial · No es una imagen a escala
1. Entrada

2. Arroyo

3. Puente

4. Claro

5. Niebla

6. Refugio



Para implementarlo en React Native, propongo estas medidas iniciales:
Parámetro	Valor de diseño
Resolución lógica	480 × 270 px
Tamaño de tile	16 × 16 px
Mundo completo	8,000 px aprox.
Altura del mundo	270 px
Orientación	Horizontal
Cámara	Seguimiento suave con límites
Escala de sprites	Entera cuando el dispositivo lo permita
Guardado	Por checkpoints y objetivos

Distribución por coordenadas
Coordenadas de diseño provisionales, en píxeles lógicos del mundo.
Zona	Coordenadas X	Elementos importantes
Entrada	0–1120	Inicio, tutorial, primera guía
Arroyo	1120–2560	Tres señales, caminante, checkpoint 1
Puente	2560–4000	Puente roto, viajero, primer farol
Claro	4000–5120	Guía, descanso, segundo farol
Niebla	5120–7040	Punto de no retorno, plataformas, acertijo
Refugio	7040–8000	Entrega del mapa, cofre, epílogo

La guía estará inicialmente alrededor de X=600. El viajero aparecerá alrededor de X=3100. La guía reaparecerá en el claro, alrededor de X=4400, tras avanzar la historia.

No serán seis pantallas aisladas: el jugador las recorrerá con una cámara que se desplaza horizontalmente.
3. Plataformas, vida y dificultad
El personaje comenzará con tres corazones, que representarán su resistencia física durante la exploración.
Prueba del sistema de salud
Estado de la protagonista


Simular tropiezoDescansar
Salud completa.
Reglas definitivas
Situación	Consecuencia
Caer al agua o a un hueco	Pierde un corazón y reaparece sobre suelo seguro cercano
Tropezar con una rama	Pierde un corazón, con breve invulnerabilidad
Elegir una respuesta incorrecta	Recibe orientación; no pierde salud
Quedarse sin corazones	Regresa al checkpoint con tres corazones
Descansar en el claro	Recupera los tres corazones
Completar una misión	Se guarda automáticamente
Repetir una misión ya terminada	No duplica recompensas

No habrá un límite de intentos ni pérdida del progreso narrativo al quedarse sin corazones.
Parámetros físicos iniciales
Mecánica	Propuesta
Velocidad horizontal	115 px/s
Gravedad	900 px/s²
Impulso de salto	−300 px/s
Altura máxima de salto	50 px aprox.
Huecos ordinarios	20–36 px
Huecos difíciles	Hasta 44 px
Coyote time	100 ms
Buffer de salto	120 ms
Invulnerabilidad tras daño	800 ms

Estos valores se ajustarán tras probar las animaciones reales y las colisiones de la protagonista. Las plataformas nunca deben exigir un salto que el motor no pueda realizar.

La cámara tendrá anticipación hacia la dirección de movimiento para que el jugador pueda ver los obstáculos antes de alcanzarlos.
4. Guion completo de las escenas
Los textos siguientes son diálogos originales del videojuego. Las referencias bíblicas se conservarán separadas para que podamos comprobarlas y mostrarlas correctamente.
Acto I — Aprender a confiar
Escena 01 · Una aventura por comenzar

La protagonista prepara su cuaderno y comprueba el mapa.
Protagonista: «Hoy empieza un camino nuevo. He preparado todo... o al menos eso creo».

Protagonista: «Me emociona conocer lo que hay más adelante, pero también siento un poquito de miedo».

El jugador aprende a caminar, saltar, abrir el cuaderno e interactuar. Una vez que complete las cuatro acciones, aparece el indicador para avanzar.


Escena 02 · La guía del bosque
Guía: «Veo que te preparas para un viaje importante».

Protagonista: «Sí, aunque me gustaría saber que todo saldrá bien».

Guía: «¿Recuerdas a Abrahán? Él demostró fe incluso cuando no conocía todos los detalles de lo que le esperaba».

Protagonista: «Entonces, ¿tener fe no significa conocer de antemano todo lo que va a pasar?».

Guía: «Exactamente. Pero tampoco significa caminar sin pensar. Puedes confiar en Jehová y ser prudente al mismo tiempo».

Se introduce Hebreos 11:1, 8. 
Traducción del Nuevo Mundo


Actividad: comparar tres afirmaciones entre información comprobada, información no confirmada y preguntas pendientes. Desbloquea el mapa del bosque.


Escena 03 · Una señal equivocada

La protagonista descubre un letrero que indica una ruta aparentemente corta.
Protagonista: «Este sendero parece más rápido, pero las marcas del mapa no coinciden. Será mejor comprobarlo».

Actividad: saltar entre rocas, observar marcas del suelo y ordenar tres fragmentos de un letrero. La solución correcta identifica que el puente está dañado. La primera señal queda reparada.


Escena 04 · Dos versiones de la misma historia
Caminante: «Yo crucé ese puente ayer. Estaba perfectamente bien».

Protagonista: «Gracias por contármelo. ¿Recuerdas a qué hora cruzaste?».

Caminante: «Ayer por la mañana, antes de la tormenta».

Protagonista: «¡Ahora entiendo! Entonces pudo haberse dañado después».

Actividad: formular preguntas sobre el momento y el lugar de los acontecimientos. Aplica Santiago 1:19 y desbloquea la segunda señal. 
Traducción del Nuevo Mundo



Escena 05 · No tengo que hacerlo todo sola

Una rama impide alcanzar la tercera señal.
Protagonista: «Creo que puedo moverla... ¡Uf! Es mucho más pesada de lo que parece».

Protagonista: «Tal vez sea mejor buscar otra manera de resolverlo».

Actividad: explorar para encontrar una palanca o solicitar ayuda a una caminante cercana. Ambas soluciones permiten avanzar, pero incluyen una pequeña reflexión diferente.

Se restaura la tercera señal y aparece el primer checkpoint.


Acto II — Demostrar la fe con acciones
Escena 06 · El puente que no podemos cruzar
Protagonista: «¡Oh, no! Justo el puente que necesitaba cruzar... ¿Y ahora? Había prometido llegar temprano».

Actividad: comprobar el puente desde una distancia segura, evitar las tablas deterioradas y encontrar un desvío con plataformas.

Si se aproxima demasiado al borde, una tabla se rompe y la protagonista retrocede. El jugador recibe una advertencia visual, no un castigo inmediato.


Escena 07 · El viajero desanimado
Protagonista: «Hola. ¿Te encuentras bien?».

Viajero: «No estoy seguro. Pensé que conocía este camino, pero ahora todo parece diferente».

Protagonista: «¿Quieres contarme qué ocurrió?».

Viajero: «Intenté cruzar el puente. Cuando vi lo dañado que estaba, regresé. Desde entonces no dejo de pensar en lo que podría haber pasado».

Actividad: elegir cómo escucharlo y responder. Una respuesta poco empática permite reconocer el error y volver a intentarlo. Ninguna decisión irreversible bloqueará su ayuda.


Escena 08 · Una respuesta que realmente ayude

La protagonista abre el cuaderno bíblico.
Viajero: «Me gustaría confiar más, pero no sé qué decisión tomar».

Protagonista: «Conozco un texto que me ayuda cuando necesito sabiduría. ¿Te gustaría que lo buscáramos juntos?».

Actividad: seleccionar una referencia apropiada, explicar por qué se relaciona con el problema y proponer un paso práctico.

Si elige Santiago 1:5 y explica que pueden pedir sabiduría y comprobar juntos la ruta, la conversación avanza. Otras referencias relevantes también podrán aceptarse si la explicación es coherente.


Escena 09 · No basta con hablar
Viajero: «Gracias por escucharme. ¿Crees que podríamos hacer algo para que otros no se acerquen al puente roto?».

Protagonista: «¡Claro! Podríamos reparar la señal y encender el farol del desvío».

Viajero: «Yo puedo ayudarte a buscar las piezas».

Actividad: conseguir una cubierta y una mecha, reparar un farol y marcar la ruta segura. El viajero sujetará una cuerda que permite alcanzar una plataforma elevada.

Esta misión aplica el principio de Santiago 2:14–17: las buenas intenciones deben acompañarse de ayuda práctica. 
Traducción del Nuevo Mundo



Escena 10 · Volvemos a encontrar a la guía
Guía: «¡Me alegra volver a verte! ¿Cómo ha ido tu viaje?».

Protagonista: «Ha sido más difícil de lo que imaginaba. Me equivoqué algunas veces y tuve miedo».

Guía: «¿Y has aprendido algo de esas experiencias?».

Protagonista: «Que puedo reconocer cuando no sé algo, pedir ayuda y pensar antes de actuar».

Guía: «Entonces ya has aprendido mucho. Descansa un poco; todavía te queda camino».

Actividad: recuperar corazones, revisar lo aprendido y preparar el siguiente tramo. El jugador podrá elegir una preocupación concreta y una petición de sabiduría relacionada con Santiago 1:5.

No será un minijuego que puntúe la oración: será una escena narrativa de reflexión.

Se activa el segundo checkpoint.


Escena 11 · El desacuerdo del segundo farol

Otro viajero quiere colocar el farol junto al puente dañado.
Viajero secundario: «Si lo colocamos aquí, será más rápido para todos».

Protagonista: «Entiendo lo que dices, pero encontramos señales de que ese camino no es seguro».

Viajero secundario: «¿Y cómo lo sabes?».

Protagonista: «Revisamos el puente, hablamos con quienes pasaron por aquí y encontramos un desvío. Podemos señalizarlo juntos».

Actividad: consultar tres evidencias del diario, seleccionar dónde colocar el farol y explicar la elección respetuosamente.

Una vez encendido, se desbloquea el último tramo del bosque.


Acto III — El camino continúa
Escena 12 · La niebla y los obstáculos
Protagonista: «Casi no puedo ver lo que hay delante».

Viajero: «Reconozco algunos de estos árboles. Creo que hay una zona desde la que podremos orientarnos».

Protagonista: «Entonces caminemos con cuidado. No tenemos que apresurarnos».

Actividad: superar una secuencia de plataformas móviles, ramas y piedras húmedas, aprovechando señales del compañero. Cuando el jugador falla, reaparece en el último punto seguro y puede intentarlo nuevamente.


Escena 13 · ¿Qué significa confiar?

La protagonista encuentra una inscripción con una referencia a Proverbios 3:5, 6.

Actividad 1: ordenar palabras para completar una frase bíblica.

Actividad 2: decidir entre seguir una señal antigua o utilizar la información comprobada. El jugador deberá demostrar que confiar en Jehová no equivale a ignorar la realidad ni actuar imprudentemente.
Protagonista: «Confiar no significa cerrar los ojos ante los problemas. Puedo seguir adelante usando lo que he aprendido».

Viajero: «Y ahora también conocemos un camino más seguro».

La aplicación propuesta concuerda con la explicación del pasaje publicada en JW.ORG. 
JW.ORG



Escena 14 · La llegada y la sinceridad
Encargada del refugio: «Nos preocupamos al ver que no llegaban. ¿Qué ocurrió?».

Protagonista: «La tormenta dañó el puente principal y tuvimos que tomar otro camino».

Encargada: «Gracias por avisarnos. ¿Pudieron comprobar por dónde se puede pasar?».

Protagonista: «Sí. Corregimos las señales y trajimos un mapa actualizado. También reconozco que debí comunicar el retraso antes».

Encargada: «Eso ayudará mucho a quienes tengan que cruzar mañana».

Actividad: presentar la información correcta sobre la ruta. Si el jugador intenta ocultar la equivocación o culpar a otro personaje, se abrirá una opción de rectificación.


Escena 15 · La linterna de la Fe

La encargada entrega una pequeña caja de suministros. La guía, que dejó una nota para los viajeros en el refugio, ha preparado una insignia para recordar lo aprendido.
Protagonista: «Cuando comencé este viaje, pensé que tener fe significaría no volver a sentir miedo».

Viajero: «Pero hoy tuviste miedo y aun así encontraste maneras de seguir adelante».

Protagonista: «Y no lo hice sola. Gracias por acompañarme».

Actividad: abrir el cofre, recibir la linterna, ver un breve resumen de las decisiones tomadas y activar la animación de victoria.

Se desbloquea permanentemente la herramienta Fe.


Escena 16 · La próxima aventura
Protagonista: «Ahora sé que todavía me quedan muchas cosas por aprender».

Viajero: «¿Sabías que en este refugio hay una biblioteca?».

Protagonista: «¡Entonces ya sé dónde comenzará mi siguiente aventura!».

La cámara enfoca una puerta iluminada. Aparece el título del capítulo 2, La biblioteca del aprendizaje, sin mostrar todavía sus desafíos.


5. Sistema de decisiones y consecuencias
Las conversaciones deben cambiar el desarrollo de cada encuentro, pero sin convertir las respuestas en un examen que castigue al jugador.
Decisión	Respuesta adecuada	Si se equivoca
Guía: ¿qué es tener fe?	Relacionar la confianza con actuar de forma prudente	La guía ofrece un ejemplo y permite reconsiderarlo
Caminante: datos contradictorios	Preguntar cuándo ocurrió cada hecho	Aparece una pista sobre la tormenta
Viajero: expresa miedo	Escuchar antes de aconsejar	El viajero se muestra reservado hasta que se retoma la conversación
Texto bíblico para el viajero	Elegir una referencia pertinente y explicar su aplicación	Se puede consultar nuevamente el cuaderno
Segundo farol	Explicar por qué el atajo es peligroso	El otro viajero pide pruebas adicionales
Llegada al refugio	Informar con sinceridad y asumir la responsabilidad	Se permite rectificar antes de terminar la misión

El cuaderno de la protagonista
En vez de mostrar únicamente respuestas correctas e incorrectas, el cuaderno guardará pequeñas reflexiones según las decisiones.

Por ejemplo:
Mi cuaderno de viaje


DÍA 1 · EL BOSQUE DE LAS DUDAS

Hoy descubrí que escuchar con paciencia puede ayudarme a comprender mejor lo que sienten los demás.

También aprendí que no necesito resolver cada problema por mi cuenta y que pedir ayuda puede ser una buena decisión.
Reflexiones registradas: 2


El cuaderno será consultable desde el inventario. Sus entradas dependerán de las acciones realizadas, no de una puntuación de espiritualidad.
6. Posición y comportamiento de los personajes
Necesitamos que los NPC no estén siempre en el mismo lugar repitiendo sus conversaciones.
Personaje	Ubicación inicial	Cambio de estado
Guía	X=600, entrada	Después del primer diálogo queda disponible para preguntas adicionales
Caminante	X=1800, arroyo	Al resolver la segunda señal cambia su diálogo
Viajero	X=3100, puente	Tras completar el diálogo, acompaña a la protagonista
Guía, segundo encuentro	X=4400, claro	Aparece cuando se alcanza el claro; deja de estar en la entrada
Viajero secundario	X=4850, segundo farol	Permanece hasta resolver el desacuerdo
Encargada	X=7340, refugio	Recibe el mapa y desbloquea el cierre

Cuando el viajero se convierta en compañero, seguirá a la protagonista manteniendo una distancia aproximada. En tramos difíciles utilizará puntos seguros predefinidos para evitar caídas repetidas o quedar atrapado.

Si el jugador retrocede, los personajes mantendrán su estado narrativo.
El punto de no retorno
Lo colocaremos justo antes de entrar en la niebla, aproximadamente en X=5060.

Para atravesarlo deben cumplirse las siguientes condiciones:
- Las tres señales están reparadas.
- La conversación con el viajero está completada.
- El primer farol está encendido.
- El segundo encuentro con la guía ha ocurrido.
- El segundo farol está colocado correctamente.
Antes de continuar se mostrará una confirmación. Una vez cruzado, se activará automáticamente un checkpoint dentro de la nueva zona, para que el jugador nunca reaparezca detrás de una barrera cerrada.
7. Recursos visuales que necesitaremos
Para convertir el concepto en un juego visualmente consistente, cada escenario debe construirse con recursos reutilizables.









Zona 1. Entrada del bosque

Verde luminoso, árboles grandes, sendero de tierra y flores pastel. Sensación de tranquilidad y comienzo de aventura.












Zona 2. El arroyo

Agua animada, rocas, pequeños saltos, señales de madera, vegetación húmeda y partículas de luz.












Zona 3. El puente

Puente deteriorado, barranco, senderos alternativos, cuerdas y plataformas de piedra. Mayor contraste y tensión.












Zona 4. El claro

Faroles cálidos, bancos, árboles pequeños y una zona segura para conversar y recuperar la salud.












Zona 5. La niebla

Tonos azulados, ruinas, niebla animada, plataformas móviles y pequeñas fuentes de iluminación.












Zona 6. El refugio

Edificio acogedor entre árboles, luz dorada, una mesa con mapas, un cofre y la entrada a la futura biblioteca.



Estas imágenes son referencias de ambiente para los escenarios; todavía no son los fondos finales ni los tilesets del proyecto.Inventario de recursos gráficos
Recurso	Formato / tamaño de referencia
Fondos de seis zonas	Capas repetibles PNG/WebP
Tileset de suelo, roca y vegetación	Tiles de 16 × 16 px
Protagonista	Spritesheet existente, por depurar
Guía del bosque	Sprites y retrato pixel art
Viajero	Sprites y retrato pixel art
Caminante y viajero secundario	Sprites y retratos
Encargada del refugio	Sprites y retrato
Faroles apagados y encendidos	Sprites con animación
Señales reparables	Objetos con distintos estados
Cuaderno y mapas	UI e ilustraciones
Cofre del refugio	Animación de apertura
Linterna de Fe	Ícono de inventario y efecto luminoso
Partículas, niebla y agua	Sprites animados o efectos programados

La prioridad será crear los escenarios en capas y mantener los objetos interactivos separados del fondo, de modo que puedan modificarse realmente cuando el jugador complete las misiones.
8. Estructura de misiones para programación
Para no depender de comprobar diálogos por posición o de variables aisladas, cada actividad tendrá un identificador y condiciones explícitas.
ID	Objetivo	Condición de finalización
CH1_01	Preparar el viaje	Tutorial y cuaderno completados
CH1_02	Hablar con la guía	Primer diálogo finalizado
CH1_03	Reparar la primera señal	Pistas verificadas
CH1_04	Comprender la segunda señal	Información contrastada
CH1_05	Liberar la tercera señal	Obstáculo resuelto
CH1_06	Investigar el puente	Desvío descubierto
CH1_07	Escuchar al viajero	Conversación completada
CH1_08	Ofrecer ayuda bíblica	Texto explicado y aplicado
CH1_09	Reparar el primer farol	Piezas instaladas
CH1_10	Descansar con la guía	Segundo diálogo completado
CH1_11	Colocar el segundo farol	Ruta segura señalizada
CH1_12	Cruzar la niebla	Plataformas superadas
CH1_13	Superar el reto de confianza	Acertijo y decisión resueltos
CH1_14	Entregar el mapa	Informe completado
CH1_15	Abrir el cofre	Fe incorporada al inventario
CH1_16	Descubrir el próximo destino	Capítulo 2 desbloqueado

Ejemplo de partida guardada
El estado persistente podría tener esta estructura:
{
  "schemaVersion": 2,
  "gameId": "camino-precursora",
  "chapter": 1,
  "checkpoint": "ch1_claro",
  "health": 3,
  "completedMissions": [
    "CH1_01",
    "CH1_02",
    "CH1_03",
    "CH1_04",
    "CH1_05",
    "CH1_06",
    "CH1_07",
    "CH1_08",
    "CH1_09",
    "CH1_10"
  ],
  "decisions": {
    "travelerSupport": "listen",
    "bridgeRoute": "safe_detour"
  },
  "tools": [],
  "unlockedChapters": [1],
  "worldFlags": {
    "guideAtClearing": true,
    "travelerCompanion": true,
    "firstLanternLit": true,
    "secondLanternLit": false
  }
}


En móvil, la partida se guardará automáticamente en almacenamiento persistente. En web podrá exportarse e importarse en JSON. Al cargarla, se comprobarán la versión y la coherencia de sus estados.

Las partidas del prototipo anterior, que solo consideraba seis misiones, necesitarán una migración explícita para no marcar incorrectamente escenas nuevas como completadas.