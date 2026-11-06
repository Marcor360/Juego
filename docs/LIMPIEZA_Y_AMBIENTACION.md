# Limpieza, movimiento y ambientes

## Archivos retirados

Se comprobaron las importaciones de la aplicación y los scripts antes de retirar el paquete antiguo: 138 imágenes sin uso, dos WAV sustituidos y el manifiesto que apuntaba a las hojas antiguas. Son 141 archivos y 10.555.272 bytes, detallados en `REMOVED_ASSETS.json`. Incluye las carpetas de ejemplos señaladas: talk, walk_left, receive_fe, portrait y stumble, junto con el resto de cuadros segmentados y hojas obsoletas. También se eliminó el antiguo contenido narrativo sin referencias y funciones de renderizado que ya no se ejecutaban.

Las pruebas ya verifican recursos activos y que los paquetes antiguos no reaparezcan. Los originales de los atlas actuales siguen presentes porque son la entrada del proceso de optimización. Se actualizaron la guía rápida, los README de arte/audio y el inventario; permanecen 44 imágenes, todas originales activas o copias de ejecución.

## Movimiento y errores

- Aceleración corta, frenado rápido y control horizontal en el aire. La velocidad máxima sigue siendo 115 px/s; la física mantiene pasos fijos y saltos con margen de borde/buffer.
- Soltar el salto limita la subida; mantenerlo permite alcanzar más altura. Teclado y pantalla táctil comunican también la liberación, y las instrucciones lo explican.
- Los pasos, el tutorial y la animación cuentan desplazamiento real. Empujar una pared no reproduce una caminata inexistente, no da por practicado caminar y detiene la velocidad horizontal.
- Las colisiones horizontales no recolocan al personaje cuando no hay movimiento horizontal.
- El refugio deja de heredar la niebla del tramo anterior.

## Dirección ambiental

El follaje original nuevo ocupa solo los bordes; el 97,2 % del lienzo es transparente. Tiene una copia compacta de unos 35 kB y aporta profundidad con balanceo y paralaje suaves. El centro y los apoyos del recorrido se mantienen despejados.

La entrada tiene partículas cálidas; el arroyo, reflejos y agua; el puente, más viento y crujidos; el claro, luz cálida y deriva lenta; la niebla, bruma móvil y partículas frías; el refugio, luz cálida y puntos luminosos. Las ráfagas combinan oscilaciones con períodos distintos. El ajuste de movimiento reducido fija la deriva, el balanceo, los reflejos y los destellos decorativos.

Ocho pistas de 48 segundos reemplazan los ciclos de 24 segundos: presentan variación en intensidad y estéreo, pausas y apariciones irregulares. El puente tiene una pista propia. Al cambiar de lugar se hace un fundido entre dos reproductores en lugar de cortar la pista; al estabilizar el volumen se detiene el temporizador. Se conservan los ajustes independientes de volumen y la pausa en segundo plano.

## Comprobaciones

`npm run typecheck` y `npm test` verifican recursos, progresión, migración, movimiento, límites de volumen y saltos físicamente viables entre todos los apoyos obligatorios. Se añadieron regresiones para aceleración/frenado, pared, altura variable, ausencia de doble salto, perfiles de zona y desaparición de la niebla en el refugio.

Las pruebas de navegador comprueban PC/móvil emulado, las 16 escenas, cargas de recursos, audio y solapamiento de pistas durante la transición. Las exportaciones Android/iOS comprueban bundles; todavía hacen falta pruebas de sensaciones, rendimiento y mezcla sonora en teléfonos físicos. Estos cambios no implementan el capítulo 2 completo ni una nueva estructura de niveles.

Resultado local: **50 pruebas aprobadas**, TypeScript y exportación web aprobados; las 16 escenas pasan en PC y móvil emulado. Controles aprobados en cuatro configuraciones y gráficos en cuatro tamaños. El navegador comprobó el solapamiento de pistas, los sonidos, el volumen cero y la pausa al ocultar la página. Exportaciones de bundles Android e iOS aprobadas. La exportación local de `dist/` contiene la última corrección del audio en segundo plano.
