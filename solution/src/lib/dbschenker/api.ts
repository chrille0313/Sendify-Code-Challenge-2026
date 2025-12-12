import chromedriver from 'chromedriver';
import CDP from 'chrome-remote-interface';
import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { shipmentResponseSchema, type ShipmentResponse } from './schemas.js';
import { deferredPromise } from '@/utils/promise.js';

const TRACKING_PUBLIC_URL = 'https://www.dbschenker.com/app/tracking-public/';
const API_BASE = 'https://www.dbschenker.com/nges-portal/api/public/tracking-public';
const SHIPMENT_ENDPOINT = `${API_BASE}/shipments`;
const DEFAULT_CDP_PORT = 9222;
const TRACKING_TIMEOUT_MS = 20000;

export async function fetchShipment(reference: string) {
  const trimmedReference = reference.trim();
  if (!trimmedReference) {
    throw new Error('Reference number cannot be empty.');
  }
  const encodedReference = encodeURIComponent(trimmedReference);

  const { driver, cdpPort } = await buildChromeDriver();
  const cdp = await attachCDP(cdpPort);

  try {
    const searchUrl = `${SHIPMENT_ENDPOINT}?query=${encodedReference}`;
    const shipmentPromise = deferredPromise();

    wireNetworkHandlers(cdp, searchUrl, shipmentPromise.resolve, shipmentPromise.reject);

    await driver.get(`${TRACKING_PUBLIC_URL}?refNumber=${encodedReference}&uiMode=`);

    // Race CDP capture against a timeout so we don't hang if the page never returns the shipment.
    const shipmentJson = await promiseWithTimeout(
      shipmentPromise.promise,
      TRACKING_TIMEOUT_MS,
      'Timed out waiting shipment payload'
    );

    return shipmentResponseSchema.parse(shipmentJson);
  } finally {
    await cdp.close();
    await driver.quit();
  }
}

// Listen for the search response to capture the shipment ID,
// then the detail response containing that ID to resolve.
function wireNetworkHandlers(
  cdp: CDP.Client,
  searchUrl: string,
  shipmentResolve: (v: ShipmentResponse) => void,
  shipmentReject: (err: Error) => void
) {
  const { Network } = cdp;
  let shipmentId: string | null = null;

  Network.responseReceived(async ({ response, requestId }) => {
    if (response.status !== 200) return;

    if (response.url.includes(searchUrl)) {
      const responseBody = await Network.getResponseBody({ requestId });
      const raw = responseBody?.body ?? '{}';
      const parsedSearch = JSON.parse(raw);
      const first = parsedSearch?.result?.[0];
      if (first?.id && first?.transportMode) {
        shipmentId = String(first.id);
      }
      return;
    }

    if (shipmentId && response.url.includes(shipmentId)) {
      try {
        const responseBody = await Network.getResponseBody({ requestId });
        const raw = responseBody?.body ?? '{}';
        const parsedShipment = shipmentResponseSchema.parse(JSON.parse(raw));
        shipmentResolve(parsedShipment);
      } catch (err) {
        shipmentReject(new Error(`Failed to parse shipment response: ${(err as Error).message}`));
      }
    }
  });
}

async function promiseWithTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  let timeout: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

async function buildChromeDriver() {
  const headless = process.env.SELENIUM_HEADLESS !== '0';
  const debugPort = Number(process.env.SELENIUM_CDP_PORT ?? 0) || DEFAULT_CDP_PORT;

  const options = new chrome.Options();
  if (headless) {
    options.addArguments('--headless=new');
  }
  options.addArguments('--disable-blink-features=AutomationControlled');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--no-sandbox');
  options.addArguments(`--remote-debugging-port=${debugPort}`);
  options.addArguments('--disable-logging');
  options.addArguments('--log-level=3');
  options.excludeSwitches('enable-logging');

  const service = new chrome.ServiceBuilder(chromedriver.path);

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  return { driver, cdpPort: debugPort };
}

async function attachCDP(port: number) {
  const cdp = await CDP({ port });
  const { Network } = cdp;
  await Network.enable();
  return cdp;
}
