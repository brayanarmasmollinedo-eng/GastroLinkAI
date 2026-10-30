# GastroLinkAI — prototipo funcional

> **Manual de usuario:** [docs/MANUAL_USUARIO.md](docs/MANUAL_USUARIO.md). **Para presentar la demo** (y compartirla por enlace): sigue la [guía de demostración](docs/DEMO.md). Cuentas y contraseña (`Demo2026!`) están allí y en la propia pantalla de acceso.
>
> **Novedades:** acceso con correo y contraseña para empresas compradoras, proveedores y administración; registro completo con razón social, identificación fiscal, contacto y perfil comercial; asistente conversacional con IA (Gemini por defecto, ver [docs/AI.md](docs/AI.md)).

Plataforma B2B de demostración para conectar proveedores de ingredientes peruanos con compradores gastronómicos. Next.js 16, React 19, TypeScript estricto, Tailwind CSS 4, Lucide y Zod. Versiones reproducibles en package-lock.json.

## Ejecutar en este equipo (Windows)

Desde la raíz del proyecto:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run.ps1 dev
```

Abrir **http://127.0.0.1:3100**. El script utiliza Node.js portátil en .tools si está disponible; no modifica el PATH global. No hace falta PostgreSQL, Docker, cuentas externas ni configurar secretos.

## En otro equipo

Requiere Node.js 22 LTS y npm:

```sh
npm ci
npm run dev
```

Para servir el build:

```sh
npm run build
npm start
```

## Funcionalidades

- Landing con identidad verde, marfil y terracota; navegación responsive.
- Marketplace: búsqueda sin tildes, filtros combinados, ordenación, favoritos y estados vacíos.
- Fichas de producto y proveedor; información y fotos referenciales.
- Acceso con correo y contraseña por tipo de cuenta (empresa compradora, proveedor, administrador) y cuentas demo de un clic.
- Registro completo: razón social, RUC/NIF/CIF, dirección, teléfonos, web, persona de contacto, perfil comercial (tipo de negocio y volumen o categorías, capacidad y certificaciones) y contraseña con confirmación.
- Perfil editable por bloques (empresa, contacto, seguridad) y cambio de contraseña.
- Dashboard comprador, proveedor y administrador con métricas derivadas de datos.
- RFQ con validación de cantidad mínima, destino y fecha; bandeja del proveedor.
- Ofertas con precio, plazo, vigencia, presentación y condiciones; revisiones conservadas.
- Comparador de tres ofertas iniciales; no selecciona ganador.
- Rechazo y negociación mediante conversación local.
- Aceptación idempotente en una misma sesión, pedido con instantánea comercial e historial.
- Actualización secuencial de pedido por su proveedor y consulta por su comprador.
- Creación/edición/publicación de productos, inventario referencial y archivo desde administración.
- Mensajería entre empresas, documentos ficticios con vista previa y estados.
- Gestión demo de usuarios y verificaciones. Todos los perfiles siguen marcados como ficticios.
- GastroLink AI: asistente conversacional que conoce el catálogo y asistente de compra que prepara la solicitud (requiere clave; sin ella, ayuda local sin IA).
- Persistencia local y restablecimiento con confirmación.

## Cuentas DEMO

En /login elige el tipo de cuenta y entra con correo y contraseña. Todas las cuentas precargadas usan **`Demo2026!`** (lista completa en [docs/DEMO.md](docs/DEMO.md)):

| Tipo               | Empresa inicial          | Correo                       | Destino    |
| ------------------ | ------------------------ | ---------------------------- | ---------- |
| Empresa compradora | Restaurante Costa Madrid | compras@costamadrid.example  | /dashboard |
| Proveedor          | Andean Foods Export      | ventas@andeanfoods.example   | /supplier  |
| Administrador      | Administración Demo      | admin@gastrolinkai.example   | /admin     |

Hay **6 proveedores y 4 compradores** iniciales. El catálogo contiene **20 productos**, una RFQ abierta con **3 ofertas comparables**, un pedido histórico con seguimiento, una conversación y 18 documentos ficticios. Las fechas se generan respecto al momento de inicializar la demo.

Las empresas registradas en /register entran con el correo y la contraseña que eligieron. Usa «Cambiar de cuenta» en la barra lateral para continuar la misma operación con otro perfil. La sesión demo es compartida por las pestañas del mismo origen: no utilices dos roles simultáneos en ellas.

## Recorrido recomendado

1. Entra como Restaurante Costa Madrid y busca “Ají amarillo”.
2. Solicita 200 kg con destino Madrid y una fecha futura.
3. Usa el enlace para continuar como su proveedor: Andean Foods Export.
4. Abre la nueva solicitud en /supplier/quotations y emite una oferta.
5. Vuelve al comprador, abre la oferta y confirma la aceptación.
6. Consulta el pedido. Vuelve al proveedor y avanza su estado.
7. Regresa al comprador: el historial conserva actor, fecha y observación.
8. Para comparar propuestas inmediatamente, utiliza la solicitud inicial RFQ-00124.

## Rutas

| Área          | Rutas                                                                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pública       | /, /marketplace, /products/[slug], /suppliers, /suppliers/[slug], /how-it-works, /about                                                                                                                                     |
| Acceso        | /login, /register                                                                                                                                                                                                           |
| Comprador     | /dashboard, /dashboard/quotations, /dashboard/quotations/[id], /dashboard/quotations/[id]/compare, /dashboard/orders, /dashboard/orders/[id], /dashboard/favorites, /dashboard/messages, /dashboard/profile                 |
| Proveedor     | /supplier, /supplier/products, /supplier/quotations, /supplier/quotations/[id], /supplier/orders, /supplier/orders/[id], /supplier/inventory, /supplier/documents, /supplier/messages, /supplier/company                    |
| Administrador | /admin, /admin/users, /admin/suppliers, /admin/buyers, /admin/products, /admin/quotations, /admin/quotations/[id], /admin/quotations/[id]/compare, /admin/orders, /admin/orders/[id], /admin/verifications, /admin/settings |

Las rutas se validan en el adaptador de Next.js y se delegan a módulos separados. Las operaciones privadas se filtran por el perfil activo, pero esto **no constituye autenticación ni seguridad de servidor**.

## Estructura

```text
src/app/                 Adaptadores Next.js, estilos, errores y rutas
src/components/          Componentes reutilizables, layouts y contexto demo
src/modules/             Marketplace, auth, cotizaciones, pedidos, productos,
                         mensajes, documentos, dashboards y administración
