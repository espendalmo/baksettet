(() => {
  "use strict";

  const parts = version => /^\d+\.\d+\.\d+$/.test(version) ? version.split(".").map(Number) : null;
  const compare = (a, b) => {
    const x = parts(a), y = parts(b);
    if (!x || !y) return 0;
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  };

  async function readPublishedVersion() {
    const url = new URL("../version.json", location.href);
    url.searchParams.set("__bak_published", String(Date.now()));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    try {
      const response = await fetch(url, { cache: "no-store", redirect: "error", signal: controller.signal });
      if (!response.ok) return null;
      const release = await response.json();
      return release.channel === "stable" && parts(release.version) ? release.version : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  function createUpdater({ version, channel, onStatus, beforeReload }) {
    const sw = navigator.serviceWorker;
    const watched = new WeakSet();
    let registration, initial, candidate, inspection = 0, checking = false, applying = false;
    const emit = (status, message) => onStatus({ status, message, candidate: candidate?.version });

    function identify(worker) {
      if (!worker) return Promise.resolve(null);
      return new Promise(resolve => {
        const message = new MessageChannel();
        const timer = setTimeout(() => finish(null), 1400);
        function finish(value) {
          clearTimeout(timer);
          message.port1.close();
          resolve(value?.channel === channel && parts(value.version) ? value.version : null);
        }
        message.port1.onmessage = event => finish(event.data);
        message.port1.onmessageerror = () => finish(null);
        try { worker.postMessage({ type: "GET_VERSION" }, [message.port2]); }
        catch { finish(null); }
      });
    }

    async function inspect() {
      if (!registration || applying) return;
      const attempt = ++inspection;
      const workers = [...new Set([registration.waiting, registration.active, sw.controller].filter(Boolean))];
      const versions = await Promise.all(workers.map(async worker => ({ worker, version: await identify(worker) })));
      if (attempt !== inspection || applying) return;
      candidate = versions.filter(item => item.worker.state !== "redundant" && compare(item.version, version) > 0)
        .sort((a, b) => compare(b.version, a.version))[0];
      if (candidate) emit("ready", `Versjon ${candidate.version} er klar. Låter, settlister og spillehistorikk blir med.`);
      else if (registration.installing) emit("downloading", "Laster ned appversjonen …");
      else if (versions.some(item => item.version)) emit("current", "Du har nyeste tilgjengelige versjon.");
      else emit("unavailable", "Appen er tilgjengelig. Prøv igjen på nett for å se etter oppdateringer.");
    }

    function watch(worker) {
      if (!worker || watched.has(worker)) return;
      watched.add(worker);
      worker.addEventListener("statechange", () => {
        if (["installed", "activated", "redundant"].includes(worker.state)) void inspect();
      });
    }

    function init() {
      if (initial) return initial;
      if (!sw) {
        emit("unavailable", "Appoppdateringer er tilgjengelige fra den publiserte appen på HTTPS.");
        return Promise.resolve();
      }
      initial = (async () => {
        try {
          registration = await sw.register("./service-worker.js", { updateViaCache: "none" });
          watch(registration.installing);
          watch(registration.waiting);
          registration.addEventListener("updatefound", () => {
            watch(registration.installing);
            if (!applying && !candidate) emit("downloading", "Laster ned appversjonen …");
          });
          sw.addEventListener("controllerchange", inspect);
          await inspect();
        } catch {
          initial = null;
          emit("error", "Kunne ikke klargjøre oppdateringer. Prøv igjen når du er på nett.");
        }
      })();
      return initial;
    }

    async function check() {
      if (checking || applying) return;
      checking = true;
      emit("checking", "Ser etter oppdateringer …");
      try {
        await init();
        if (!registration) return;
        await registration.update();
        watch(registration.installing);
        await inspect();
      } catch {
        if (candidate) emit("ready", `Versjon ${candidate.version} er klar.`);
        else emit("error", "Kunne ikke sjekke etter oppdatering. Prøv igjen når du er på nett.");
      } finally { checking = false; }
    }

    function waitForController(target) {
      return new Promise((resolve, reject) => {
        let settled = false, probing = false, poll;
        function finish(error) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          clearTimeout(poll);
          sw.removeEventListener("controllerchange", probe);
          target.worker.removeEventListener("statechange", probe);
          if (error) reject(error);
          else resolve();
        }
        async function probe() {
          if (settled || probing) return;
          probing = true;
          clearTimeout(poll);
          const worker = sw.controller;
          const current = await identify(worker);
          probing = false;
          if (settled) return;
          if (worker === sw.controller && worker?.state === "activated" && current === target.version) finish();
          else if (target.worker.state === "redundant") finish(new Error("Versjonen ble erstattet."));
          else poll = setTimeout(probe, 220);
        }
        const timer = setTimeout(() => finish(new Error("Tidsavbrudd.")), 10000);
        sw.addEventListener("controllerchange", probe);
        target.worker.addEventListener("statechange", probe);
        try {
          if (target.worker.state === "installed") target.worker.postMessage({ type: "SKIP_WAITING" });
          else if (target.worker.state === "activated") target.worker.postMessage({ type: "CLAIM_CLIENTS" });
          void probe();
        } catch (error) { finish(error); }
      });
    }

    async function apply() {
      if (!candidate || applying) return;
      applying = true;
      const target = candidate;
      emit("applying", "Gjør oppdateringen klar …");
      try {
        await waitForController(target);
        if (!beforeReload()) throw new Error("Lagring feilet.");
        const url = new URL(location.href);
        url.searchParams.set("__bak_update", target.version);
        location.replace(url.href);
      } catch {
        applying = false;
        emit("error", "Oppdateringen ble ikke åpnet. Prøv igjen når du er klar.");
      }
    }
    return { init, check, apply };
  }

  window.DrumUpdates = { createUpdater, readPublishedVersion };
})();
