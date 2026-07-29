# Guía de Power Automate

Crear un flujo llamado **Aprobación de solicitudes de compra**.

1. Agrega el trigger **When an HTTP request is received** con método POST y el siguiente esquema.
2. Agrega **Start and wait for an approval**, tipo *Approve/Reject – First to respond*. Título: `Solicitud: @{triggerBody()?['concept']}`. En detalles incluye solicitante, monto y centro de costos.
3. Agrega una condición: `outputs('Start_and_wait_for_an_approval')?['body/outcome']` es igual a `Approve`.
4. En ambas ramas agrega una acción HTTP POST a `@{triggerBody()?['callbackUrl']}` con `Content-Type: application/json`.
5. Envía `APPROVED` o `REJECTED`, comentarios y correo del respondedor. Configura *run after* para registrar/notificar fallos sin reintentos infinitos.

## JSON Schema del trigger

```json
{"type":"object","properties":{"requestId":{"type":"string","format":"uuid"},"requesterName":{"type":"string"},"requesterEmail":{"type":"string","format":"email"},"concept":{"type":"string"},"amount":{"type":"number"},"costCenter":{"type":"string"},"callbackUrl":{"type":"string","format":"uri"}},"required":["requestId","requesterName","requesterEmail","concept","amount","costCenter","callbackUrl"]}
```

## Cuerpo del callback

```json
{
  "requestId": "@{triggerBody()?['requestId']}",
  "decision": "APPROVED",
  "comment": "@{first(outputs('Start_and_wait_for_an_approval')?['body/responses'])?['comments']}",
  "approvedBy": "@{first(outputs('Start_and_wait_for_an_approval')?['body/responses'])?['responder']?['email']}"
}
```

Para la rama negativa cambia `decision` a `REJECTED`. Nunca escribas manualmente la URL del callback: usa `triggerBody()?['callbackUrl']`. Los tres JSON de ejemplo de esta carpeta sirven para probar el contrato sin credenciales reales.

## Reutilizar el Custom Connector

El mismo conector puede agregarse a un flujo de Power Automate para ejecutar `ListRequests`, `GetRequest`, `ApproveRequest` o `RejectRequest`. La conexión solicita `x-api-key`; nunca escribas la clave en una acción o expresión. Para aprobaciones iniciadas por NestJS se mantiene el webhook descrito arriba.

Estados que deben comunicarse con precisión:

- **SIMULADO:** `POWER_AUTOMATE_WEBHOOK_URL` está vacía; el gateway registra la simulación y no llama a Microsoft.
- **CONFIGURADO:** existe una URL de webhook, pero esto no demuestra que se haya ejecutado.
- **EJECUTADO REALMENTE:** sólo cuando hay historial de ejecución exitoso en Power Automate y callback recibido por NestJS.