src/domain/              Entidades, estados y validaciones
src/services/            Reglas de negocio, permisos demo y consultas
src/repositories/        Contrato de persistencia; adaptadores navegador/memoria
src/data/                Catálogo y escenarios ficticios centralizados
public/images/           Fotografías locales, sin dependencias de imagen en runtime
tests/unit/              Reglas, estados y aislamiento funcional
tests/integration/       Recorrido entre perfiles con repositorio persistente en memoria
tests/e2e/               Recorridos manuales preparados
docs/                    Arquitectura, decisiones, validación y créditos
scripts/run.ps1          Ejecución y comprobaciones en Windows
```

El archivo vacío aa.py que ya existía se conservó. No se requiere ninguna migración de base de datos en esta etapa.

## Persistencia

Clave localStorage: gastrolinkai.demo.v2 (los datos de la versión anterior se ignoran y se parte de la semilla nueva). Los datos sobreviven a recargas y cambios de perfil en **el mismo navegador y origen**. localhost y 127.0.0.1 tienen almacenamiento separado. Cambiar de equipo no comparte información.

Restablecer desde el footer o /admin/settings restaura los ejemplos y cierra la sesión. No existe sincronización remota. La notificación de cambios entre pestañas no ofrece transacciones concurrentes; presentar la demo secuencialmente.

## Verificaciones

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

O en Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run.ps1 check
```

Las pruebas cubren identidad/empresa, autorización funcional, mínimos, vigencia, revisiones, aceptación repetida, instantánea de pedido, cambios de estado y mensajería. Ver docs/VALIDATION.md para resultados de esta entrega. El navegador integrado no estuvo disponible: la revisión visual interactiva y E2E queda explícitamente pendiente, con guion en tests/e2e/README.md.

## Límites y siguiente paso hacia MVP

Esta versión utiliza datos ficticios y controles de cliente. No introducir información sensible ni desplegarla como sistema comercial real.

- Llevar el acceso con contraseña al servidor (hoy el hash PBKDF2 se calcula y guarda en el navegador), con sesiones, recuperación de contraseña y verificación de correo.
- Incorporar API, PostgreSQL/Prisma, autorización por organización en servidor y migraciones.
- Ejecutar aceptación y reserva en transacciones con restricciones únicas y control de concurrencia.
- Migrar dinero a Decimal/unidades monetarias exactas. Hoy se formatea EUR para la demo.
- Añadir presentaciones múltiples, archivos reales, validación de cargas y persistencia privada.
- Definir invitaciones de RFQ a múltiples proveedores desde UI. Ahora la comparación múltiple viene precargada; una nueva RFQ se envía al proveedor de su ficha.
- Inventario informativo: aceptar no reserva stock. Logística manual sin integraciones.
- Documentos son vistas simuladas; no se cargan ni certifican archivos reales.
- No hay emails, pagos, WhatsApp, outbox ni infraestructura cloud. La IA funciona solo en local y con clave propia.
- Completar validación responsive y E2E en navegador antes de presentar externamente.

La UI consume contexto y servicios; localStorage está encapsulado en el repositorio. La migración a API requerirá adaptar la fachada a operaciones asíncronas, sin rehacer las pantallas ni las reglas de negocio. Ver docs/ARCHITECTURE.md.

Documentación adicional: [arquitectura](docs/ARCHITECTURE.md), [resultados de validación](docs/VALIDATION.md) y [recursos visuales, fuentes y prompt de la ilustración](docs/ASSETS.md).
