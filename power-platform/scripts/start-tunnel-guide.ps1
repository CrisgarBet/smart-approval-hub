param([ValidateSet('cloudflared','ngrok')][string]$Provider)
$cloudflared=Get-Command cloudflared -ErrorAction SilentlyContinue;$ngrok=Get-Command ngrok -ErrorAction SilentlyContinue
if(!$Provider){Write-Host "cloudflared: $([bool]$cloudflared)";Write-Host "ngrok: $([bool]$ngrok)";Write-Warning 'Se requiere una URL HTTPS temporal. Configura primero una POWER_APPS_DEMO_KEY fuerte y expón únicamente localhost:3000.';if(!$cloudflared-and!$ngrok){Write-Host 'No hay proveedor instalado; no se abrió ningún túnel.'};exit}
if(!$env:POWER_APPS_DEMO_KEY){throw 'Define POWER_APPS_DEMO_KEY antes de abrir un túnel.'}
Write-Warning 'La URL será temporal. Ciérrala después de la demo; esto no es una estrategia de producción.'
if($Provider-eq'cloudflared'){if(!$cloudflared){throw 'cloudflared no está instalado.'};& cloudflared tunnel --url http://localhost:3000}else{if(!$ngrok){throw 'ngrok no está instalado.'};& ngrok http http://localhost:3000}
