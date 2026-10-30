# Inteligencia artificial en GastroLinkAI

Hay dos funciones de IA. Ninguna ejecuta compras, solicitudes ni aceptaciones: el usuario revisa y envía siempre.

| Función | Dónde | Qué hace | Endpoint |
| --- | --- | --- | --- |
| **Asistente GastroLink** | Botón flotante en todas las páginas | Chat conversacional: responde preguntas generales y sobre el catálogo; muestra tarjetas de producto y abre el formulario de cotización | `POST /api/ai/chat` |
| **Asistente de compra** | Marketplace | Convierte una frase («200 kg de ají amarillo para Madrid…») en un borrador de solicitud con campos editables | `POST /api/ai/intent` |

Sin configuración, la app funciona igual: el chat usa su modo local («sin IA») y el buscador y las cotizaciones manuales siguen disponibles.

## Activar

1. Copia `.env.example` a `.env.local`.
2. Crea una clave gratuita en <https://aistudio.google.com/apikey> y ponla en `GEMINI_API_KEY`.
3. Deja `AI_ENABLED=true`.
4. Comprueba con `npm run ai:check`.
5. Reinicia el servidor (en producción, `npm run build` antes de `npm start`).

Variables:

| Variable | Descripción |
| --- | --- |
| `AI_ENABLED` | `true` para activar la IA |
| `AI_PROVIDER` | `gemini` (predeterminado), `openai` o `anthropic` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Gemini. Modelo predeterminado: `gemini-3.5-flash-lite` |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | OpenAI (de pago) |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Claude (de pago). Modelo predeterminado: `claude-opus-5-5` |
| `APP_ORIGIN` | Origen local permitido (`http://127.0.0.1:3100`) |
| `AI_ALLOWED_ORIGINS` | Enlaces públicos autorizados a usar la IA, separados por comas. Vacío por defecto |

El chat conversacional solo está implementado para Gemini; el asistente de compra funciona con los tres proveedores. Nunca pongas claves en el chat, en Git, en `localStorage` ni en variables `NEXT_PUBLIC_`.

## Cómo funciona

- El navegador llama a la API de la propia app; esta, en el servidor, llama al proveedor. La clave nunca llega al navegador.
- **Chat:** se envían los últimos mensajes (máx. 16) y un resumen del **catálogo público de la demo**. El prompt de sistema prohíbe inventar precios, stock o disponibilidad y trata el texto del usuario y el catálogo como datos, no como instrucciones. Las tarjetas de producto se calculan en el cliente buscando nombres de catálogo en la respuesta.
- **Asistente de compra:** salida estructurada validada con Zod (`product`, `quantity`, `unit`, `city`, `country`, `requiredDate`, `presentation`, `questions`). No convierte cajas a kg, no deduce país por ciudad y pide aclaración si la fecha no tiene año.
- No se envían pedidos, mensajes privados, contraseñas ni datos de otras empresas.
- Errores traducidos a mensajes claros: clave inválida, modelo no encontrado, cuota agotada, sin conexión, respuesta bloqueada o incompleta.

## Seguridad y límites

- Solo acepta peticiones del origen local (`127.0.0.1`/`localhost` en el puerto de `APP_ORIGIN`).
- **Enlaces públicos (Dev Tunnels u otro proxy):** se detectan por `x-forwarded-host` y la IA queda **desactivada** salvo que el enlace esté en `AI_ALLOWED_ORIGINS`. Así, quien reciba el enlace no consume tu cuota. Para permitirlo: `AI_ALLOWED_ORIGINS=https://tu-enlace.devtunnels.ms` y reinicia.
- Cuerpo máximo (8 KB en intención, 60 KB en chat), validación estricta y tiempo máximo de 25–30 s.
- Límite por proceso: chat 20 consultas/min y asistente de compra 10/min, máx. 2 simultáneas. No es un control por usuario; antes de exponer la app de forma permanente hacen falta sesiones de servidor y cuotas persistidas.
- El plan gratuito de Gemini tiene cupo y Google puede usar las consultas para mejorar sus productos: no introduzcas datos confidenciales.

## Pruebas

`tests/unit/ai.test.ts`, `tests/unit/assistant.test.ts` y `tests/integration/ai-route.test.ts` cubren esquema, proveedores simulados, errores, origen local, enlaces públicos y límites. La llamada real a cada proveedor se comprueba con `npm run ai:check`.
