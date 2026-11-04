# Propuesta de estabilización: Capítulo 1

**Rama:** `fix/ch1-progress-performance-20261104`  
**Base:** `main`  
**Alcance:** correcciones técnicas sin modificar preguntas bíblicas, diálogos ni su evaluación.

## Correcciones incluidas en este PR

1. **Tutorial y cuaderno:** el diario presenta requisitos visibles y un botón **Finalizar preparación** cuando los cuatro controles ya se practicaron. Se conserva la interacción tradicional con el libro físico; ambos recorridos ejecutan los diálogos y el mismo cierre `CH1_01`. No se conceden avances si faltan acciones.
2. **Simulación a baja frecuencia:** ampliar el margen de recuperación por fotograma de 66,7 ms a 200 ms, manteniendo los pasos físicos de 1/120 s y evitando acumulaciones ilimitadas. Con FPS menores a 15, la versión anterior tendía a cámara lenta por descartar tiempo real.
3. **HUD:** comprobar proximidad, zona y sector de cámara a intervalos de 100 ms; actualizar el estado React únicamente si cambia la información, en vez de invocar setters constantemente.
4. **Renderizado:** omitir fondos, objetos, segmentos, peligros y plataformas alejados de la cámara. Se conserva un margen de 240 px para evitar apariciones repentinas. **Limitación:** los PNG aún se inicializan en el renderer; esta mejora reduce nodos dibujados pero no resuelve por sí sola la memoria de texturas.
5. **Partidas locales:** validar cada candidato de forma independiente. Si la partida v2 está dañada, intentar conservar un respaldo y recuperar la v1 cuando exista; informar al jugador sin borrar datos automáticamente.
6. **Pruebas/CI:** añadir pruebas unitarias del decodificador de partidas y ejecutar TypeScript, pruebas de lógica y exportación web en los PR.

## Criterios de aceptación

- [ ] El primer tutorial se completa usando el cuaderno, sin requerir encontrar otra vez el libro si ya se practicaron los controles.
- [ ] Los cuatro indicadores del tutorial se conservan tras guardar y continuar.
- [ ] Una partida v2 válida carga sin cambios.
- [ ] Una partida v2 inválida no impide recuperar una v1 válida; se muestra aviso.
- [ ] Las 16 escenas existentes y el cofre siguen funcionando.
- [ ] No aparecen huecos de fondo al avanzar por límites de sectores de cámara.
- [ ] En móvil se conserva la respuesta a saltar e interactuar.
- [ ] `npm run typecheck`, `npm test` y `npm run build:web` en verde.

## Siguientes PR (no incluidos)

### PR 2 · Cuestionarios y guardado de sesión

- Guardar el paso y las opciones aceptadas tras cada pregunta.
- Reabrir un cuestionario justo donde se dejó, sin repetir pasos.
- Mostrar retroalimentación específica por pregunta y opciones de rectificación.
- Proteger datos de partida cuando cambia el contenido entre versiones.

### PR 3 · Rendimiento de recursos gráficos

- Dividir la escena en zonas con carga diferida real y liberación de texturas.
- Reducir/optimizar fondos PNG y separar capas de paralaje.
- Medir FPS p50/p95, bloqueo del hilo JS, tiempo hasta primer cuadro y memoria en un teléfono Android de gama media.
- Ajustar velocidad, aceleración, control de salto y tamaño de colisiones con pruebas de juego.
- Conservar las opciones de accesibilidad y movimiento reducido.

### PR 4 · Pruebas integrales

- Completar una partida real de inicio a fin en navegador sin inyectar partidas preparadas entre escenas.
- Probar interrupción durante cada diálogo, pregunta, animación del cofre y checkpoint.
- Probar importación/exportación cruzada web–móvil, reinicios forzados y pérdida del foco.
- Habilitar pruebas de interfaz web en CI con Playwright y Chromium.
- Validar visualmente en Android e iOS físicos.

## Notas de alcance

Este PR no afirma tiempos de respuesta o FPS medidos: hay que ejecutar pruebas reales.
La duración del capítulo, la pedagogía de la Fe y las preguntas basadas en JW.ORG seguirán pendientes de aprobación editorial.
No fusionar con `main` hasta revisar CI y comprobar el tutorial y el mapa en el navegador.
