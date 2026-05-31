"use strict";

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canUsePointerLight = window.matchMedia("(hover: hover) and (pointer: fine)").matches
  && window.innerWidth >= 821;
const glassSurfaces = document.querySelectorAll(
  ".mockup, .mockup-card, .app-card, .promise-grid div, .button"
);
const appLinks = document.querySelectorAll('a[href="/apps/everyday/"], a[href="/apps/dev/"]');
const openStatus = document.getElementById("app-open-status");

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let frameId = 0;

const setSurfaceReflection = (surface) => {
  const rect = surface.getBoundingClientRect();
  const localX = ((pointerX - rect.left) / rect.width) * 100;
  const localY = ((pointerY - rect.top) / rect.height) * 100;
  const nearestX = clamp(pointerX, rect.left, rect.right);
  const nearestY = clamp(pointerY, rect.top, rect.bottom);
  const distance = Math.hypot(pointerX - nearestX, pointerY - nearestY);
  const reach = surface.classList.contains("mockup") ? 420 : 230;
  const light = clamp(1 - distance / reach);

  surface.style.setProperty("--rx", `${clamp(localX, -35, 135).toFixed(2)}%`);
  surface.style.setProperty("--ry", `${clamp(localY, -35, 135).toFixed(2)}%`);
  surface.style.setProperty("--light", light > 0.03 ? light.toFixed(3) : "0");
};

const renderPointerLight = () => {
  frameId = 0;
  root.style.setProperty("--spotlight-x", `${pointerX.toFixed(1)}px`);
  root.style.setProperty("--spotlight-y", `${pointerY.toFixed(1)}px`);
  root.style.setProperty("--spotlight-opacity", "0.45");
  glassSurfaces.forEach(setSurfaceReflection);
};

if (!reduceMotion && canUsePointerLight) {
  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!frameId) {
        frameId = window.requestAnimationFrame(renderPointerLight);
      }
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    root.style.setProperty("--spotlight-opacity", "0");
    glassSurfaces.forEach((surface) => surface.style.setProperty("--light", "0"));
  });
}

const setAppOpenState = (activeLink, isOpening) => {
  appLinks.forEach((link) => {
    const sameTarget = link.getAttribute("href") === activeLink.getAttribute("href");
    link.classList.toggle("is-loading", Boolean(isOpening && sameTarget));
    link.setAttribute("aria-busy", String(Boolean(isOpening && sameTarget)));
  });
};

const waitForWorkerUpdate = async (registration) => {
  if (!registration) return;
  try {
    await registration.update();
  } catch {
    return;
  }

  const worker = registration.installing || registration.waiting;
  if (!worker) return;

  await new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, 1000);
    worker.addEventListener("statechange", () => {
      if (worker.state === "activated" || worker.state === "redundant") {
        window.clearTimeout(timeout);
        resolve();
      }
    });
  });
};

const warmAppRoute = async (url) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url.pathname, {
      cache: "reload",
      credentials: "same-origin",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`App route returned ${response.status}`);

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration(url.pathname);
      await waitForWorkerUpdate(registration);
    }
  } finally {
    window.clearTimeout(timeout);
  }
};

const registerShellWorker = () => {
  if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;

  navigator.serviceWorker.register("/sw.js", { scope: "/" })
    .then((registration) => {
      if (navigator.onLine) registration.update().catch(() => {});
      window.addEventListener("online", () => registration.update().catch(() => {}));
    })
    .catch(() => {});
};

registerShellWorker();

appLinks.forEach((link) => {
  link.addEventListener("click", async (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      link.target
    ) {
      return;
    }

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    setAppOpenState(link, true);
    if (openStatus) openStatus.textContent = `Opening ${link.textContent.trim()}...`;

    try {
      await warmAppRoute(url);
      window.location.assign(url.href);
    } catch {
      setAppOpenState(link, false);
      if (openStatus) {
        openStatus.textContent = "Connection is weak. Please try again.";
      }
    }
  });
});
