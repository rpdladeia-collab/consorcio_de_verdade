import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [, , targetUrl, outputFile, widthArg = "390", heightArg = "844"] = process.argv;
if (!targetUrl || !outputFile) {
  throw new Error("Uso: node capture-panorama-preview.mjs <url> <arquivo.png> [largura] [altura]");
}

const width = Number(widthArg);
const height = Number(heightArg);
const endpoint = "http://127.0.0.1:9223";

async function waitForDebugger(timeoutMs = 10_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${endpoint}/json/new?about:blank`, { method: "PUT" });
      if (response.ok) return response.json();
    } catch {
      // Chromium ainda está iniciando.
    }
    await new Promise(resolveDelay => setTimeout(resolveDelay, 200));
  }
  throw new Error("Chromium remoto não ficou disponível dentro do limite esperado");
}

const target = await waitForDebugger();
const socket = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
const eventWaiters = new Map();

await new Promise((resolveOpen, rejectOpen) => {
  socket.addEventListener("open", resolveOpen, { once: true });
  socket.addEventListener("error", rejectOpen, { once: true });
});

socket.addEventListener("message", event => {
  const message = JSON.parse(String(event.data));
  if (message.id && pending.has(message.id)) {
    const { resolve: resolveCall, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolveCall(message.result ?? {});
    return;
  }
  const waiters = eventWaiters.get(message.method);
  if (!waiters) return;
  eventWaiters.delete(message.method);
  waiters.forEach(resolveEvent => resolveEvent(message.params ?? {}));
});

function call(method, params = {}) {
  const id = nextId++;
  return new Promise((resolveCall, reject) => {
    pending.set(id, { resolve: resolveCall, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

function waitForEvent(method, timeoutMs = 15_000) {
  return new Promise((resolveEvent, reject) => {
    const waiters = eventWaiters.get(method) ?? [];
    waiters.push(resolveEvent);
    eventWaiters.set(method, waiters);
    setTimeout(() => reject(new Error(`Evento ${method} não ocorreu`)), timeoutMs).unref();
  });
}

await call("Page.enable");
await call("Runtime.enable");
await call("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: true,
  screenWidth: width,
  screenHeight: height,
});
await call("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });

const loaded = waitForEvent("Page.loadEventFired");
await call("Page.navigate", { url: targetUrl });
await loaded;
await new Promise(resolveDelay => setTimeout(resolveDelay, 6_000));

await call("Runtime.evaluate", {
  expression: "document.fonts && document.fonts.ready",
  awaitPromise: true,
});
const metrics = await call("Page.getLayoutMetrics");
const contentSize = metrics.cssContentSize ?? metrics.contentSize;
const screenshot = await call("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: true,
  fromSurface: true,
  clip: {
    x: 0,
    y: 0,
    width: contentSize.width,
    height: contentSize.height,
    scale: 1,
  },
});

const absoluteOutput = resolve(outputFile);
await mkdir(dirname(absoluteOutput), { recursive: true });
await writeFile(absoluteOutput, Buffer.from(screenshot.data, "base64"));
console.log(
  JSON.stringify({
    url: targetUrl,
    output: absoluteOutput,
    viewport: { width, height },
    content: { width: contentSize.width, height: contentSize.height },
  }),
);
socket.close();
