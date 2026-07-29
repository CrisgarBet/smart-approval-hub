import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:4201';
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
const problems = [];
page.on('console', message => {
  const line = `[console.${message.type()}] ${message.text()}`;
  console.log(line);
  if (message.type() === 'error') problems.push(line);
});
page.on('pageerror', error => {
  const line = `[pageerror] ${error.stack ?? error.message}`;
  console.log(line);
  problems.push(line);
});
page.on('requestfailed', request => {
  const line = `[requestfailed] ${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`;
  console.log(line);
  problems.push(line);
});
page.on('response', response => {
  if (response.status() >= 400) {
    const line = `[http ${response.status()}] ${response.url()}`;
    console.log(line);
    problems.push(line);
  }
});

const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });
await new Promise(resolve => setTimeout(resolve, 500));
console.log(`[document] HTTP ${response?.status()} ${url}`);
console.log(`[title] ${await page.title()}`);
console.log(`[body] ${(await page.$eval('body', element => element.innerText)).replaceAll(/\s+/g, ' ').trim() || '<vacío>'}`);
await page.screenshot({ path: 'artifacts/browser-diagnostic.png', fullPage: true });
console.log('[screenshot] artifacts/browser-diagnostic.png');
await browser.close();
if (problems.length) process.exitCode = 1;
