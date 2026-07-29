# Guion de demostración (máximo 5 minutos)

## 0:00–0:35 — Problema

“Smart Approval Hub centraliza compras que normalmente llegan por correo u hojas de cálculo. Aplica una política simple, conserva una única fuente de verdad y habilita varios canales.” Mostrar el dashboard y sus cinco métricas.

## 0:35–1:00 — Arquitectura

Mostrar el Mermaid del README: Angular es la experiencia, NestJS el BFF/integrador, Spring Boot concentra el dominio y PostgreSQL persiste. Power Platform es una integración opcional por contratos REST.

## 1:00–1:40 — Aprobación automática

Crear una solicitud por **500.000 COP**. Guardar y señalar el estado `APROBADA` y el aviso de regla automática. Volver al dashboard para mostrar métricas actualizadas.

## 1:40–2:40 — Decisión manual

Crear otra por **2.500.000 COP**. Mostrar que queda `PENDIENTE`; explicar que el gateway intentaría disparar el webhook. Pulsar aprobar, confirmar y enseñar la protección visual que elimina las acciones finales.

## 2:40–3:25 — APIs

Abrir http://localhost:3000/docs, enseñar validaciones y endpoints. Abrir `power-platform/custom-connector.openapi.yaml`: los `operationId` estables son la interfaz para Canvas App.

## 3:25–4:15 — Power Automate

Mostrar `POWER_AUTOMATE_GUIDE.md`: trigger HTTP → aprobación → callback. Aclarar que un fallo del webhook nunca revierte la solicitud creada.

## 4:15–5:00 — Producción

Mencionar Entra ID/RBAC, TLS, secretos administrados, auditoría, paginación, observabilidad, cola/outbox e idempotencia.

## Qué implementé realmente y qué dejé documentado

**Implementado y ejecutable:** Angular, NestJS, Spring Boot, PostgreSQL, Docker Compose, Swagger, Flyway, datos demo, pruebas y webhook preparado con simulación segura.

**Documentado para configuración en tenant Microsoft:** Canvas App, Custom Connector y flujo Power Automate. No se incluyen binarios ficticios ni credenciales; estos artefactos se crean/importan en el tenant elegido.

## Demostración local de Power Apps (siempre disponible)

1. Abrir http://localhost:4201/power-apps-demo y leer el aviso de simulación.
2. Mostrar health, métricas y endpoint `/powerapps-api`.
3. Crear una solicitud de 500.000 COP y mostrar `APROBADA`.
4. Crear una de 2.500.000 COP y mostrar `PENDIENTE`.
5. Aprobarla desde el simulador y seleccionar `ApproveRequest` en el monitor.
6. Enseñar el flujo Canvas App → Custom Connector → NestJS → Spring → PostgreSQL.
7. Abrir `power-platform/connector/apiDefinition.swagger.json` y comparar los `operationId`.

## Demostración real (sólo si el tenant está listo)

1. Abrir una Canvas App realmente importada y conectada.
2. Ejecutar `ListRequests` y crear una solicitud.
3. Refrescar Angular y mostrar la misma solicitud persistida.
4. Aprobar desde Power Apps, refrescar Angular y comprobar el estado.

## Qué es real y qué es simulado

**Real y ejecutable localmente:** Angular, endpoints `/api/powerapps`, NestJS, Spring Boot, PostgreSQL, API key, Swagger 2.0, monitor REST, reglas y persistencia.

**Preparado para tenant:** Custom Connector, scripts de despliegue, Canvas App generable mediante PAC CLI y fórmulas Power Fx.

**Sólo real cuando se verifique desde Microsoft:** conexión creada, Canvas App importada, operaciones ejecutadas desde Power Apps y flujo Power Automate ejecutado. En este entorno `pac` no está instalado; no se creó un conector remoto ni un `.msapp`.
