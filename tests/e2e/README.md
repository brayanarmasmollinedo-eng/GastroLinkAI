# Recorridos de aceptación E2E

La ejecución visual automatizada queda pendiente: el navegador integrado no estuvo disponible en esta sesión. Estos recorridos complementan las pruebas automatizadas de dominio e integración; no deben contarse como E2E ejecutadas.

## Comprador → proveedor → pedido

1. En /login elegir Comprador / Restaurante Costa Madrid.
2. En /marketplace buscar "Ají amarillo". Abrir el producto.
3. Solicitar 200 kg para Madrid / España con fecha futura. Ver confirmación y RFQ creada.
4. Cambiar al proveedor Andean Foods Export desde el enlace de continuación.
5. Abrir /supplier/quotations y la nueva RFQ. Emitir oferta de 4,20 EUR/kg, 18 días, vigencia 7 días.
6. Cambiar a Restaurante Costa Madrid. Abrir la RFQ y aceptar. Confirmar en el diálogo.
7. Ver pedido con importe de producto 840 EUR y estado confirmado. Recargar: permanece.
8. Cambiar al proveedor. Abrir pedido y avanzar a preparación con observación.
9. Volver al comprador: observar preparación y el historial con actor, fecha y nota.

## Comparación y negociación

Abrir RFQ-00124 desde el comprador inicial. Comparar sus tres ofertas ficticias, revisar cada condición y usar Negociar para abrir conversación. Rechazar una y comprobar que las restantes siguen disponibles.

## Administración y aislamiento

Entrar como administrador; cambiar verificación de un proveedor demo, archivar y publicar un producto y desactivar/reactivar un usuario. Cambiar al comprador Mesa Andina: las operaciones privadas de Restaurante Costa Madrid no deben aparecer ni al abrir su URL.

## Responsive y accesibilidad

Repetir en 1440, 768 y 390 px. Revisar menú móvil, filtros, tablas con desplazamiento horizontal, diálogos, teclado, foco y mensajes de error. Verificar que los filtros combinados sin coincidencias muestran un estado vacío y que favoritos, perfiles y mensajes persisten tras recarga.

## Reiniciar

Usar Restablecer datos demo desde el footer o /admin/settings. Confirmar que vuelve el catálogo inicial y se cierra la sesión.
