# Notas para la entrevista

## Papel de cada tecnología

- **Angular:** UI tipada y responsive; standalone components reducen módulos ceremoniales, rutas lazy separan pantallas y Reactive Forms centraliza validación.
- **NestJS:** BFF que adapta el API al cliente, valida DTOs, publica Swagger y aísla integraciones externas. No duplica reglas de negocio.
- **Spring Boot:** núcleo transaccional. JPA/Flyway manejan persistencia y evolución del esquema; `BigDecimal` protege montos.
- **PostgreSQL:** almacenamiento relacional con restricciones, índice por estado y fechas UTC.
- **Docker Compose:** ambiente reproducible con health checks y orden de arranque.
- **Power Apps:** canal low-code que consume el mismo API mediante un Custom Connector.
- **Power Automate:** orquesta la aprobación humana y devuelve una decisión al callback del BFF.

## Preguntas probables

**¿Por qué un BFF si Spring ya expone REST?** Para estabilizar el contrato de los clientes, centralizar CORS/documentación e integrar Power Automate sin contaminar el dominio. En un sistema mínimo podría omitirse; aquí demuestra una frontera escalable.

**¿Por qué el dominio está en Spring?** Existe una sola autoridad para reglas, decisiones y transacciones, independiente de Angular, Power Apps o futuros consumidores.

**¿Qué es un Custom Connector?** Una envoltura de Power Platform sobre un API descrito por OpenAPI. Convierte `operationId` en operaciones tipadas disponibles en Power Fx.

**¿Qué pasa si Power Automate falla?** La creación ya fue persistida; el POST es no bloqueante, tiene timeout y registra una advertencia. Producción usaría outbox/cola y reintentos controlados.

**¿Cómo se evita decidir dos veces?** Spring exige estado `PENDIENTE`; una segunda decisión responde 409. Para concurrencia extrema añadiría `@Version` u actualización condicional.

**¿Cómo escala?** Servicios stateless tras balanceadores, PostgreSQL administrado, paginación, caché de lecturas/metricas y eventos para integraciones.

## Qué cambiaría para producción

Entra ID con OAuth2/OIDC y roles solicitante/aprobador, HTTPS, secretos en vault, rate limiting, auditoría, idempotency keys, optimistic locking, cola/outbox, trazas OpenTelemetry, métricas/alertas, paginación, límites de longitud explícitos, respaldos, alta disponibilidad y pipeline CI/CD con SAST/SCA.

## Limitaciones conocidas del MVP

- Sin autenticación ni autorización; pensado únicamente para demostración local.
- Métricas agregan el conjunto completo, adecuado para cinco datos demo pero no para gran volumen.
- Búsqueda simple por `LIKE`, sin paginación ni búsqueda full text.
- La entrega del webhook es *best effort*, sin cola persistente.
- Canvas App y flujo no pueden materializarse sin tenant/licencias: se entregan OpenAPI, fórmulas y guías reproducibles.

## Cómo presentar el simulador Power Apps

El simulador no intenta imitar internamente Power Apps: representa el canal con una UI local y consume el contrato real `/api/powerapps`. El monitor muestra `operationId`, tiempos y códigos HTTP; Swagger 2.0 es la fuente importable. La API key se aplica sólo a ese límite y Nginx puede añadirla sin publicarla en JavaScript. Un tenant real sustituye la UI simulada, no el dominio ni los endpoints.
