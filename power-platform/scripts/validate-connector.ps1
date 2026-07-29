param([string]$Path = "$PSScriptRoot\..\connector\apiDefinition.swagger.json", [switch]$RequireGeneratedHost)
$ErrorActionPreference = 'Stop'
$resolved = (Resolve-Path -LiteralPath $Path).Path
$doc = Get-Content -Raw -LiteralPath $resolved | ConvertFrom-Json
if ($doc.swagger -ne '2.0') { throw 'swagger debe ser 2.0' }
$expected = @('/health','/requests','/requests/{id}','/requests/{id}/approve','/requests/{id}/reject','/metrics')
foreach ($path in $expected) { if (!$doc.paths.PSObject.Properties.Name.Contains($path)) { throw "Falta endpoint $path" } }
$operations = @($doc.paths.PSObject.Properties.Value | ForEach-Object { $_.PSObject.Properties.Value } | Where-Object operationId)
$ids = @($operations.operationId)
if (($ids | Sort-Object -Unique).Count -ne $ids.Count) { throw 'Hay operationId duplicados' }
$expectedIds = @('PowerAppsHealth','ListRequests','GetRequest','CreateRequest','ApproveRequest','RejectRequest','GetMetrics')
foreach ($id in $expectedIds) { if (!$ids.Contains($id)) { throw "Falta operationId $id" } }
if ($doc.securityDefinitions.api_key.type -ne 'apiKey' -or $doc.securityDefinitions.api_key.name -ne 'x-api-key') { throw 'Seguridad api_key inválida' }
if (@($doc.paths.'/health'.get.security).Count -ne 0) { throw 'Health debe ser público' }
foreach ($operation in $operations | Where-Object operationId -ne 'PowerAppsHealth') { if ($null -eq $operation.security -and $null -eq $doc.security) { throw "Falta seguridad en $($operation.operationId)" } }
$refs = Select-String -InputObject (Get-Content -Raw $resolved) -Pattern '#/definitions/([A-Za-z0-9]+)' -AllMatches | ForEach-Object Matches | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
foreach ($ref in $refs) { if (!$doc.definitions.PSObject.Properties.Name.Contains($ref)) { throw "Definición inexistente: $ref" } }
if ($RequireGeneratedHost -and (!$doc.host -or $doc.host -eq 'POWER_APPS_PUBLIC_HOST' -or $doc.host -match 'localhost')) { throw 'El host generado debe ser público y no vacío' }
Write-Host "Swagger 2.0 válido: $resolved ($($ids.Count) operaciones)" -ForegroundColor Green
