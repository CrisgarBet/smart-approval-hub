param(
 [Parameter(Mandatory)][string]$Environment,
 [Parameter(Mandatory)][string]$SolutionUniqueName,
 [Parameter(Mandatory)][string]$PublicUrl,
 [string]$ConnectorDisplayName='Smart Approval Hub Demo',
 [SecureString]$ApiKey
)
$ErrorActionPreference='Stop'
if(!$ApiKey){throw 'ApiKey es obligatoria para exponer el gateway; pásala como SecureString.'}
& "$PSScriptRoot\set-public-url.ps1" -PublicUrl $PublicUrl
& "$PSScriptRoot\check-power-platform.ps1" -PublicUrl $PublicUrl
$help=pac connector create --help|Out-String
foreach($flag in @('--api-definition-file','--api-properties-file')){if($help-notmatch[regex]::Escape($flag)){throw "La versión instalada no soporta $flag. Revisa pac connector create --help; no se ejecutó ningún cambio remoto."}}
Write-Host "Entorno seleccionado: $Environment";Write-Host "Solución solicitada: $SolutionUniqueName";Write-Host "Conector: $ConnectorDisplayName";Write-Warning 'Se creará un recurso remoto en Power Platform.'
if((Read-Host 'Escribe CREAR para continuar')-cne'CREAR'){throw 'Operación cancelada por el usuario.'}
$definition=(Resolve-Path "$PSScriptRoot\..\generated\apiDefinition.swagger.json").Path;$properties=(Resolve-Path "$PSScriptRoot\..\connector\apiProperties.json").Path
$arguments=@('connector','create','--api-definition-file',$definition,'--api-properties-file',$properties)
if($help-match'--environment'){$arguments+=@('--environment',$Environment)}else{Write-Warning 'Esta versión no admite --environment en connector create; se usará el entorno del perfil activo ya verificado.'}
$output=& pac @arguments 2>&1;$output|ForEach-Object{Write-Host $_};if($LASTEXITCODE-ne0){throw 'Falló la creación. Revisa permisos, entorno, URL y pac connector create --help.'}
$id=([regex]::Match(($output|Out-String),'[0-9a-fA-F]{8}-[0-9a-fA-F-]{27,}')).Value
if($id){New-Item -ItemType Directory -Force "$PSScriptRoot\..\generated"|Out-Null;@{connectorId=$id;environment=$Environment;solution=$SolutionUniqueName;displayName=$ConnectorDisplayName}|ConvertTo-Json|Set-Content "$PSScriptRoot\..\generated\connector-deployment.local.json";Write-Host 'ID guardado localmente (archivo ignorado por Git).'}else{Write-Warning 'PAC no devolvió un GUID reconocible; consulta pac connector list.'}
Write-Warning 'La asociación a solución depende de los comandos disponibles en esta versión. Verifica el conector en la solución antes de generar la Canvas App.'
