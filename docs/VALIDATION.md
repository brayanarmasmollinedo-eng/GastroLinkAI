# Validación de la entrega

Fecha: 27 de septiembre de 2026.

| Comprobación                         | Resultado                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| TypeScript estricto: tsc --noEmit    | Correcto, sin errores                                                               |
| ESLint: eslint .                     | Correcto, sin errores ni advertencias                                               |
| Vitest                               | 20 pruebas aprobadas: 18 unitarias y 2 de integración                               |
| Next.js build                        | Correcto, compilación de producción y verificación de tipos                         |
| Servidor Next.js de producción       | Iniciado y accesible en http://127.0.0.1:3100                                       |
| Smoke HTTP/SSR                       | 38 rutas HTML con 200, 8 imágenes con contenido de imagen, ruta desconocida con 404 |
| Imagen de quinua generada            | Archivo local inspeccionado visualmente                                             |
| Interacciones de UI/E2E en navegador | Pendiente: navegador integrado no disponible en la sesión                           |
| Revisión visual desktop/tablet/móvil | Pendiente; no se capturaron screenshots del sitio                                   |

## Qué verifican las pruebas

Las unitarias verifican separación usuario/empresa, membresías, usuarios desactivados, registros duplicados, mínimos y fecha de RFQ, aislamiento funcional, revisiones de oferta, rechazo, vigencia, suspensión, aceptación idempotente, instantánea de pedido, permisos de transición, historial, búsqueda con tildes y acceso a conversaciones.

La integración recorre el proceso entre comprador y proveedor usando el repositorio en memoria, con escritura y lectura entre operaciones. Comprueba solicitud → oferta → aceptación → pedido → mensaje → preparación, y que una operación denegada no modifique datos persistidos.

El smoke comprueba el servidor y sus recursos, no la hidratación, los clics, el aspecto visual ni las acciones de navegador. No debe confundirse con una prueba E2E interactiva.

## Reproducir

Desde la raíz, en Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run.ps1 check
```

Para el smoke, iniciar la aplicación y ejecutar con Node disponible:

```sh
npm run test:smoke
```

También puede usarse el runtime portátil de este equipo:

```powershell
& .\.tools\node-v22.23.3-win-x64\node.exe scripts/smoke.mjs
```

Guion de pruebas visuales pendientes: [tests/e2e/README.md](../tests/e2e/README.md).

## Entorno

El puerto 3000 fue rechazado por Windows con EACCES, incluso fuera del sandbox. Se eligió 3100 sin cambiar reglas de firewall ni configuración del sistema. El runtime Node.js portátil reside en .tools y está excluido de Git.

La última interrupción de la revisión automática de permisos fue transitoria; la validación se retomó y completó después de la indicación del usuario.
