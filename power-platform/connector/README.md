# Paquete del Custom Connector

`apiDefinition.swagger.json` es la plantilla Swagger 2.0 canónica. El host `POWER_APPS_PUBLIC_HOST` impide importarla accidentalmente como si estuviera publicada. Genera la copia importable con:

```powershell
.\power-platform\scripts\set-public-url.ps1 -PublicUrl "https://subdominio-temporal.example.com"
```

El conector usa `x-api-key`. Configura una clave fuerte en `POWER_APPS_DEMO_KEY` antes de exponer únicamente el gateway `localhost:3000`. `apiProperties.json` describe la conexión segura; `settings.template.json` contiene solo placeholders.
