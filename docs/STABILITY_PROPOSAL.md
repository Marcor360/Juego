# Propuesta de estabilización: Capítulo 1

**Rama:** `fix/ch1-progress-performance-20261104`
**Base:** `main`, incorporado en esta rama durante la revisión
**Alcance:** correcciones técnicas sin modificar preguntas bíblicas, diálogos ni su evaluación.

## Correcciones incluidas en este PR

1. **Tutorial y cuaderno:** el diario presenta requisitos visibles y un botón **Finalizar preparación** cuando los cuatro controles ya se practicaron. Se conserva la interacción tradicional con el libro físico; ambos recorridos ejecutan los diálogos y el mismo cierre `CH1_01`. No se conceden avances si faltan acciones.
2. **Simulación a baja frecuencia:** ampliar el margen de recuperación por fotograma de 66,7 ms a 200 ms, manteniendo los pasos físicos de 1/120 s y evitando acumulaciones ilimitadas. Con FPS menores a 15, la versión anterior tendía a cámara lenta por descartar tiempo real.
3. **HUD:** comprobar proximidad, zona y sector de cámara a intervalos de 100 ms; actualizar el estado React únicamente si cambia la información, en vez de invocar setters constantemente.
4. **Renderizado:** omitir fondos, objetos, segmentos, peligros y plataformas alejados de la cámara. Se conserva un margen de 240 px para evitar apariciones repentinas. **Limitación:** los PNG aún se inicializan en el renderer; esta mejora reduce nodos dibujados pero no resuelve por sí sola la memoria de texturas.
5. **Partidas locales:** validar cada candidato de forma independiente. Si la partida v2 está dañada, intentar conservar un respaldo y recuperar la v1 cuando exista; informar al jugador sin borrar datos automáticamente.
6. **Pruebas/CI:** añadir pruebas unitarias del decodificador de partidas y ejecutar TypeScript, pruebas de lógica y exportación web en los PR.

## Correcciones añadidas tras revisar el PR

- Integración de `main`: se conservan los tres menús nuevos, sus ilustraciones, los vestuarios y la composición vertical.
- El estado de cámara y HUD se sincroniza inmediatamente al restaurar o reaparecer. El margen del renderer no depende de esperar 100 ms durante un diálogo o una pausa.
- Los segmentos largos del suelo también se recortan por teselas; no basta con descartar segmentos enteros alejados.
- Un reloj físico acotado conserva la fracción de tiempo entre fotogramas, con pruebas equivalentes a 5, 10, 15, 30, 60 y 120 FPS.
- El repositorio de guardado inyecta el almacenamiento para probar el flujo completo, además del decodificador. Conserva el último candidato válido y archiva candidatos dañados sin reemplazar el primer respaldo existente.
- Una lectura fallida no bloquea los candidatos independientes. Si falla el respaldo, se rechaza la escritura que sobrescribiría los datos. La sesión más reciente permanece disponible para descarga.
- Los avisos importantes se mantienen hasta leerlos y no se anuncia «Partida guardada» cuando la escritura falla. Se controlan también los errores al guardar ajustes.
- Se corrigió la importación de `URL` en la prueba de menús para evitar la incompatibilidad entre tipos DOM y Node en CI.
- No faltaban ilustraciones para este alcance. Se comprobaron fondos, suelo, plataformas, personajes y portadas en navegador, sin generar recursos redundantes.

## Criterios de aceptación

- [x] El primer tutorial se completa usando el cuaderno, sin requerir encontrar otra vez el libro si ya se practicaron los controles.
- [x] Los cuatro indicadores del tutorial se conservan tras guardar y continuar.
- [x] Una partida v2 válida carga sin cambios.
- [x] Una partida v2 inválida no impide recuperar una v1 válida; se muestra aviso.
- [x] Las 16 escenas existentes y el cofre siguen funcionando.
- [x] No aparecen huecos de fondo al avanzar por límites de sectores de cámara.
- [x] En web táctil se conserva la respuesta a saltar e interactuar; falta validar teléfonos nativos físicos.
- [x] `npm run typecheck`, `npm test` (39 pruebas) y `npm run build:web` aprobados localmente. El estado remoto de CI se revisa después de subir la rama.

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

## Actualización de implementación

El guardado parcial de cuestionarios, el respaldo nativo y la automatización de navegador ya están implementados. Ver `GUARDADO_PARCIAL_Y_RESPALDOS.md` para el alcance actual. Las pruebas con teléfonos físicos y el rendimiento medido siguen pendientes.
