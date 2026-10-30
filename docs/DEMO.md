# Guía de demostración — GastroLinkAI

Guion para presentar la plataforma de principio a fin en unos 15 minutos. Todas las empresas, identificaciones fiscales, direcciones y teléfonos son **ficticios**.

## Antes de empezar

1. Arranca el servidor: `powershell -ExecutionPolicy Bypass -File .\scripts\run.ps1 dev`.
2. Abre **http://127.0.0.1:3100**.
3. Si ya usaste la demo, restablécela desde el pie de página o en **Administración → Configuración**.
4. Si vas a mostrar la IA, comprueba antes la clave con `npm run ai:check` (ver [AI.md](AI.md)).

## Compartir la demo con un enlace (Dev Tunnels)

Con [Dev Tunnels](https://aka.ms/devtunnels/docs) se publica el servidor local con una URL `https://…devtunnels.ms`.

1. Instala la CLI una vez: `winget install Microsoft.devtunnel` y abre una terminal nueva.
2. Inicia sesión una vez: `devtunnel user login -g -d` (GitHub) o `devtunnel user login -d` (Microsoft).
3. Crea el túnel una vez: `devtunnel create gastrolinkai-demo --allow-anonymous --expiration 30d` y `devtunnel port create gastrolinkai-demo -p 3100 --protocol http`.
4. Cada vez que quieras compartir: arranca la app en producción (`npm run build`, luego `powershell -ExecutionPolicy Bypass -File .\scripts\run.ps1 start`) y en otra terminal `devtunnel host gastrolinkai-demo`. La CLI imprime el enlace.

Notas:
- El enlace solo funciona **mientras tu PC y esos dos procesos estén encendidos**.
- Con `--allow-anonymous` cualquiera con el enlace puede entrar. Quita esa opción si quieres que pida iniciar sesión con Microsoft/GitHub.
- Los datos de cada visitante viven en **su propio navegador**; nadie ve lo que hacen los demás.
- La **IA está desactivada en el enlace público** para proteger tu cuota. Para activarla: añade `AI_ALLOWED_ORIGINS=https://tu-enlace.devtunnels.ms` en `.env.local` y reinicia (ver [AI.md](AI.md)).
- Para dejar de compartir: cierra `devtunnel host` o ejecuta `devtunnel delete gastrolinkai-demo`.

## Cuentas de demostración

Todas usan la contraseña **`Demo2026!`**. En `/login`, el panel «Cuentas de demostración» rellena el formulario con un clic.

| Tipo | Empresa | Correo |
| --- | --- | --- |
| Empresa compradora | Restaurante Costa Madrid | compras@costamadrid.example |
| Empresa compradora | Mesa Andina Barcelona | compras@mesaandina.example |
| Empresa compradora | Bistró Sol de Valencia | compras@solvalencia.example |
| Empresa compradora | Origen Gastro Bilbao | compras@origenbilbao.example |
| Proveedor | Andean Foods Export | ventas@andeanfoods.example |
| Proveedor | Sabores del Perú Export | ventas@saboresdelperu.example |
| Proveedor | Pacific Agro Foods | ventas@pacificagro.example |
| Proveedor | Inka Harvest | ventas@inkaharvest.example |
| Proveedor | Sierra Natural Foods | ventas@sierranatural.example |
| Proveedor | Peruvian Origins | ventas@peruvianorigins.example |
| Administrador | Administración Demo | admin@gastrolinkai.example |

Cada cuenta solo entra por su pestaña. Si eliges otra, la pantalla indica el tipo correcto.

## Recorrido recomendado

### 1. Presentación pública (2 min)
- Página de inicio, **Marketplace** con búsqueda y filtros, ficha de un producto y de un proveedor (categorías, capacidad mensual y certificaciones).
- Abre el **Asistente GastroLink** (botón flotante) y pregunta, por ejemplo: «¿Qué ajíes tienen y cuál es el pedido mínimo?» o «¿Cómo conservo la pulpa de maracuyá?».

### 2. Registro de una empresa (3 min)
- `/register` → pestaña **Empresa compradora** o **Proveedor**.
- Muestra los cuatro bloques: datos de la empresa (razón social, RUC/NIF/CIF, dirección, teléfono, web), perfil comercial (tipo de negocio y volumen, o categorías, capacidad y certificaciones), persona de contacto y datos de acceso.
- Validaciones visibles: contraseña de 8 caracteres o más con letras y números, confirmación, correo e identificación fiscal sin duplicados y aceptación de condiciones.
- Un proveedor nuevo queda **pendiente de verificación**.

### 3. Comprador (3 min)
- Entra como **compras@costamadrid.example**.
- Busca «Ají amarillo», solicita **200 kg** con destino Madrid y una fecha futura.
- Enseña **Mis cotizaciones → RFQ-00124 → Comparar** (tres ofertas precargadas).

### 4. Proveedor (3 min)
- Desde la confirmación, pulsa «Continuar demo como proveedor», que rellena el correo de Andean Foods Export. Escribe `Demo2026!`.
- Abre la nueva solicitud en **Cotizaciones** y emite una oferta (precio, plazo, vigencia, presentación y condiciones).
- Muestra **Empresa**: datos legales, categorías, capacidad, certificaciones, contacto y cambio de contraseña.

### 5. Cierre de la operación (2 min)
- Vuelve como comprador, acepta la oferta y abre el pedido.
- Como proveedor, avanza el estado del pedido. Como comprador, el historial muestra actor, fecha y nota.

### 6. Administración (2 min)
- Entra como **admin@gastrolinkai.example**.
- **Usuarios** (cargo, correo, activar o desactivar), **Proveedores** y **Compradores** (razón social, identificación fiscal y perfil comercial) y **Verificaciones**.
- Un usuario desactivado no puede iniciar sesión.

## Qué decir sobre los límites

- Es una demostración: los datos viven en el navegador (`localStorage`) y no se sincronizan entre equipos.
- Las contraseñas se guardan como hash PBKDF2 con sal, nunca en claro. Aun así, la seguridad real llegará con autenticación en servidor y base de datos (ver la sección «Siguiente paso hacia MVP» del README).
- No hay pagos, correos ni verificaciones reales.
