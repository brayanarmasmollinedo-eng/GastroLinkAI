# Manual de usuario — GastroLinkAI

GastroLinkAI es una plataforma B2B que conecta **proveedores de ingredientes peruanos** con **restaurantes, hoteles, distribuidores y otras empresas gastronómicas**. Permite descubrir productos, pedir cotizaciones, comparar ofertas, cerrar pedidos y conversar con la otra parte, con un asistente de inteligencia artificial que ayuda en todo el proceso.

> **Importante:** esta es una **versión de demostración**. Las empresas, precios, documentos y pedidos son ficticios, no hay pagos ni correos reales y los datos se guardan solo en tu navegador. No introduzcas información real ni confidencial.

## Contenido

1. [Primeros pasos](#1-primeros-pasos)
2. [Crear una cuenta](#2-crear-una-cuenta)
3. [Iniciar sesión](#3-iniciar-sesión)
4. [Explorar el marketplace](#4-explorar-el-marketplace)
5. [Guía para empresas compradoras](#5-guía-para-empresas-compradoras)
6. [Guía para proveedores](#6-guía-para-proveedores)
7. [Guía para administración](#7-guía-para-administración)
8. [Inteligencia artificial: qué hace y cómo funciona](#8-inteligencia-artificial-qué-hace-y-cómo-funciona)
9. [Mensajes y documentos](#9-mensajes-y-documentos)
10. [Tu perfil y tu seguridad](#10-tu-perfil-y-tu-seguridad)
11. [Preguntas frecuentes y solución de problemas](#11-preguntas-frecuentes-y-solución-de-problemas)

---

## 1. Primeros pasos

Hay tres tipos de cuenta, cada una con su propio espacio de trabajo:

| Tipo de cuenta | Para qué sirve | Espacio |
| --- | --- | --- |
| **Empresa compradora** | Buscar productos, pedir cotizaciones, comparar ofertas y seguir pedidos | `/dashboard` |
| **Proveedor** | Publicar productos, responder cotizaciones y gestionar pedidos e inventario | `/supplier` |
| **Administrador** | Supervisar usuarios, empresas, verificaciones y operaciones | `/admin` |

Sin iniciar sesión puedes recorrer el **marketplace**, las fichas de productos y proveedores, y usar el **asistente de IA**. Para pedir cotizaciones o publicar productos necesitas una cuenta.

## 2. Crear una cuenta

Entra en **Crear cuenta** (`/register`) y elige la pestaña **Empresa compradora** o **Proveedor**. El formulario tiene cuatro bloques:

**1. Datos de la empresa**
- Nombre comercial y razón social.
- Identificación fiscal: **RUC** (Perú), **NIF/CIF** (España) u otro registro, de 8 a 15 letras o números.
- Teléfono, país, ciudad, dirección fiscal y sitio web (opcional).

**2. Perfil comercial**
- *Compradores:* tipo de negocio (restaurante, hotel, catering, distribuidor, importador, tienda gourmet) y volumen de compra estimado al mes.
- *Proveedores:* categorías de producto que ofreces, capacidad mensual en kg, años de experiencia, certificaciones (HACCP, Orgánico, BPM, GlobalG.A.P., Comercio Justo) y una descripción.

**3. Persona de contacto:** nombre y apellidos, cargo y teléfono.

**4. Datos de acceso:** correo electrónico (será tu usuario), contraseña con confirmación y aceptación de las condiciones de uso.

Reglas que verás en pantalla:
- La contraseña debe tener **al menos 8 caracteres, con letras y números**. El icono del ojo permite verla u ocultarla.
- No pueden repetirse el **correo** ni la **identificación fiscal** de otra empresa.
- Un **proveedor nuevo queda «pendiente de verificación»** hasta que la administración lo revise.

## 3. Iniciar sesión

En **Iniciar sesión** (`/login`) elige la pestaña de tu tipo de cuenta, escribe tu correo y contraseña y pulsa el botón. Si usas la pestaña equivocada, el mensaje te indica cuál es la correcta.

**Cuentas de demostración.** Debajo del formulario hay un panel con empresas ya creadas. Pulsa **Usar** en una de ellas para rellenar el formulario. Todas comparten la contraseña `Demo2026!`.

Para cerrar sesión pulsa el icono de salida en la esquina superior derecha de tu espacio.

## 4. Explorar el marketplace

El **Marketplace** (`/marketplace`) muestra el catálogo de productos con:
- **Búsqueda** por nombre, sin importar tildes (por ejemplo, «aji» encuentra «Ají»).
- **Filtros** combinables: categoría, proveedor, precio máximo, disponibilidad, presentación, certificación, región y plazo de entrega.
- **Ordenación** y estados vacíos cuando no hay coincidencias.
- **Favoritos:** el corazón guarda productos para verlos después (solo compradores).

Cada **ficha de producto** muestra descripción, región, presentación, precio de referencia por kg, pedido mínimo, plazo de entrega, certificaciones y el proveedor. Cada **ficha de proveedor** muestra su experiencia, mercados, categorías, capacidad mensual, certificaciones y productos publicados.

Las fotos y los datos son referenciales y de demostración.

## 5. Guía para empresas compradoras

Menú lateral: **Dashboard, Marketplace, Mis cotizaciones, Mis pedidos, Proveedores, Favoritos, Mensajes y Perfil.**

### Pedir una cotización
1. Abre un producto y pulsa **Solicitar cotización** (o usa el asistente de IA, ver sección 8).
2. Indica **cantidad** (por encima del mínimo del producto), **ciudad y país de destino**, **fecha requerida** (futura) y comentarios.
3. Envía la solicitud. Aparecerá en **Mis cotizaciones** con el estado *Enviada*.

### Comparar y aceptar ofertas
1. Cuando un proveedor responde, el estado pasa a *Ofertada*. Abre la solicitud para ver precio, plazo, vigencia, presentación y condiciones.
2. Si hay varias ofertas, **Comparar** las muestra lado a lado. La plataforma **no elige ganador**: decides tú.
3. Puedes **aceptar** una oferta, **rechazarla** o **negociar** por mensajes. Si el proveedor revisa su oferta, se conservan las versiones anteriores.
4. Al aceptar se crea un **pedido** con una copia de las condiciones acordadas. Aceptar dos veces la misma oferta no duplica el pedido.

### Seguir pedidos
En **Mis pedidos** ves el estado: *Confirmado → Preparación → Documentación → Despachado → En tránsito → Entregado*. El historial registra quién cambió cada estado, cuándo y con qué nota.

El **Dashboard** resume tus solicitudes, ofertas pendientes y pedidos activos.

## 6. Guía para proveedores

Menú lateral: **Dashboard, Productos, Cotizaciones, Pedidos, Inventario, Documentos, Mensajes y Empresa.**

### Gestionar el catálogo
- **Productos:** crea, edita, publica u oculta productos (nombre, categoría, descripción, región, presentación, precio, mínimo, stock, capacidad y plazo).
- **Inventario:** vista de existencias y capacidad. Es informativa: aceptar una oferta no reserva stock.

### Responder cotizaciones
1. En **Cotizaciones** abre una solicitud recibida.
2. Emite una **oferta** con precio, plazo, vigencia, mínimo, presentación y condiciones.
3. Si cambias la oferta, se crea una **revisión** y la anterior queda sustituida.

### Gestionar pedidos
Cuando el comprador acepta, el pedido aparece en **Pedidos**. Avanza su estado paso a paso y añade una nota; el comprador lo ve al instante.

### Documentos y empresa
- **Documentos:** certificaciones y fichas con estado *Vigente, Por vencer* o *Pendiente de revisión* (son vistas simuladas, no se suben archivos reales).
- **Empresa:** tus datos legales, categorías, capacidad, certificaciones y contacto.

## 7. Guía para administración

Menú lateral: **Dashboard, Usuarios, Proveedores, Compradores, Productos, Cotizaciones, Pedidos, Verificaciones y Configuración.**

- **Usuarios:** lista con cargo, correo de acceso y empresa. Puedes **desactivar** o activar una cuenta; una cuenta desactivada no puede iniciar sesión. No puedes desactivar tu propia cuenta.
- **Proveedores y Compradores:** razón social, identificación fiscal, teléfono, ubicación y perfil comercial.
- **Verificaciones:** cambia el estado de un proveedor entre *pendiente, verificado, observado* y *suspendido*. Los suspendidos dejan de mostrarse en el catálogo. La verificación es **simulada**.
- **Productos, Cotizaciones y Pedidos:** supervisión de toda la actividad.
- **Configuración:** carga del **logo** de la plataforma (PNG, JPEG o WebP, hasta 2 MB) y **Restablecer datos demo**, que devuelve todo al estado inicial y cierra la sesión.

## 8. Inteligencia artificial: qué hace y cómo funciona

GastroLinkAI incluye dos funciones de IA. Ninguna realiza compras, envía solicitudes ni acepta ofertas por sí sola: **siempre decides tú** y revisas antes de enviar.

### 8.1 Asistente GastroLink (chat flotante)

Es el botón **Asistente GastroLink** que aparece en todas las páginas. Es un asistente conversacional al que puedes preguntar **casi cualquier cosa**:

- **Sobre la plataforma:** «¿Cómo pido una cotización?», «¿qué ajíes tienen y cuál es el pedido mínimo?», «¿cuánto cuesta la quinua?».
- **Sobre el catálogo:** conoce los productos publicados, con su precio, mínimo, plazo, proveedor y certificaciones.
- **Sobre gastronomía y negocio:** recetas, uso de ingredientes peruanos, conservación, logística, exportación y más.

**Cómo usarlo**
1. Abre el chat y escribe tu pregunta. Mantiene el hilo de la conversación (recuerda los últimos mensajes).
2. Si la respuesta menciona productos del catálogo, aparecen **tarjetas** con precio y mínimo. Pulsa **Preparar cotización** para abrir el formulario ya listo; tú lo revisas y lo envías.
3. El icono de flecha circular inicia una **nueva conversación**.

**Dos modos.** El selector «Modo» del chat permite elegir:
- **Conversación con IA:** respuestas generadas por el modelo. Es el modo predeterminado cuando la IA está activada.
- **Ayuda y catálogo local · sin IA:** busca en el catálogo y explica el proceso de cotización sin enviar nada fuera. Sirve como respaldo si la IA no está disponible.

### 8.2 Asistente de compra (en el Marketplace)

Es el recuadro **GastroLink AI** del marketplace. Entiende una frase de compra y la convierte en un borrador:

1. Escribe algo como: *«Necesito 200 kg de ají amarillo congelado para Madrid el 20/11/2026»*.
2. La IA extrae **producto, cantidad, unidad, presentación, ciudad, país y fecha**. Lo que no está claro queda vacío y la IA te pregunta.
3. Revisas y corriges cada campo en el formulario «Revisa lo que entendimos».
4. Eliges el producto del catálogo que coincide y pulsas **Preparar solicitud**; el formulario llega con los datos rellenados.
5. Envías la cotización tú mismo.

La IA **no convierte cajas en kilos, no deduce el país por la ciudad y no supone fechas sin año**: en esos casos te lo pregunta.

### 8.3 Cómo funciona por dentro

- Tu mensaje viaja a un **servidor local** de la aplicación, que lo reenvía al servicio de IA configurado (por defecto **Google Gemini**; también puede usarse OpenAI o Claude). La clave de acceso queda en el servidor y **nunca llega al navegador**.
- Al chat se envían solo: tus últimos mensajes y el **catálogo público de la demo**. **No** se envían tus pedidos, mensajes privados, contraseñas ni datos de otras empresas.
- Las respuestas del asistente de compra se **validan** antes de mostrarse. Si el formato no es correcto, se descarta.
- Hay **límites de uso**: el chat admite hasta 20 consultas por minuto y el asistente de compra hasta 10, con un máximo de 2 simultáneas.
- Por seguridad, la IA solo acepta consultas hechas desde la propia aplicación local (o desde un enlace compartido que el administrador técnico haya autorizado de forma explícita).

### 8.4 Qué debes tener en cuenta

- **No introduzcas datos confidenciales.** Lo que escribes se envía al proveedor del modelo de IA. En el plan gratuito de Gemini, Google puede usar las consultas para mejorar sus productos.
- **Revisa siempre las respuestas.** La IA puede equivocarse. Los precios y plazos son **referenciales**; confírmalos con el proveedor.
- **No confirma stock, certificaciones ni disponibilidad** que no estén en el catálogo.
- El plan gratuito tiene **cupo de uso**: si se agota verás un aviso («límite gratuito alcanzado»). Espera unos minutos o usa el modo local.
- Si la IA no está activada, la etiqueta muestra **«Pendiente de activación»** y puedes seguir trabajando con el buscador, el modo local y las cotizaciones manuales.

## 9. Mensajes y documentos

- **Mensajes:** conversaciones entre una empresa compradora y un proveedor, ligadas a un asunto. Desde la ficha de un proveedor puedes **iniciar una conversación**. Aquí se negocian presentaciones, cantidades y condiciones.
- **Documentos (proveedores):** certificaciones y fichas técnicas con vista previa y estado. Son simulaciones; no se suben archivos reales.

## 10. Tu perfil y tu seguridad

En **Perfil** (compradores) o **Empresa** (proveedores) hay tres bloques que se guardan por separado:

1. **Datos de la empresa:** nombre, razón social, identificación fiscal, dirección, teléfono, web, perfil comercial y descripción.
2. **Persona de contacto:** nombre, cargo y teléfono. El correo de acceso no se puede cambiar en la demo.
3. **Seguridad:** cambio de contraseña (pide la actual y la nueva dos veces).

La contraseña se guarda **cifrada** (hash con sal) en tu navegador. En una versión de producción se validará en un servidor.

## 11. Preguntas frecuentes y solución de problemas

**No recuerdo la contraseña de una cuenta demo.** Es `Demo2026!`. Para una empresa que registraste tú, no hay recuperación en la demo: crea otra cuenta o usa **Restablecer datos demo** (Administración → Configuración).

**«Correo o contraseña incorrectos».** Revisa mayúsculas y que estés en la pestaña de tu tipo de cuenta.

**«Esta cuenta es de tipo …».** Cambia a la pestaña indicada en la pantalla de acceso.

**«Esta cuenta está desactivada».** La administración la desactivó. Entra como administrador para reactivarla.

**El asistente dice «Pendiente de activación».** La IA no está configurada en el servidor; usa el modo local. Quien administre la instalación debe añadir la clave (ver `docs/AI.md`).

**«Se alcanzó el límite gratuito».** Espera unos minutos o hasta el día siguiente.

**Mis datos desaparecieron.** Los datos viven en este navegador. Cambiar de navegador, equipo o de dirección (`localhost` frente a `127.0.0.1`) muestra datos distintos, y borrar los datos del sitio los elimina.

**No puedo usar dos cuentas a la vez.** La sesión se comparte entre pestañas del mismo navegador. Usa ventanas de incógnito o navegadores distintos para dos roles al mismo tiempo, o hazlo de forma secuencial con **Cambiar de cuenta**.

**¿Es seguro para datos reales?** No. Es una demostración: sin autenticación de servidor, pagos ni correos reales.
