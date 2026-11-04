# Entorno de desarrollo

Checkout existente: `/workspace/Juego`. Cada tarea ya está aislada; no crear worktrees salvo solicitud explícita del usuario.

No se necesitan secretos ni variables privadas para el prototipo. Las dependencias se obtienen de `registry.npmjs.org` con la confianza TLS y el proxy que suministra la plataforma. No desactivar verificación TLS, firmas ni checksums.

Instalar con `npm ci`; el hook `postinstall` prepara CanvasKit web. Iniciar Expo con `EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run web -- --port 8082`. El modo offline evita comprobaciones remotas al iniciar, no instala paquetes. Confirmar respuesta HTTP y abrir la aplicación en navegador: un puerto abierto no verifica el renderizado.

Validación requerida: `npm run typecheck`, `npm test`, `EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run build:web`. Android/iOS necesitan dispositivos o simuladores para validar controles, almacenamiento y rendimiento nativos. Los procesos en ejecución no sobreviven necesariamente a una tarea nueva: reiniciar Expo.
