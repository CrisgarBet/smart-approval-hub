param(
  [string]$GatewayUrl = 'http://localhost:3000/api/powerapps',
  [string]$ApiKey = $env:POWER_APPS_DEMO_KEY
)
$ErrorActionPreference = 'Stop'
if (!$ApiKey) { throw 'Define POWER_APPS_DEMO_KEY o usa -ApiKey. El script no imprime su valor.' }
function Invoke-ExpectedFailure([scriptblock]$Action,[int]$Status,[string]$Name){try{& $Action;throw "$Name no produjo HTTP $Status"}catch{if ($_.Exception.Response.StatusCode.value__ -ne $Status){throw};Write-Host "OK $Name -> HTTP $Status"}}
$headers=@{'x-api-key'=$ApiKey}
Write-Host '1. Health público';$health=Invoke-RestMethod "$GatewayUrl/health";if($health.status-ne'ok'){throw 'Health degradado'}
Write-Host '2. API key faltante e incorrecta';Invoke-ExpectedFailure {Invoke-RestMethod "$GatewayUrl/requests"} 401 'Sin API key';Invoke-ExpectedFailure {Invoke-RestMethod "$GatewayUrl/requests" -Headers @{'x-api-key'='incorrecta'}} 403 'API key incorrecta'
Write-Host '3. API key correcta, ListRequests y GetMetrics';$list=Invoke-RestMethod "$GatewayUrl/requests" -Headers $headers;if($null-eq$list.items){throw 'ListRequests no devolvió items'};Invoke-RestMethod "$GatewayUrl/metrics" -Headers $headers|Out-Null
function New-Request([decimal]$Amount,[string]$Suffix){Invoke-RestMethod -Method Post -Uri "$GatewayUrl/requests" -Headers $headers -ContentType 'application/json' -Body (@{requesterName="Power Apps $Suffix";requesterEmail="powerapps.$($Suffix.ToLower())@empresa.com";concept="Demo $Suffix";description='Prueba del contrato Power Apps';amount=$Amount;costCenter='POWER-PLATFORM'}|ConvertTo-Json)}
Write-Host '4. CreateRequest 500000';$auto=New-Request 500000 'Auto';if($auto.status-ne'APROBADA'){throw 'La solicitud automática no quedó APROBADA'}
Write-Host '5. CreateRequest 2500000 y ApproveRequest';$pending=New-Request 2500000 'Aprobar';if($pending.status-ne'PENDIENTE'){throw 'La solicitud alta no quedó PENDIENTE'};$approved=Invoke-RestMethod -Method Patch -Uri "$GatewayUrl/requests/$($pending.id)/approve" -Headers $headers -ContentType 'application/json' -Body '{}';if($approved.status-ne'APROBADA'){throw 'ApproveRequest falló'}
Write-Host '6. RejectRequest y protección repetida';$toReject=New-Request 2600000 'Rechazar';$rejected=Invoke-RestMethod -Method Patch -Uri "$GatewayUrl/requests/$($toReject.id)/reject" -Headers $headers -ContentType 'application/json' -Body '{"rejectionComment":"Sin presupuesto para la demostración"}';if($rejected.status-ne'RECHAZADA'){throw 'RejectRequest falló'};Invoke-ExpectedFailure {Invoke-RestMethod -Method Patch -Uri "$GatewayUrl/requests/$($toReject.id)/approve" -Headers $headers -ContentType 'application/json' -Body '{}'} 409 'Decisión repetida'
Write-Host 'Power Apps smoke test completado correctamente.' -ForegroundColor Green
