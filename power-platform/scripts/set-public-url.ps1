param([Parameter(Mandatory)][string]$PublicUrl)
$ErrorActionPreference = 'Stop'
$uri = [Uri]$PublicUrl
if ($uri.Scheme -ne 'https' -or !$uri.Host -or $uri.IsLoopback) { throw 'PublicUrl debe ser una URL HTTPS pública y no localhost.' }
$source = "$PSScriptRoot\..\connector\apiDefinition.swagger.json"
$outputDir = "$PSScriptRoot\..\generated"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$doc = Get-Content -Raw -LiteralPath $source | ConvertFrom-Json
$doc.host = if ($uri.IsDefaultPort) { $uri.Host } else { "$($uri.Host):$($uri.Port)" }
$doc.schemes = @('https')
$output = Join-Path $outputDir 'apiDefinition.swagger.json'
$doc | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $output -Encoding utf8
& "$PSScriptRoot\validate-connector.ps1" -Path $output -RequireGeneratedHost
Write-Host "Definición importable: $((Resolve-Path $output).Path)" -ForegroundColor Green
