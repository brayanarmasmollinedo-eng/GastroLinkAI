# Arquitectura del prototipo

## Decisión: un despliegue, módulos separados

Next.js App Router aloja UI y rutas. El prototipo es una aplicación de datos locales: no hay API de negocio ni base de datos de servidor todavía. La arquitectura conceptual aprobada se mantiene como destino del MVP, no como infraestructura anticipada.

Flujo actual: UI → contexto/fachada demo → servicios de dominio → snapshot de trabajo → DemoRepository → localStorage. Los servicios de lectura del catálogo reciben un snapshot tipado, independiente de localStorage. Las mutaciones operan sobre una copia recién leída y solo se guardan si el comando termina correctamente. MemoryDemoRepository permite ejecutar el mismo flujo en pruebas.

La UI no importa el catálogo semilla ni accede al almacenamiento del navegador. Las categorías y textos editoriales son datos compartidos. Los perfiles, operaciones y catálogos están centralizados en src/data.

## Fronteras

- domain: User, Organization, OrganizationMember, Product, QuotationRequest, QuotationOffer, Order, Message y documentos demo.
- services: autorización funcional, validación, transiciones, comparaciones y búsquedas.
- repositories: interfaz de lectura/escritura del estado completo de la demo; implementaciones local y memoria.
- modules: formularios y pantallas por dominio.
- components: elementos visuales compartidos y proveedor de estado.
- app: adaptador de navegación Next.js; lista explícita de rutas admitidas.

No se plantea cargar toda una base de datos real como snapshot. Al incorporar servidor, cada operación tendrá repositorios por agregado y consultas paginadas; el contexto se convertirá en una fachada API asíncrona. Las reglas puras se reutilizan en el servidor. El cambio requerirá adaptar los event handlers a await y estados de carga, pero no reconstruir el diseño de las pantallas.

## Decisiones de negocio

- Un usuario pertenece a una organización a través de membresía. El rol no reemplaza a la empresa.
- Tres perfiles demo. La granularidad de permisos empresarial se difiere.
- Una nueva RFQ invita al proveedor del producto. supplierIds conserva la posibilidad mult proveedor y el seed demuestra tres ofertas.
- Una oferta nueva sustituye a la anterior del mismo proveedor y conserva su revisión.
- Una RFQ se adjudica entera. No hay adjudicación parcial.
- La aceptación comprueba propietario, vigencia, proveedor activo y adjudicación previa.
- Repetir una aceptación devuelve el pedido existente; no crea duplicados en ejecución secuencial.
- El pedido conserva nombre, presentación, precio, cantidad y destino. Las ofertas emitidas no se editan; se revisan.
- El historial registra estado anterior, siguiente, actor, fecha y nota.
- El inventario es informativo, sin reservas. No se promete disponibilidad contractual.
- El comparador no normaliza monedas ni elige ganador. Todas las ofertas demo usan EUR/kg.
- La verificación administrativa es un estado ficticio, siempre identificado en público.

## Alcance técnico y límites

localStorage no ofrece aislamiento seguro ni exclusión mutua entre pestañas. El usuario puede modificar sus datos desde herramientas del navegador. No hay autenticación real ni seguridad de backend. Los controles incluidos preservan la coherencia de la demostración y preparan reglas reutilizables, no una frontera de confianza.

GastroLink AI implementa AiSearchProvider con coincidencia determinista de palabras clave. Su texto explica que no procesa automáticamente cantidades/fechas ni llama a modelos externos.

Los documentos se muestran como contenido ficticio, sin archivos cargados. Las imágenes de producto son ilustrativas; el esquema de múltiples imágenes y presentaciones se incorporará al MVP.

## Ruta al MVP

1. Pruebas de UI/E2E y revisión de la experiencia con usuarios.
2. API versionada y repositorios PostgreSQL/Prisma por dominio.
3. Autenticación real, cookies seguras, CSRF y permisos de servidor por organización.
4. Transacciones en aceptación, idempotencia persistida y reservas de stock.
5. Archivos privados, validación y revisión documental con tipos configurables.
6. Historial de auditoría de servidor, notificaciones y jobs según necesidades reales.
7. Proveedores externos de logística, pagos o IA solo al validar su caso de uso.

No hay migraciones SQL en esta entrega. El esquema local tiene versión 1; cambios incompatibles futuros deben migrar el contenido o ofrecer restablecimiento explícito.
