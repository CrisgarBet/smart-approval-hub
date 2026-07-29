import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const baseUrl = process.argv[2] ?? 'http://localhost:4201';
const candidates = [
  process.env.CHROME_PATH,
  join(process.env.PROGRAMFILES ?? '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  join(process.env['PROGRAMFILES(X86)'] ?? '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
].filter(Boolean);
const executablePath = candidates.find(existsSync);
if (!executablePath) throw new Error('Chrome no encontrado. Define CHROME_PATH.');

mkdirSync('artifacts', { recursive: true });
const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
const runtimeErrors = [];
page.on('pageerror', error => runtimeErrors.push(error.stack ?? error.message));
page.on('console', message => {
  if (message.type() === 'error') runtimeErrors.push(message.text());
});
page.on('requestfailed', request => runtimeErrors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));

async function createRequest(suffix, amount) {
  await page.goto(`${baseUrl}/nueva`, { waitUntil: 'networkidle0' });
  await page.type('[formcontrolname="requesterName"]', `Navegador ${suffix}`);
  await page.type('[formcontrolname="requesterEmail"]', `navegador.${suffix.toLowerCase()}@empresa.com`);
  await page.type('[formcontrolname="concept"]', `Prueba ${suffix}`);
  await page.type('[formcontrolname="costCenter"]', 'E2E');
  await page.type('[formcontrolname="amount"]', String(amount));
  await page.type('[formcontrolname="description"]', `Flujo de navegador ${suffix}`);
  await page.click('form button.primary');
  await page.waitForFunction(() => location.pathname.startsWith('/solicitudes/'), { timeout: 15_000 });
  await page.waitForNetworkIdle();
}

async function expectStatus(status) {
  await page.waitForFunction(expected => document.body.innerText.includes(expected), { timeout: 10_000 }, status);
  const body = await page.$eval('body', element => element.innerText);
  if (!body.includes(status)) throw new Error(`No se encontró el estado ${status}`);
  console.log(`[ok] Estado ${status}`);
}

const stamp = Date.now();
await createRequest(`Auto${stamp}`, 500000);
await expectStatus('APROBADA');

await createRequest(`Aprobar${stamp}`, 2500000);
await expectStatus('PENDIENTE');
page.once('dialog', dialog => void dialog.accept());
await page.click('button.success');
await expectStatus('APROBADA');

await createRequest(`Rechazar${stamp}`, 2600000);
await expectStatus('PENDIENTE');
await page.click('button.danger');
await page.type('textarea', 'Rechazo verificado desde Chrome headless');
page.once('dialog', dialog => void dialog.accept());
await page.click('button.danger');
await expectStatus('RECHAZADA');

await page.screenshot({ path: 'artifacts/browser-flow.png', fullPage: true });
console.log('[screenshot] artifacts/browser-flow.png');
await browser.close();
if (runtimeErrors.length) throw new Error(`Errores del navegador:\n${runtimeErrors.join('\n')}`);
console.log('[ok] Flujo Angular completo sin errores de navegador');
