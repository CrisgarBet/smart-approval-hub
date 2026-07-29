param([Parameter(Mandatory)][string]$Environment,[string]$ConnectorDisplayName='Smart Approval Hub Demo',[string]$ConnectorId)
$ErrorActionPreference='Stop';$pac=Get-Command pac -ErrorAction SilentlyContinue;if(!$pac){throw 'PAC CLI no está instalada; no se generó ningún .msapp.'}
pac auth who;if($LASTEXITCODE-ne0){throw 'No hay autenticación activa.'}
$state="$PSScriptRoot\..\generated\connector-deployment.local.json";if(!$ConnectorId-and(Test-Path $state)){$ConnectorId=(Get-Content -Raw $state|ConvertFrom-Json).connectorId};if(!$ConnectorId){throw 'Falta ConnectorId; despliega/verifica el conector primero.'}
$help=pac canvas create --help|Out-String;if($help-notmatch'--msapp'){throw 'Esta versión no soporta --msapp según pac canvas create --help.'}
$dir="$PSScriptRoot\..\generated";New-Item -ItemType Directory -Force $dir|Out-Null;$output=Join-Path $dir 'SmartApprovalHubDemo.msapp'
if((Test-Path $output)-and(Read-Host 'El .msapp existe. Escribe SOBRESCRIBIR')-cne'SOBRESCRIBIR'){throw 'No se sobrescribió la aplicación.'}
Write-Host "Entorno: $Environment; Conector: $ConnectorDisplayName ($ConnectorId)";if((Read-Host 'Escribe GENERAR para ejecutar pac canvas create')-cne'GENERAR'){throw 'Operación cancelada.'}
$arguments=@('canvas','create','--msapp',$output);if($help-match'--connector-display-name'){$arguments+=@('--connector-display-name',$ConnectorDisplayName)};if($help-match'--connector-id'){$arguments+=@('--connector-id',$ConnectorId)};if($help-match'--environment'){$arguments+=@('--environment',$Environment)}
& pac @arguments;if($LASTEXITCODE-ne0){throw 'pac canvas create falló. No se afirma que la app funcione.'};if(!(Test-Path $output)){throw 'PAC terminó sin crear el archivo esperado.'};Write-Host "Archivo generado: $output ($((Get-Item $output).Length) bytes)";Write-Warning 'Debe importarse y probarse en Power Apps Studio antes de considerarlo funcional.'
