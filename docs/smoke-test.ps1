$ErrorActionPreference = 'Stop'
$baseUrl = if ($env:GATEWAY_URL) { $env:GATEWAY_URL } else { 'http://localhost:3000/api' }

Write-Host '1. Verificando health...'
Invoke-RestMethod "$baseUrl/health" | ConvertTo-Json

Write-Host '2. Creando solicitud de 500.000 COP...'
$small = Invoke-RestMethod -Method Post -Uri "$baseUrl/requests" -ContentType 'application/json' -Body (@{
  requesterName = 'Demo Automática'; requesterEmail = 'demo.auto@empresa.com'; concept = 'Insumos';
  description = 'Solicitud para validar aprobación automática'; amount = 500000; costCenter = 'DEMO'
} | ConvertTo-Json)
if ($small.status -ne 'APROBADA') { throw "Se esperaba APROBADA y se recibió $($small.status)" }

Write-Host '3. Creando solicitud de 2.500.000 COP...'
$large = Invoke-RestMethod -Method Post -Uri "$baseUrl/requests" -ContentType 'application/json' -Body (@{
  requesterName = 'Demo Manual'; requesterEmail = 'demo.manual@empresa.com'; concept = 'Equipos';
  description = 'Solicitud para validar aprobación manual'; amount = 2500000; costCenter = 'DEMO'
} | ConvertTo-Json)
if ($large.status -ne 'PENDIENTE') { throw "Se esperaba PENDIENTE y se recibió $($large.status)" }

Write-Host '4. Aprobando solicitud pendiente...'
$approved = Invoke-RestMethod -Method Patch -Uri "$baseUrl/requests/$($large.id)/approve" -ContentType 'application/json' -Body '{}'
if ($approved.status -ne 'APROBADA') { throw 'La aprobación manual falló' }

Write-Host '5. Validando rechazo y protección contra decisiones repetidas...'
$toReject = Invoke-RestMethod -Method Post -Uri "$baseUrl/requests" -ContentType 'application/json' -Body (@{
  requesterName = 'Demo Rechazo'; requesterEmail = 'demo.rechazo@empresa.com'; concept = 'Evento';
  description = 'Solicitud para validar rechazo'; amount = 3000000; costCenter = 'DEMO'
} | ConvertTo-Json)
$rejected = Invoke-RestMethod -Method Patch -Uri "$baseUrl/requests/$($toReject.id)/reject" -ContentType 'application/json' -Body '{"comment":"Fuera del presupuesto de demostración"}'
if ($rejected.status -ne 'RECHAZADA' -or !$rejected.decisionComment) { throw 'El rechazo con comentario falló' }
try {
  Invoke-RestMethod -Method Patch -Uri "$baseUrl/requests/$($toReject.id)/approve" -ContentType 'application/json' -Body '{}'
  throw 'Se permitió una decisión repetida'
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 409) { throw }
}

Write-Host '6. Consultando métricas...'
Invoke-RestMethod "$baseUrl/requests/metrics" | ConvertTo-Json
Write-Host 'Smoke test completado correctamente.' -ForegroundColor Green
