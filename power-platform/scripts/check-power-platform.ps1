param([string]$PublicUrl)
$ErrorActionPreference='Stop'
$pac=Get-Command pac -ErrorAction SilentlyContinue
if(!$pac){Write-Warning 'Microsoft Power Platform CLI (pac) no está instalada.';Write-Host 'Instalación oficial en Windows: winget install Microsoft.PowerPlatformCLI';Write-Host 'Después ejecuta: pac auth create, pac auth list y pac auth who.';exit 2}
Write-Host "PAC: $(pac --version)"
pac auth list
pac auth who;if($LASTEXITCODE-ne0){throw 'No existe un perfil autenticado/entorno activo. Completa pac auth create manualmente.'}
$connectorHelp=(pac connector --help|Out-String);$canvasHelp=(pac canvas create --help|Out-String)
if($LASTEXITCODE-ne0-or!$connectorHelp){throw 'pac connector no está disponible en esta versión.'}
if(!$canvasHelp){throw 'pac canvas create no está disponible en esta versión.'}
$swagger="$PSScriptRoot\..\generated\apiDefinition.swagger.json";$properties="$PSScriptRoot\..\connector\apiProperties.json"
if(!(Test-Path $swagger)){throw 'Falta el Swagger generado. Ejecuta set-public-url.ps1.'};if(!(Test-Path $properties)){throw 'Falta apiProperties.json.'}
if($PublicUrl){$uri=[Uri]$PublicUrl;if($uri.Scheme-ne'https'-or$uri.IsLoopback){throw 'La URL pública debe ser HTTPS y no localhost.'}}
Write-Host 'Entorno PAC y artefactos preparados.' -ForegroundColor Green
