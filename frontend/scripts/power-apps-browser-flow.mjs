import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] ?? 'http://localhost:4201';
const candidates = [
  process.env.CHROME_PATH,
  join(process.env.PROGRAMFILES ?? '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  join(process.env['PROGRAMFILES(X86)'] ?? '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
].filter(Boolean);
const executablePath = candidates.find(existsSync);

if (!executablePath) throw new Error('Chrome no encontrado');
mkdirSync('artifacts', { recursive: true });

const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
const problems = [];

page.on('pageerror', (error) => problems.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') problems.push(message.text());
});
page.on('requestfailed', (request) =>
  problems.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`),
);
page.on('dialog', (dialog) => void dialog.accept());

await page.goto(`${base}/power-apps-demo`, { waitUntil: 'networkidle0' });
await page.waitForFunction(
  () =>
    document.body.innerText.includes('Simulador local de integración con Power Apps') &&
    document.body.innerText.includes('ListRequests'),
);

async function replace(selector, value) {
  await page.waitForSelector(selector);
  await page.$eval(
    selector,
    (element, nextValue) => {
      const prototype =
        element instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      setter?.call(element, String(nextValue));
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    },
    value,
  );
}

async function fill(suffix, amount) {
  await replace('[formcontrolname="requesterName"]', `Canvas ${suffix}`);
  await replace(
    '[formcontrolname="requesterEmail"]',
    `canvas.${suffix.toLowerCase()}@empresa.com`,
  );
  await replace('[formcontrolname="concept"]', `Demo ${suffix}`);
  await replace('[formcontrolname="description"]', `Creada desde simulador ${suffix}`);
  await replace('[formcontrolname="amount"]', amount);
  await page.click('.canvas-form button.primary');
}

const stamp = Date.now();
await fill(`Auto${stamp}`, 500000);
await page.waitForFunction(() =>
  document.body.innerText.includes('CreateRequest completado: solicitud APROBADA.'),
);

await fill(`Approve${stamp}`, 2500000);
await page.waitForFunction(() =>
  document.body.innerText.includes('CreateRequest completado: solicitud PENDIENTE.'),
);
await page.click('.decision-row button.success');
await page.waitForFunction(() =>
  document.body.innerText.includes('ApproveRequest completado.'),
);

await fill(`Reject${stamp}`, 2600000);
await page.waitForFunction(() =>
  document.body.innerText.includes('CreateRequest completado: solicitud PENDIENTE.'),
);
await replace('.decision-row input', 'Sin presupuesto desde simulador');
await page.click('.decision-row button.danger');
await page.waitForFunction(() =>
  document.body.innerText.includes('RejectRequest completado.'),
);

const firstMonitorEntry = await page.$('.monitor-list button');
if (firstMonitorEntry) await firstMonitorEntry.click();

const body = await page.$eval('body', (element) => element.innerText);
for (const expected of [
  'API Gateway',
  'Custom Connector',
  'Monitor de llamadas REST',
  'CreateRequest',
  'ApproveRequest',
  'RejectRequest',
  'Arquitectura de la operación',
]) {
  if (!body.includes(expected)) throw new Error(`No se encontró ${expected}`);
}

await page.screenshot({ path: 'artifacts/power-apps-demo.png', fullPage: true });
console.log('[ok] carga, listado, métricas, creación, aprobación, rechazo y monitor');
console.log('[screenshot] artifacts/power-apps-demo.png');

await browser.close();
if (problems.length) throw new Error(problems.join('\n'));
