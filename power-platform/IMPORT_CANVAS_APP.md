# Importar la Canvas App (menos de cinco minutos)

> Solo aplica si `generate-canvas-app.ps1` produjo un archivo real. Este repositorio no contiene un `.msapp` ficticio.

1. Entra al entorno correcto en Power Apps Studio y selecciona **Apps > Open > Browse**.
2. Elige `power-platform/generated/SmartApprovalHubDemo.msapp`.
3. Abre **Data > Add data**, agrega la conexión **Smart Approval Hub Demo** y proporciona la API key de demostración sin guardarla en código.
4. Revisa que las fórmulas usen el nombre real de la conexión insertada.
5. Pulsa **Preview** y ejecuta `ListRequests`; la galería debe usar `.items`.
6. Crea una solicitud y comprueba que aparece también en http://localhost:4201 después de refrescar.
7. Crea una solicitud superior a 1.000.000 COP y apruébala o recházala.
8. Vuelve a Angular y confirma el estado actualizado.

Importar no demuestra por sí solo que funcione: conserva evidencia de la conexión y de una operación ejecutada desde el tenant.
