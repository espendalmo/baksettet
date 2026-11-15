(() => {
  "use strict";

  const M = window.DrumModel;
  const $ = id => document.getElementById(id);
  const root = document.body;
  const channel = root.dataset.channel;
  const version = root.dataset.version;
  const beta = channel === "beta";
  const standalone = channel === "preview" || location.protocol === "file:";
  const storageKey = standalone ? "bak-settet-preview-v1" : beta ? "bak-settet-beta-v1" : "bak-settet-v1";
  const stableURL = beta ? new URL("../index.html", location.href) : null;
  const modal = $("modal");
  const views = ["scene", "settlister", "repertoar", "editor"];
  const modeName = { fixed: "Fast settliste", free: "Frie forslag" };
  const noteModes = { drums: "Trommesett", percussion: "Perkusjon" };
  const icons = {
    drum: '<ellipse cx="12" cy="8" rx="8" ry="3"/><path d="M4 8v8c0 1.7 3.6 3 8 3s8-1.3 8-3V8M8 12v5m4-5v7m4-7v5"/>',
    sticks: '<path d="m4 4 14 14m2 2-2-2m2-14L6 18m-2 2 2-2M4 9v4m16-4v4"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    music: '<path d="M9 17V5l11-2v12M9 9l11-2"/><ellipse cx="6" cy="17" rx="3" ry="2"/><ellipse cx="17" cy="15" rx="3" ry="2"/>',
    gear: '<path d="m10 3-.7 2.4-2 .9-2.3-.9-2 3.5 1.7 1.8v2.6L3 15l2 3.5 2.3-.9 2 .9L10 21h4l.7-2.5 2-.9 2.3.9 2-3.5-1.7-1.7v-2.6L21 9l-2-3.5-2.3.9-2-.9L14 3z"/><circle cx="12" cy="12" r="3"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4 4"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowRight: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    arrowLeft: '<path d="M20 12H5m6-6-6 6 6 6"/>',
    up: '<path d="M12 19V5m-5 5 5-5 5 5"/>',
    down: '<path d="M12 5v14m-5-5 5 5 5-5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    screen: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
    shuffle: '<path d="M3 6h3c5 0 7 12 12 12h3m-3-3 3 3-3 3M3 18h3c2 0 3.5-2 5-4m2-4c1.5-2 3-4 5-4h3m-3-3 3 3-3 3"/>',
    flag: '<path d="M5 21V4c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>',
    pulse: '<path d="M2 12h5l3-6 4 12 3-6h5"/>',
    pause: '<path d="M9 5v14m6-14v14"/>',
    star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    note: '<path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8m-8 4h6"/>',
    undo: '<path d="M9 5 4 10l5 5m-5-5h10a5 5 0 0 1 0 10"/>',
    refresh: '<path d="M20 10a8 8 0 0 0-14-4L3 9m0-5v5h5m-4 5a8 8 0 0 0 14 4l3-3m0 5v-5h-5"/>',
    edit: '<path d="m14 5 5 5M4 20l4-.8L20 7l-4-4L4 15z"/>',
    play: '<path d="m8 5 12 7-12 7z"/>',
    folder: '<path d="M3 6h7l2 2h9v11H3z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>'
  };

  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name] || ""}</svg>`;
  const button = (action, label, { symbol, style = "", data = "", disabled = false } = {}) =>
    `<button class="button ${style}" type="button" data-action="${action}" ${data}${disabled ? " disabled" : ""}>${symbol ? icon(symbol) : ""}${esc(label)}</button>`;
  const iconButton = (action, label, symbol, { style = "", data = "", disabled = false } = {}) =>
    `<button class="icon-button ${style}" type="button" data-action="${action}" aria-label="${esc(label)}" title="${esc(label)}" ${data}${disabled ? " disabled" : ""}>${icon(symbol)}</button>`;
  const link = (view, label, symbol, style = "") =>
    `<a class="button ${style}" href="#${view}">${symbol ? icon(symbol) : ""}${esc(label)}</a>`;
  const idData = id => `data-id="${esc(id)}"`;
  const empty = message => `<p class="empty-box">${esc(message)}</p>`;
  const check = value => value ? " checked" : "";
  const pressed = value => `aria-pressed="${Boolean(value)}"`;
  const parse = value => { try { return JSON.parse(value); } catch { return null; } };
  const getOld = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const activeView = () => {
    const value = location.hash.slice(1);
    return views.includes(value) ? value : "scene";
  };

  let model;
  let storageText = null;
  let storageAvailable = true;
  let externalChange = false;
  let source = "Medfølgende data";
  let undo = [];
  let reviewId = null;
  let suggestions = null;
  let wakeLock = null;
  let wakePending = false;
  let pulseEnabled = false;
  let pulseKey = null;
  let pulseTimer = null;
  let pulseBeat = -1;
  let lastAdvance = -Infinity;
  let filter = "all";
  let libraryQuery = "";
  let editorQuery = "";
  let editorTab = "songs";
  let modalType = null;
  let modalOpener = null;
  let toastTimer;
  let publishedLabel = "Sjekker publisert versjon …";
  let updateStatus = { status: "idle", message: "Se etter en nyere versjon når du er på nett." };

  const song = id => model.songs.find(item => item.id === id);
  const project = (from = model) => from.projects.find(item => item.id === from.activeProjectId) || from.projects[0];
  const setlist = (from = model) => {
    const p = project(from);
    return p.setlists.find(item => item.id === from.state.activeSetlistByProject[p.id]) || p.setlists[0];
  };
  const session = (from = model) => from === model
    ? model.state.projectState[project().id] || { played: [], history: [], favorites: [] }
    : M.projectState(from.state, project(from).id);
  const runFor = (from = model) => from === model
    ? model.state.setRuns[project().id]?.[setlist().id] || { done: [], active: null, last: null, hold: false }
    : M.setRun(from.state, project(from).id, setlist(from).id);
  const projectSongs = () => model.songs.filter(item => item.projects.includes(project().id));
  const freeSong = () => {
    const item = song(model.state.activeSongByProject[project().id]);
    return item?.projects.includes(project().id) && !session().played.includes(item.id) ? item : null;
  };

  function readRecord(raw, fallback = window.DrumSeed) {
    const data = M.normalizeDataset(raw?.songs && raw?.projects ? raw : fallback);
    const id = M.projectId(raw?.activeProjectId);
    const editorId = M.projectId(raw?.editorProject);
    return {
      ...data,
      state: M.readSession(raw?.state, data),
      settings: M.readSettings(raw?.settings),
      activeProjectId: data.projects.some(p => p.id === id) ? id : data.projects[0].id,
      editorProject: data.projects.some(p => p.id === editorId) ? editorId : "all",
      dirty: raw?.dirty === true
    };
  }

  function legacyRecord() {
    if (beta || standalone) return null;
    const candidates = [
      "gig-settliste-data-v1", "gig-settliste-v8-editor-draft",
      "gig-settliste-v7-editor-draft", "gig-settliste-v7-data"
    ].flatMap(key => {
      const value = parse(getOld(key));
      if (!Array.isArray(value?.songs) || !Array.isArray(value?.projects)) return [];
      return [{ ...value, dirty: value.dirty ?? key !== "gig-settliste-data-v1" }];
    }).sort((a, b) => String(b.savedAt || "").localeCompare(String(a.savedAt || "")));
    const data = candidates[0];
    const state = [
      "gig-settliste-state-v1", "gig-settliste-v7-state",
      "gig-settliste-v6.4", "gig-settliste-v6.3", "gig-settliste-v6.2", "gig-settliste-v6.1"
    ].map(key => parse(getOld(key))).find(value => value && typeof value === "object");
    const flag = (key, fallback) => {
      const value = getOld(`gig-settliste-${key}-v1`);
      return value == null ? fallback : value === "1";
    };
    return {
      ...data,
      state,
      activeProjectId: getOld("gig-settliste-active-project-v1") || getOld("gig-settliste-v7-active-project"),
      editorProject: getOld("gig-settliste-editor-project-v1") || getOld("gig-settliste-v7-editor-project"),
      settings: {
        theme: getOld("gig-settliste-theme-v1"),
        autoNext: flag("autonext", true),
        wakeEnabled: flag("wake", true),
        pulseHalf: flag("pulse-half", false),
        pulseAccent: flag("pulse-accent", true),
        sceneNotesVisible: flag("scene-notes", true)
      }
    };
  }

  function announce(message) {
    $("announcement").textContent = message;
  }

  function notify(message, { canUndo = false, duration = 3200 } = {}) {
    if (modal.open && $("dialog-message")) $("dialog-message").textContent = message;
    const toast = $("toast");
    $("toast-message").textContent = message;
    toast.querySelector("button")?.remove();
    if (canUndo) toast.insertAdjacentHTML("beforeend", button("undo", "Angre", { style: "quiet" }));
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, duration);
  }

  function persist(next) {
    if (!storageAvailable) return true;
    try {
      if (localStorage.getItem(storageKey) !== storageText) {
        externalChange = true;
        notify("En annen fane har endret dataene. Lukk dialogen eller oppdater fanen før du prøver igjen.", { duration: 6000 });
        if (!modal.open) syncExternal();
        return false;
      }
      const raw = JSON.stringify(next);
      if (raw !== storageText) localStorage.setItem(storageKey, raw);
      storageText = raw;
      return true;
    } catch {
      notify("Kunne ikke lagre endringen. Det forrige innholdet er beholdt.", { duration: 5500 });
      return false;
    }
  }

  function commit(change, label) {
    const before = model;
    const next = structuredClone(before);
    change(next);
    if (!persist(next)) return false;
    model = next;
    if (label) {
      undo.push({ label, before, after: next });
      if (undo.length > 10) undo.shift();
    }
    return true;
  }

  function syncExternal() {
    if (!externalChange || modal.open) return;
    externalChange = false;
    const raw = getOld(storageKey);
    if (!raw || raw === storageText) return;
    const next = parse(raw);
    if (!next?.songs || !next?.projects) return;
    model = readRecord(next);
    storageText = raw;
    source = model.dirty ? "Lokale endringer" : "Lagrede data";
    undo = [];
    reviewId = null;
    suggestions = null;
    render();
  }

  function revertChange(before, after, current) {
    const equal = (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b);
    if (equal(before, after)) return current;
    if (equal(current, after)) return before;
    const record = value => value && typeof value === "object" && !Array.isArray(value);
    if (![before, after, current].every(record)) return current;
    const result = { ...current };
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
      const value = revertChange(before[key], after[key], current[key]);
      if (value === undefined) delete result[key];
      else result[key] = value;
    }
    return result;
  }

  function undoLast() {
    const item = undo.at(-1);
    if (!item) return;
    const restored = revertChange(item.before, item.after, model);
    if (!persist(restored)) return;
    undo.pop();
    model = restored;
    reviewId = null;
    suggestions = null;
    if (modalType === "settings") closeDialog();
    render();
    notify(`Angret · ${item.label}`);
  }

  function fixedSelection() {
    const set = setlist();
    const run = runFor();
    const pending = set.items.filter(item => !run.done.includes(item.entryId));
    const lastIndex = set.items.findIndex(item => item.entryId === run.last);
    const active = pending.find(item => item.entryId === run.active)
      || (!run.hold && set.items.slice(lastIndex + 1).find(item => !run.done.includes(item.entryId)))
      || null;
    const index = active ? set.items.indexOf(active) : lastIndex;
    return { set, run, pending, active, later: set.items.slice(index + 1).filter(item => !run.done.includes(item.entryId)) };
  }

  function stageState() {
    if (model.settings.mode === "free") {
      const current = freeSong();
      const review = reviewId ? song(reviewId) : null;
      return { fixed: false, current, review: Boolean(review), song: review || current };
    }
    const selection = fixedSelection();
    const review = selection.set.items.find(item => item.entryId === reviewId);
    const item = review || selection.active;
    return {
      ...selection, fixed: true, item, review: Boolean(review),
      song: item?.type === "song" ? song(item.songId) : null
    };
  }

  function go(view) {
    if (modal.open) closeDialog();
    const hash = `#${view}`;
    if (location.hash === hash) {
      render();
      stageTop();
    } else location.hash = hash;
  }

  function appScroller() {
    const container = $("app-scroll");
    return getComputedStyle(container).position === "fixed" ? container : window;
  }

  function stageTop(focus = false) {
    appScroller().scrollTo({ top: 0, behavior: "auto" });
    if (focus) $("stage-title")?.focus({ preventScroll: true });
  }

  function scrollToPlayingSong() {
    const card = $("playing-song");
    const lights = $("stage-pulse-dots");
    if (!card || !lights) return;

    const scroller = appScroller();
    const viewportTop = scroller === window ? 0 : scroller.getBoundingClientRect().top;
    const currentTop = scroller === window ? window.scrollY : scroller.scrollTop;
    const dock = $("dock");
    const viewportBottom = dock.hidden ? window.innerHeight : dock.getBoundingClientRect().top;
    const pulse = lights.getBoundingClientRect();
    const notes = $("scene-notes");
    const firstNote = !notes.hidden && notes.querySelector(".note-text, .empty-box");
    const note = firstNote ? firstNote.getBoundingClientRect() : pulse;
    const readingBottom = Math.min(note.bottom, note.top + 48);
    const cardTop = card.getBoundingClientRect().top - viewportTop;
    const pulseTop = pulse.top - viewportTop;
    const offset = Math.min(pulseTop - 12, Math.max(cardTop - 12, readingBottom - viewportBottom + 12));
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    scroller.scrollTo({ top: Math.max(0, currentTop + offset), behavior });
  }

  function setMode(mode) {
    if (mode !== "fixed" && mode !== "free") return;
    if (!commit(next => { next.settings.mode = mode; })) return;
    reviewId = null;
    suggestions = null;
    pulseEnabled = false;
    closeDialog();
    go("scene");
    announce(modeName[mode]);
  }

  function changeProject(id) {
    if (!model.projects.some(p => p.id === id) || !commit(next => { next.activeProjectId = id; })) return false;
    reviewId = null;
    suggestions = null;
    filter = "all";
    const view = activeView();
    if (view === "repertoar") renderLibraryContent();
    else if (view === "settlister") renderSetlistContent();
    else render();
    if (view === "settlister") updateSetlistOptions($("view"));
    if (modal.open && modalType === "context") updateSetlistOptions(modal);
    announce(`Prosjekt ${project().name}`);
    return true;
  }

  function changeSetlist(id) {
    if (!project().setlists.some(set => set.id === id)) return false;
    if (!commit(next => { next.state.activeSetlistByProject[project(next).id] = id; })) return false;
    reviewId = null;
    if (activeView() === "settlister") renderSetlistContent();
    else render();
    return true;
  }

  function selectFixed(id, { navigate = false } = {}) {
    const item = setlist().items.find(row => row.entryId === id);
    if (!item) return;
    if (runFor().done.includes(id)) {
      reviewId = id;
      if (model.settings.mode !== "fixed" && !commit(next => { next.settings.mode = "fixed"; })) return;
    } else {
      if (!commit(next => {
        next.settings.mode = "fixed";
        const run = runFor(next);
        run.active = id;
        run.hold = false;
      })) return;
      reviewId = null;
    }
    closeDialog();
    if (navigate) go("scene");
    else render();
    stageTop(true);
  }

  function selectFree(id) {
    const item = song(id);
    if (!item?.projects.includes(project().id)) return;
    const alreadyPlayed = session().played.includes(id);
    if (!commit(next => {
      next.settings.mode = "free";
      if (!alreadyPlayed) next.state.activeSongByProject[project(next).id] = id;
    })) return;
    reviewId = alreadyPlayed ? id : null;
    suggestions = null;
    closeDialog();
    go("scene");
    stageTop(true);
  }

  function addPlay(next, id, repeat = false) {
    const current = session(next);
    if (!current.played.includes(id)) current.played.push(id);
    if (repeat || !current.history.includes(id)) current.history.push(id);
  }

  function nextSet(next) {
    const pid = project(next).id;
    next.state.setNoByProject[pid] = (next.state.setNoByProject[pid] || 1) + 1;
    const starts = next.state.setStartsByProject[pid] ||= [0];
    starts.push(session(next).history.length);
  }

  function advance() {
    const now = performance.now();
    if (now - lastAdvance < 460) return;
    const stage = stageState();
    if (stage.review) {
      reviewId = null;
      render();
      stageTop(true);
      return;
    }
    const item = stage.fixed ? stage.active : stage.current;
    if (!item) {
      if (stage.fixed && stage.pending.length) selectFixed((stage.later[0] || stage.pending[0]).entryId);
      else if (!stage.fixed && projectSongs().some(item => !session().played.includes(item.id))) showFind("scene");
      return;
    }
    const pause = stage.fixed && item.type === "pause";
    const label = pause ? "Avslutt pause" : "Marker som spilt";
    if (!commit(next => {
      if (stage.fixed) {
        const run = runFor(next);
        run.done.push(item.entryId);
        run.last = item.entryId;
        run.active = null;
        run.hold = !pause && !next.settings.autoNext && stage.later.length > 0;
        if (pause && stage.later.some(entry => entry.type === "song")) nextSet(next);
        if (!pause) addPlay(next, item.songId, true);
      } else {
        addPlay(next, item.id);
        next.state.activeSongByProject[project(next).id] = null;
      }
    }, label)) return;
    lastAdvance = now;
    suggestions = null;
    render();
    stageTop(true);
    notify(pause ? "Pausen er ferdig" : "Markert som spilt", { canUndo: true });
  }

  function previous(stage) {
    if (stage.fixed) {
      const index = stage.item ? stage.set.items.indexOf(stage.item)
        : stage.set.items.findIndex(item => item.entryId === stage.run.last) + 1;
      const item = stage.set.items.slice(0, index).reverse().find(row => row.type === "song");
      return item?.entryId;
    }
    const history = session().history;
    const index = stage.review ? history.lastIndexOf(reviewId) : history.length;
    return history.slice(0, index).reverse().find(id => song(id) && id !== reviewId);
  }

  function restoreSong(id) {
    const selected = song(id);
    if (!selected || !session().played.includes(id)) return;
    if (!commit(next => {
      const p = project(next);
      const current = session(next);
      const history = current.history;
      current.played = current.played.filter(value => value !== id);
      current.history = history.filter(value => value !== id);
      if (next.state.setStartsByProject[p.id]) {
        next.state.setStartsByProject[p.id] = next.state.setStartsByProject[p.id]
          .map(index => history.slice(0, index).filter(value => value !== id).length);
      }
      for (const set of p.setlists) {
        const run = M.setRun(next.state, p.id, set.id);
        const removed = new Set(set.items.filter(item => item.type === "song" && item.songId === id).map(item => item.entryId));
        run.done = run.done.filter(entryId => !removed.has(entryId));
        if (removed.has(run.last)) run.last = null;
        run.hold = false;
      }
    }, "Sett som uspilt")) return;
    closeDialog();
    suggestions = null;
    render();
    notify(`Flyttet til uspilt · ${selected.title}`, { canUndo: true });
  }

  function toggleFavorite(id) {
    if (!song(id)) return;
    if (!commit(next => {
      const current = session(next);
      current.favorites = current.favorites.includes(id)
        ? current.favorites.filter(value => value !== id) : [...current.favorites, id];
    })) return;
    suggestions = null;
    render();
    const focused = document.querySelector(`[data-action="favorite"][data-id="${CSS.escape(id)}"]`);
    focused?.focus({ preventScroll: true });
    announce(session().favorites.includes(id) ? "Lagt til i favoritter" : "Fjernet fra favoritter");
  }

  function resetNight() {
    confirmDialog("Nullstill kvelden?", `Spilt-status, historikk og sett-teller for ${project().name} nullstilles. Favoritter og settlister beholdes.`, "Nullstill kvelden", () => {
      if (!commit(next => {
        const pid = project(next).id;
        const state = next.state;
        const favorites = session(next).favorites;
        state.projectState[pid] = { played: [], history: [], favorites };
        state.setNoByProject[pid] = 1;
        state.setStartsByProject[pid] = [0];
        state.activeSongByProject[pid] = null;
        delete state.setRuns[pid];
      }, "Nullstill kvelden")) return false;
      reviewId = null;
      suggestions = null;
      pulseEnabled = false;
      libraryQuery = "";
      filter = "all";
      render();
      notify("Kvelden er nullstilt", { canUndo: true });
      return true;
    }, "danger");
  }

  function noteParts(text) {
    if (!text.trim()) return "";
    return text.split(/\r?\n/).filter(line => line.trim()).map(line => {
      const parts = line.trim().split(/\s*(?:->|→|>)\s*/);
      return parts.map((part, index) => index
        ? `<div class="note-step"><span aria-hidden="true">→</span><p class="note-text">${esc(part)}</p></div>`
        : `<p class="note-text">${esc(part)}</p>`).join("");
    }).join("");
  }

  function notesMarkup(item) {
    const percussion = model.settings.noteMode === "percussion";
    const text = percussion ? item.percussionNotes : item.notes;
    const cues = percussion ? item.percussionCues : item.cues;
    const groups = M.cueFields.map(([key, label]) => cues?.[key]
      ? `<div class="note-group"><p class="eyebrow">${label}</p>${noteParts(cues[key])}</div>` : "").filter(Boolean);
    if (text?.trim()) groups.push(`<div class="note-group">${groups.length ? '<p class="eyebrow">Øvrig notat</p>' : ""}${noteParts(text)}</div>`);
    return groups.join("") || empty(percussion
      ? "Ingen perkusjonsnotater for denne låten."
      : "Ingen trommesettnotater for denne låten.");
  }

  function notesPanel(item, { stage = false } = {}) {
    const visible = model.settings.sceneNotesVisible;
    const instrument = `<div class="note-modes" role="group" aria-label="Instrument for spillenotater">
        ${Object.entries(noteModes).map(([key, label]) => button("note-mode", label, {
          style: "quiet", data: `${idData(key)} ${pressed(model.settings.noteMode === key)}`
        })).join("")}
      </div>`;
    const songData = `data-note-song="${esc(item.id)}"`;
    const notes = `<div class="notes-body" data-note-content ${stage ? 'id="scene-notes"' : ""} ${stage && !visible ? "hidden" : ""}>${notesMarkup(item)}</div>`;
    if (!stage) return `<div class="song-notes" ${songData}>${instrument}${notes}</div>`;

    return `<section class="stage-notes song-notes" ${songData} aria-labelledby="notes-label">
      <h2 class="sr-only" id="notes-label">Spillenotater</h2>
      <div class="notes-head">
        ${instrument}
        <button class="button quiet" id="scene-notes-toggle" type="button" data-action="notes" aria-expanded="${visible}" aria-controls="scene-notes">
          ${icon("note")}<span id="scene-notes-toggle-label">${visible ? "Skjul" : "Vis notater"}</span>
        </button>
      </div>
      ${notes}
    </section>`;
  }

  function updateNoteMode() {
    document.querySelectorAll("#view [data-note-song], #modal[open] [data-note-song]").forEach(panel => {
      const item = song(panel.dataset.noteSong);
      if (!item) return;
      panel.querySelectorAll('[data-action="note-mode"]').forEach(control => {
        control.setAttribute("aria-pressed", String(control.dataset.id === model.settings.noteMode));
      });
      panel.querySelector("[data-note-content]").innerHTML = notesMarkup(item);
    });
  }

  function updateStageNotesVisibility() {
    const panel = $("scene-notes");
    if (!panel) return;
    const visible = model.settings.sceneNotesVisible;
    panel.hidden = !visible;
    $("scene-notes-toggle").setAttribute("aria-expanded", String(visible));
    $("scene-notes-toggle-label").textContent = visible ? "Skjul" : "Vis notater";
  }

  function tagsMarkup(item) {
    const energy = item.energy ? `<span class="tag energy">Energi · ${esc(item.energy)}</span>` : "";
    return item.tags.length || energy ? `<div class="song-tags">${energy}${item.tags.map(tag => `<span class="tag">${esc(tag)}</span>`).join("")}</div>` : "";
  }

  function cueMarkup(item) {
    const cue = M.startCue(item.start);
    return `<div class="signal ${cue ? `cue-${cue.tone}` : ""}">
      <span class="eyebrow">${icon(cue?.icon || "flag")} Startsignal</span>
      <strong>${esc(cue?.label || "Ikke satt")}</strong>
    </div>`;
  }

  function tempoMarkup(item) {
    if (!item.bpm) {
      return `<div class="signal"><span class="eyebrow">${icon("pulse")} Tempo</span><strong>– BPM</strong></div>`;
    }
    return `<button class="signal tempo" id="stage-pulse" data-action="pulse" type="button">
      <span class="eyebrow">${icon("pulse")} Tempo</span>
      <span class="tempo-readout"><strong id="stage-bpm"></strong><small>BPM</small></span>
      <span class="tempo-status" id="stage-pulse-status"></span>
    </button>
    <button class="signal half-tempo" id="stage-half-tempo" data-action="half-tempo" type="button">
      <span>Halvtempo</span><span class="tempo-status" id="stage-half-status" aria-hidden="true"></span>
    </button>
    <div class="pulse-dots" id="stage-pulse-dots" aria-hidden="true" hidden><i></i><i></i><i></i><i></i></div>`;
  }

  function updateStageMetronome(item) {
    if (item?.bpm) {
      const half = model.settings.pulseHalf;
      const bpm = (half ? item.bpm / 2 : item.bpm).toLocaleString("nb", { maximumFractionDigits: 3, useGrouping: false });
      const control = $("stage-pulse");
      control.setAttribute("aria-pressed", String(pulseEnabled));
      control.setAttribute("aria-label", `${pulseEnabled ? "Stopp" : "Start"} visuell puls · ${bpm} BPM`);
      $("stage-bpm").textContent = bpm;
      $("stage-pulse-status").textContent = pulseEnabled ? "Puls på" : "Puls av";
      $("stage-half-tempo").setAttribute("aria-pressed", String(half));
      $("stage-half-status").textContent = half ? "På" : "Av";
      $("stage-pulse-dots").hidden = !pulseEnabled;
    }
    syncPulse(item);
  }

  const drumPattern = `<svg class="hero-pattern" viewBox="0 0 350 300" fill="none" aria-hidden="true">
    <g stroke="currentColor"><circle cx="186" cy="150" r="135" stroke-dasharray="2 8"/>
    <circle cx="186" cy="150" r="115"/><circle cx="186" cy="150" r="89"/><circle cx="186" cy="150" r="54"/>
    <circle cx="186" cy="150" r="15"/><path d="M186 1v298M34 150h304" stroke-dasharray="1 9"/>
    <path d="m129 99 101 91m14-93-101 92" stroke-width="3" stroke-linecap="round"/>
    <circle cx="71" cy="150" r="4" fill="currentColor"/><circle cx="186" cy="61" r="3" fill="currentColor"/></g>
  </svg>`;

  function stageHero(stage) {
    const noList = stage.fixed && !stage.set.items.length;
    const exhausted = stage.fixed ? !stage.pending.length : !projectSongs().some(item => !session().played.includes(item.id));
    const pause = stage.item?.type === "pause";
    let kicker = "På scenen", title, text, action = "";
    if (pause) {
      kicker = "Pause i settlisten";
      title = stage.item.label;
      const nextSong = stage.later.find(item => item.type === "song");
      text = nextSong ? `Neste låt er ${song(nextSong.songId).title}.` : "Fortsett når dere er klare.";
    } else if (noList) {
      kicker = "Før dere går på";
      title = "Settlisten er tom";
      text = "Legg inn låtene i den rekkefølgen dere skal spille dem.";
      action = link("settlister", "Bygg settliste", "plus", "primary");
    } else if (exhausted) {
      title = stage.fixed ? "Settlisten er spilt" : "Alle låtene er spilt";
      text = stage.fixed ? "Alle punktene i settlisten er ferdige. Historikken ligger i repertoaret." : "Du finner låtene og spillehistorikken i repertoaret.";
      action = link("repertoar", "Se repertoaret", "list", "quiet");
    } else if (stage.fixed) {
      title = stage.run.hold ? "Klar for neste?" : "Låter gjenstår";
      text = stage.run.hold ? "Gå videre når dere er klare." : "Du kan hente opp en tidligere låt som står igjen i settlisten.";
    } else {
      kicker = "Frie forslag";
      title = "Hva spiller vi nå?";
      text = "Velg et forslag fra køen eller finn låten i repertoaret.";
      action = button("find-song", "Finn låt", { symbol: "search", style: "primary" });
    }
    return `<article class="stage-main stage-hero">${drumPattern}<div class="hero-content">
      <p class="eyebrow stage-label">${icon(pause ? "pause" : "drum")} ${kicker}</p>
      <h1 class="hero-title" id="stage-title" tabindex="-1">${esc(title)}</h1>
      <p>${esc(text)}</p>${action}
    </div></article>`;
  }

  function stageCard(stage) {
    const item = stage.song;
    if (!item) return stageHero(stage);
    const songItems = stage.fixed ? stage.set.items.filter(row => row.type === "song") : [];
    const slot = stage.fixed ? `${songItems.indexOf(stage.item) + 1} / ${songItems.length}` : "FRI";
    return `<article id="playing-song" class="stage-main ${stage.review ? "review" : ""}">
      <div class="stage-card-head">
        <p class="eyebrow stage-label ${stage.review ? "review-label" : ""}"><span class="live-dot"></span>${stage.review ? "Tilbakeblikk" : "Spilles nå"}</p>
        <span class="slot-label">${slot}</span>
      </div>
      <h1 id="stage-title" tabindex="-1" class="song-title ${item.title.length > 29 ? "long" : ""}">${esc(item.title)}</h1>
      <p class="song-artist">${esc(item.artist)}</p>
      <div class="signal-grid ${item.bpm ? "has-tempo" : ""}">
        ${cueMarkup(item)}${tempoMarkup(item)}
      </div>
      ${notesPanel(item, { stage: true })}
      ${tagsMarkup(item)}
    </article>`;
  }

  function fixedQueueItem(entry, stage, index) {
    const pause = entry.type === "pause";
    const item = pause ? null : song(entry.songId);
    const number = stage.set.items.slice(0, stage.set.items.indexOf(entry) + 1).filter(row => row.type === "song").length;
    return `<li><button type="button" data-action="pick-fixed" ${idData(entry.entryId)}
      class="queue-item ${index === 0 ? "is-next" : ""} ${pause ? "is-pause" : ""}">
      <span class="queue-index" aria-hidden="true">${pause ? icon("pause") : String(number).padStart(2, "0")}</span>
      <span class="queue-name"><strong>${esc(pause ? entry.label : item.title)}</strong>
      <small>${esc(pause ? "Pause" : item.artist)}</small></span>
      <span class="queue-side" aria-hidden="true">${item?.bpm ? `${item.bpm} BPM` : icon("chevron")}</span>
    </button></li>`;
  }

  function freeSuggestions() {
    if (!suggestions) suggestions = M.suggest(projectSongs(), model.songs, session(), freeSong()?.id);
    return suggestions;
  }

  function freeQueueItem(pick, index) {
    const item = pick.song;
    return `<li><button type="button" class="queue-item" data-action="pick-free" ${idData(item.id)}>
      <span class="queue-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
      <span class="queue-name"><strong>${esc(item.title)}</strong><small>${esc([item.artist, ...pick.reasons].join(" · "))}</small></span>
      <span class="queue-side" aria-hidden="true">${item.bpm ? `${item.bpm} BPM` : icon("chevron")}</span>
    </button></li>`;
  }

  function stageQueue(stage) {
    const current = session();
    const setNo = model.state.setNoByProject[project().id] || 1;
    const setStart = model.state.setStartsByProject[project().id]?.[setNo - 1] || 0;
    const count = stage.fixed ? stage.set.items.filter(entry => entry.type === "song").length : projectSongs().length;
    const played = stage.fixed
      ? stage.set.items.filter(entry => entry.type === "song" && stage.run.done.includes(entry.entryId)).length
      : projectSongs().filter(item => current.played.includes(item.id)).length;
    const queued = stage.fixed ? stage.later.slice(0, 3).map((item, index) => fixedQueueItem(item, stage, index))
      : freeSuggestions().map(freeQueueItem);
    const emptyQueue = stage.fixed
      ? (stage.set.items.length ? "Ingen flere punkter etter denne plassen." : "Låter og pauser dukker opp her når du fyller settlisten.")
      : "Ingen forslag akkurat nå.";
    const recent = current.history.slice(-5).reverse().map(song).filter(Boolean);
    return `<aside class="queue-panel" aria-labelledby="queue-title">
      <div class="queue-header"><h2 id="queue-title">${stage.fixed ? "I kø" : "Forslag til neste"}</h2>
        ${stage.fixed ? link("settlister", "Hele listen", "list", "quiet") : iconButton("suggest", "Tre nye forslag", "refresh", { disabled: !queued.length })}
      </div>
      <div class="progress-block">
        <div class="progress-meta"><span>Sett ${setNo} · ${Math.max(0, current.history.length - setStart)} spilt</span><span>${played} / ${count} låter</span></div>
        ${count ? `<progress aria-label="Låter spilt" max="${count}" value="${played}"></progress>` : ""}
      </div>
      ${queued.length ? `<ol class="queue-list">${queued.join("")}</ol>` : empty(emptyQueue)}
      ${recent.length ? `<details class="recent-fold"><summary>Sist spilt</summary><ul class="flat-list">${recent.map(item =>
        `<li>${button("song-detail", item.title, { symbol: "music", style: "quiet", data: idData(item.id) })}</li>`).join("")}</ul></details>` : ""}
    </aside>`;
  }

  function dockMarkup(stage) {
    const item = stage.fixed ? stage.active : stage.current;
    if (!item && !(stage.fixed && stage.pending.length) && !stage.review) return "";
    const previousId = previous(stage);
    const upcoming = stage.fixed ? stage.later[0] || (!item ? stage.pending[0] : null) : null;
    const nextTitle = upcoming ? (upcoming.type === "pause" ? upcoming.label : song(upcoming.songId)?.title) : "";
    let action = "Spilt · neste";
    if (stage.review) action = "Tilbake til nå";
    else if (item?.type === "pause") action = "Fortsett etter pause";
    else if (!item) action = "Gå til neste";
    else if (!stage.fixed || !model.settings.autoNext) action = "Marker som spilt";
    else if (upcoming?.type === "pause") action = "Spilt · til pause";
    else if (!upcoming) action = "Marker som spilt";
    const caption = stage.review ? ["Tilbakeblikk", "Plassen i settlisten beholdes"]
      : nextTitle ? ["Neste", nextTitle]
      : stage.fixed ? ["Fast settliste", stage.pending.length > 1 ? "Tidligere låter gjenstår" : "Siste punkt"]
      : ["Frie forslag", "Velg neste låt etterpå"];
    return `<div class="dock-inner">
      ${button("previous", "Forrige", { symbol: "arrowLeft", style: "dock-back", data: previousId ? idData(previousId) : "", disabled: !previousId })}
      <p class="dock-caption"><b>${caption[0]}</b><span>${esc(caption[1])}</span></p>
      ${button("advance", action, { symbol: item && !stage.review && item.type !== "pause" ? "check" : "arrowRight", style: "primary" })}
    </div>`;
  }

  function renderStage() {
    const stage = stageState();
    const context = stage.fixed ? `${project().name} / ${stage.set.name}` : project().name;
    const canFind = stage.fixed ? stage.set.items.some(item => item.type === "song") : projectSongs().length > 0;
    $("view").innerHTML = `<div class="stage-top">
      <div class="stage-context">
        <button type="button" class="context-pill" data-action="context" aria-label="${esc(`Prosjekt og spillemodus · ${context} · ${modeName[model.settings.mode]}`)}">
          ${icon("folder")} <span class="context-text"><strong>${esc(context)}</strong><small class="mode-label">${modeName[model.settings.mode]}</small></span> ${icon("chevronDown")}
        </button>
      </div>
      <div class="stage-tools">
        ${iconButton("wake", wakeLock ? "Skjermen holdes våken" : "Skjerm og skjermlås", "screen", { style: wakeLock ? "wake-on" : "" })}
        ${button("find-song", "Finn låt", { symbol: "search", style: "quiet", disabled: !canFind })}
      </div>
    </div>
    <div class="stage-layout">${stageCard(stage)}${stageQueue(stage)}</div>`;
    const dock = dockMarkup(stage);
    $("dock").innerHTML = dock;
    $("dock").hidden = !dock;
    root.classList.toggle("has-dock", Boolean(dock));
    updateStageMetronome(stage.song);
  }

  function projectSelect(label = "Prosjekt", { editor = false } = {}) {
    const current = editor ? model.editorProject : project().id;
    const options = (editor ? [{ id: "all", name: "Alle prosjekter" }] : []).concat(model.projects);
    return `<label class="field-label">${label}<select data-control="${editor ? "editor-project" : "project"}">
      ${options.map(p => `<option value="${esc(p.id)}"${p.id === current ? " selected" : ""}>${esc(p.name)}</option>`).join("")}
    </select></label>`;
  }

  function setOptions() {
    const current = setlist();
    return project().setlists.map(item => `<option value="${esc(item.id)}"${item.id === current.id ? " selected" : ""}>${esc(item.name)}</option>`).join("");
  }

  function setSelect() {
    return `<label class="field-label">Settliste<select data-control="setlist">${setOptions()}</select></label>`;
  }

  function updateSetlistOptions(scope) {
    const select = scope.querySelector('[data-control="setlist"]');
    if (select) select.innerHTML = setOptions();
  }

  function pageHead(kicker, title, description, action = "") {
    return `<header class="page-head"><div>
      <p class="eyebrow">${esc(kicker)}</p><h1 tabindex="-1" id="page-title">${esc(title)}</h1>
      <p class="help-text">${esc(description)}</p></div>${action}
    </header>`;
  }

  function setlistItem(item, index, set, run, activeId) {
    const pause = item.type === "pause";
    const current = song(item.songId);
    const label = pause ? item.label : current.title;
    const done = run.done.includes(item.entryId);
    const metadata = pause ? "Pause i settlisten" : [current.artist, current.bpm ? `${current.bpm} BPM` : "", M.startCue(current.start)?.label].filter(Boolean).join(" · ");
    return `<li class="setlist-item ${item.entryId === activeId ? "is-active" : ""} ${done ? "is-done" : ""} ${pause ? "is-pause" : ""}">
      <button type="button" class="list-button" data-action="pick-fixed" ${idData(item.entryId)} aria-label="${esc(`Vis ${label} på scenen`)}">
        <span class="queue-index" aria-hidden="true">${iconOrNumber(done, pause, index)}</span>
        <span class="list-name"><strong>${esc(label)}</strong><small>${esc(metadata)}${done ? " · Spilt" : ""}</small></span>
      </button>
      <div class="setlist-item-actions">
        ${iconButton("move-up", `Flytt ${label} opp`, "up", { data: idData(item.entryId), disabled: index === 0 })}
        ${iconButton("move-down", `Flytt ${label} ned`, "down", { data: idData(item.entryId), disabled: index === set.items.length - 1 })}
        ${iconButton("remove-entry", `Fjern ${label}`, "close", { data: idData(item.entryId) })}
      </div>
    </li>`;
  }

  function iconOrNumber(done, pause, index) {
    return done ? icon("check") : pause ? icon("pause") : String(index + 1).padStart(2, "0");
  }

  function renderSetlists() {
    $("view").innerHTML = `<div id="setlist-head"></div>
      <section class="panel" aria-labelledby="pick-setlist">
        <div class="section-heading"><h2 id="pick-setlist">Velg settliste</h2></div>
        <div class="list-toolbar">${projectSelect()}${setSelect()}</div>
        <div class="button-group setlist-actions">
          ${button("new-list", "Ny settliste", { symbol: "plus", style: "quiet" })}
          ${button("rename-list", "Gi nytt navn", { symbol: "edit", style: "quiet" })}
          ${button("clear-list", "Tøm liste", { style: "quiet", data: 'id="setlist-clear"' })}
        </div>
      </section>
      <section class="panel" id="setlist-content" aria-labelledby="ordered-list"></section>`;
    renderSetlistContent();
  }

  function renderSetlistContent() {
    const { set, run, active } = fixedSelection();
    const total = set.items.filter(item => item.type === "song").length;
    const headerAction = set.items.length ? button("use-setlist", "Vis på scenen", { symbol: "play", style: "primary" }) : "";
    $("setlist-head").innerHTML = pageHead("Før konserten", "Settlister", "Bygg spillekøen og legg inn pauser der de hører hjemme.", headerAction);
    $("setlist-clear").hidden = !set.items.length;
    $("setlist-content").innerHTML = `<div class="section-heading"><div><p class="eyebrow">${total} ${total === 1 ? "låt" : "låter"} i spillekøen</p><h2 id="ordered-list">${esc(set.name)}</h2></div>
          <div class="button-group">
            ${button("add-song", "Legg til låt", { symbol: "plus", style: "primary", disabled: !projectSongs().length })}
            ${button("add-pause", "Legg til pause", { symbol: "pause", style: "quiet" })}
          </div>
        </div>
        ${set.items.length ? `<ol class="setlist-items">${set.items.map((item, i) => setlistItem(item, i, set, run, active?.entryId)).join("")}</ol>`
          : empty(projectSongs().length ? "Legg til den første låten. Du kan flytte låter og pauser med pilknappene." : "Prosjektet har ingen låter. Legg til låter fra repertoarredigeringen.")}`;
  }

  function searchInput(id, label, value = "", { showLabel = false } = {}) {
    const field = `<div class="search-field">${icon("search")}
      ${showLabel ? "" : `<label class="sr-only" for="${id}">${label}</label>`}
      <input id="${id}" type="search" value="${esc(value)}" placeholder="${showLabel ? "Låt, artist, BPM …" : "Søk på låt, artist, tempo eller notat"}" autocomplete="off">
    </div>`;
    return showLabel ? `<div class="field-label"><label for="${id}">${label}</label>${field}</div>` : field;
  }

  const fixedFilters = [
    ["all", "Alle"], ["favorite", "Favoritter"], ["unplayed", "Uspilt"], ["played", "Spilt"],
    ["tell", "Tell opp"], ["slow", "Under 90 BPM"], ["mid", "90–119 BPM"], ["fast", "120+ BPM"]
  ];
  const suggestedTags = ["rock", "blues", "dans", "singalong", "rolig"];

  function libraryFilters() {
    const tags = new Set([...suggestedTags, ...projectSongs().flatMap(item => item.tags)]);
    return fixedFilters.concat([...tags].map(tag => [`tag:${tag}`, tag[0].toLocaleUpperCase("nb") + tag.slice(1)]));
  }

  function filterSong(item) {
    if (filter === "all") return true;
    if (filter === "favorite") return session().favorites.includes(item.id);
    if (filter === "unplayed") return !session().played.includes(item.id);
    if (filter === "played") return session().played.includes(item.id);
    if (filter === "tell") return M.startCue(item.start)?.tone === "count";
    if (filter === "slow") return item.bpm && item.bpm < 90;
    if (filter === "mid") return item.bpm >= 90 && item.bpm < 120;
    if (filter === "fast") return item.bpm >= 120;
    const tag = filter.slice(4);
    return item.tags.includes(tag) || item.energy === tag;
  }

  function repertoireRow(item, editor = false) {
    const played = !editor && session().played.includes(item.id);
    const favorite = !editor && session().favorites.includes(item.id);
    const meta = [item.artist, M.startCue(item.start)?.label, played ? "Spilt" : ""].filter(Boolean).join(" · ");
    return `<li class="library-item ${played ? "is-done" : ""}">
      <button type="button" class="list-button" data-action="${editor ? "edit-song" : "song-detail"}" ${idData(item.id)}>
        <span class="list-name"><strong>${esc(item.title)}</strong><small>${esc(meta)}</small></span>
        <span class="queue-side">${item.bpm ? `${item.bpm} BPM` : "– BPM"}</span>
      </button>
      ${editor ? iconButton("edit-song", `Rediger ${item.title}`, "edit", { data: idData(item.id) })
        : iconButton("favorite", `${favorite ? "Fjern favoritt" : "Gjør til favoritt"} · ${item.title}`, "star", { data: `${idData(item.id)} ${pressed(favorite)}` })}
    </li>`;
  }

  function renderLibraryList() {
    const list = M.songSearch(projectSongs(), libraryQuery).filter(filterSong);
    $("library-count").textContent = `${list.length} av ${projectSongs().length} låter`;
    $("library-results").innerHTML = list.length ? `<ul class="library-list">${list.map(item => repertoireRow(item)).join("")}</ul>` : empty("Ingen låter matcher søket og filteret.");
    document.querySelectorAll(".chip[data-action='filter']").forEach(element => element.setAttribute("aria-pressed", String(element.dataset.id === filter)));
  }

  function renderLibrary() {
    $("view").innerHTML = `${pageHead("Låtboken", "Repertoar", "Finn en låt, se spillenotatene eller sjekk hva som er spilt.", link("editor", "Rediger repertoar", "edit", "quiet"))}
      <div class="panel">
        <div class="search-tools">${searchInput("library-search", "Søk", libraryQuery, { showLabel: true })}${projectSelect()}</div>
        <div id="library-content"></div>
      </div>`;
    renderLibraryContent();
  }

  function renderLibraryContent() {
    const recent = session().history.slice(-5).reverse().map(song).filter(Boolean);
    $("library-content").innerHTML = `<div class="chips" aria-label="Filtrer repertoaret">${libraryFilters().map(([key, label]) =>
          button("filter", label, { style: "chip quiet", data: `${idData(key)} ${pressed(filter === key)}` })).join("")}</div>
        <div class="section-heading"><h2>Låter</h2><span class="section-count" id="library-count" role="status"></span></div>
        <div id="library-results"></div>
        ${recent.length ? `<details class="recent-fold"><summary>Sist spilt</summary><ul class="flat-list">${recent.map(item => `<li>${button("song-detail", item.title, { symbol: "music", style: "quiet", data: idData(item.id) })}</li>`).join("")}</ul></details>` : ""}`;
    renderLibraryList();
  }

  function openDialog(title, content, type, focusId) {
    if (!modal.open) modalOpener = document.activeElement;
    modalType = type;
    $("modal-title").textContent = title;
    $("modal-content").innerHTML = `<div class="modal-content">${content}<p class="form-error" id="dialog-message" role="status"></p></div>`;
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
    const focus = focusId ? $(focusId) : modal.querySelector(".modal-header button");
    focus?.focus();
  }

  function closeDialog() {
    if (modal.open) modal.close();
  }

  function formError(message) {
    $("dialog-message").textContent = message;
  }

  function confirmDialog(title, description, label, callback, style = "primary") {
    openDialog(title, `<p class="help-text">${esc(description)}</p>
      <form id="confirm-form" class="dialog-actions">
        ${button("close-dialog", "Avbryt", { style: "quiet" })}
        <button type="submit" class="button ${style}">${esc(label)}</button>
      </form>`, "confirm");
    $("confirm-form").onsubmit = event => {
      event.preventDefault();
      const result = callback();
      if (result !== false) closeDialog();
    };
  }

  function nameDialog(kind) {
    const isPause = kind === "pause";
    const isRename = kind === "rename";
    const title = isPause ? "Legg til pause" : isRename ? "Gi settlisten nytt navn" : "Ny settliste";
    const label = isPause ? "Navn på pausen" : "Navn på settlisten";
    const value = isPause ? "Settpause" : isRename ? setlist().name : "";
    openDialog(title, `<form id="name-form">
      <label class="field-label">${label}<input id="name-value" required maxlength="100" value="${esc(value)}"></label>
      <div class="dialog-actions">${button("close-dialog", "Avbryt", { style: "quiet" })}
      <button type="submit" class="button primary">${isPause ? "Legg til pause" : "Lagre settliste"}</button></div>
    </form>`, "name", "name-value");
    if (value) $("name-value").select();
    $("name-form").onsubmit = event => {
      event.preventDefault();
      const name = $("name-value").value.trim();
      if (!name) return formError("Skriv inn et navn.");
      if (!commit(next => {
        const p = project(next);
        if (isPause) setlist(next).items.push({ type: "pause", label: name, entryId: M.newId("pause") });
        else if (isRename) setlist(next).name = name;
        else {
          const id = M.newId("set");
          p.setlists.push({ id, name, items: [] });
          next.state.activeSetlistByProject[p.id] = id;
        }
        next.dirty = true;
      }, title)) return;
      reviewId = null;
      closeDialog();
      render();
      notify(isPause ? "Pause lagt til" : "Settlisten er lagret", { canUndo: true });
    };
  }

  function editEntry(id, action) {
    const set = setlist();
    const index = set.items.findIndex(item => item.entryId === id);
    const newIndex = action === "move-up" ? index - 1 : index + 1;
    const remove = action === "remove-entry";
    if (index < 0 || (!remove && (newIndex < 0 || newIndex >= set.items.length))) return;
    if (!commit(next => {
      const list = setlist(next).items;
      if (remove) {
        list.splice(index, 1);
        const run = runFor(next);
        if (run.active === id) run.active = null;
        if (run.last === id) run.last = null;
        run.done = run.done.filter(value => value !== id);
      } else [list[index], list[newIndex]] = [list[newIndex], list[index]];
      next.dirty = true;
    }, remove ? "Fjern punkt" : "Flytt punkt")) return;
    render();
    if (remove) {
      document.querySelector('[data-action="add-song"]')?.focus({ preventScroll: true });
      notify("Fjernet fra settlisten", { canUndo: true });
    } else {
      const control = document.querySelector(`[data-action="${action}"][data-id="${CSS.escape(id)}"]:not(:disabled)`)
        || document.querySelector(`[data-action="pick-fixed"][data-id="${CSS.escape(id)}"]`);
      control?.focus({ preventScroll: true });
      announce(`Flyttet til plass ${newIndex + 1}`);
    }
  }

  function clearList() {
    confirmDialog("Tøm settlisten?", `Alle låter og pauser fjernes fra «${setlist().name}». Låtene blir værende i repertoaret.`, "Tøm settlisten", () => {
      if (!commit(next => {
        setlist(next).items = [];
        delete next.state.setRuns[project(next).id]?.[setlist(next).id];
        next.dirty = true;
      }, "Tøm settliste")) return false;
      reviewId = null;
      render();
      notify("Settlisten er tømt", { canUndo: true });
      return true;
    }, "danger");
  }

  function findRow(item, action, dataId, metadata, position, selected = false) {
    return `<button type="button" class="list-button" data-action="${action}" ${idData(dataId)}
      ${selected ? 'aria-current="true"' : ""}>
      <span class="queue-index" aria-hidden="true">${position || icon(action === "add-song-result" ? "plus" : "music")}</span>
      <span class="list-name"><strong>${esc(item.title)}</strong><small>${esc(metadata)}</small></span>
      <span class="queue-side">${item.bpm ? `${item.bpm} BPM` : icon("chevron")}</span>
    </button>`;
  }

  function showFind(kind) {
    const add = kind === "add";
    const fixed = !add && model.settings.mode === "fixed";
    const title = add ? "Legg låter i settlisten" : fixed ? "Finn låt i settlisten" : "Finn låt i repertoaret";
    const subtitle = add ? `Trykk på en låt for å legge den til i «${setlist().name}».`
      : fixed ? "Velg låten du vil hente opp på scenen." : `Søk i repertoaret til ${project().name}.`;
    openDialog(title, `<p class="help-text">${esc(subtitle)}</p>
      <form id="find-form">${searchInput("find-input", title)}</form><div id="find-results" class="dialog-search-results"></div>`, "find", "find-input");

    function results() {
      const query = $("find-input").value;
      const stage = fixed ? fixedSelection() : null;
      let markup;
      if (fixed) {
        const matches = new Set(M.songSearch(model.songs, query).map(item => item.id));
        markup = stage.set.items.filter(row => row.type === "song").map((row, i) => ({ row, number: i + 1 }))
          .filter(({ row }) => matches.has(row.songId)).map(({ row, number }) => {
            const item = song(row.songId);
            const meta = [item.artist, M.startCue(item.start)?.label, stage.run.done.includes(row.entryId) ? "Spilt" : ""].filter(Boolean).join(" · ");
            return findRow(item, "pick-fixed", row.entryId, meta, String(number).padStart(2, "0"), stage.active?.entryId === row.entryId);
          });
      } else {
        markup = M.songSearch(projectSongs(), query).map(item => {
          const copies = add ? setlist().items.filter(row => row.songId === item.id).length : 0;
          const meta = [item.artist, M.startCue(item.start)?.label, copies ? `I listen × ${copies}` : "",
            !add && session().played.includes(item.id) ? "Spilt" : ""].filter(Boolean).join(" · ");
          return findRow(item, add ? "add-song-result" : "pick-free", item.id, meta);
        });
      }
      $("find-results").innerHTML = markup.join("") || empty("Ingen treff.");
    }
    $("find-input").addEventListener("input", results);
    $("find-form").onsubmit = event => {
      event.preventDefault();
      const buttons = $("find-results").querySelectorAll("button");
      if (buttons.length === 1) buttons[0].click();
      else buttons[0]?.focus();
    };
    results();
    $("find-results").refresh = results;
  }

  function addSongToList(id) {
    const item = song(id);
    if (!item?.projects.includes(project().id)) return;
    if (!commit(next => {
      setlist(next).items.push({ type: "song", songId: id, entryId: M.newId("song") });
      next.dirty = true;
    }, "Legg til låt")) return;
    render();
    if ($("find-input")) {
      $("find-input").value = "";
      $("find-results").refresh();
      $("find-input").focus();
      $("dialog-message").textContent = `${item.title} lagt til`;
      modal.scrollTop = 0;
    }
  }

  function showSong(id) {
    const item = song(id);
    if (!item) return;
    const played = session().played.includes(item.id);
    const rows = setlist().items.filter(row => row.type === "song" && row.songId === item.id);
    const matching = rows.find(row => !runFor().done.includes(row.entryId)) || rows[0];
    const stageAction = model.settings.mode === "fixed" && matching
      ? button("pick-fixed", "Vis på scenen", { style: "primary", symbol: "play", data: idData(matching.entryId) })
      : item.projects.includes(project().id)
        ? button("pick-free", model.settings.mode === "fixed" ? "Vis med frie forslag" : "Vis på scenen", { style: "primary", symbol: "play", data: idData(item.id) }) : "";
    openDialog(item.title, `<p class="song-artist">${esc(item.artist)}</p>
      <div class="signal-grid">${cueMarkup(item)}
        <div class="signal"><span class="eyebrow">${icon("pulse")} Tempo</span><strong>${item.bpm ? `${item.bpm} BPM` : "– BPM"}</strong></div></div>
      ${notesPanel(item)}${tagsMarkup(item)}
      <div class="dialog-actions">
        ${played ? button("restore-song", "Sett som uspilt", { symbol: "undo", style: "quiet", data: idData(item.id) }) : ""}
        ${stageAction}
      </div>`, "song-detail");
  }

  function showContext() {
    const mode = model.settings.mode;
    openDialog("Prosjekt og spillemodus", `<div class="list-toolbar">${projectSelect()}${mode === "fixed" ? setSelect() : ""}</div>
      <div class="mode-choices" aria-label="Spillemodus">
        ${[["fixed", "list", "Følg den planlagte køen med låter og pauser."],
          ["free", "shuffle", "Få tre forslag basert på det dere nettopp spilte."]].map(([key, symbol, description]) => `
          <button class="mode-choice" type="button" data-action="choose-mode" ${idData(key)} ${pressed(mode === key)}>
            ${icon(symbol)}<span class="list-name"><strong>${modeName[key]}</strong><small>${description}</small></span>
            ${icon(mode === key ? "check" : "chevron")}
          </button>`).join("")}
      </div>`, "context");
  }

  function toggleRow(key, label) {
    return `<label class="toggle-row">${esc(label)}<input type="checkbox" data-setting="${key}"${check(model.settings[key])}></label>`;
  }

  function filePick(id, label, style = "quiet") {
    return `${button("pick-file", label, { data: idData(id), style })}
      <input class="file-input" type="file" accept=".json,application/json" tabindex="-1" id="file-${id}" data-file="${id}">`;
  }

  function wakeStatus() {
    if (!("wakeLock" in navigator)) return "Denne nettleseren støtter ikke skjermlås fra appen.";
    if (!model.settings.wakeEnabled) return "Skjermen følger telefonens vanlige skjermlås.";
    return wakeLock ? "Skjermen holdes våken." : "Skjermen holdes våken når nettleseren tillater det på scenen.";
  }

  function showSettings(wakeOnly = false) {
    const showWake = `<section class="settings-section">
      <h3>På scenen</h3>
      ${toggleRow("wakeEnabled", "Hold skjermen våken")}
      <p class="help-text" id="wake-state">${wakeStatus()}</p>
      ${wakeOnly ? "" : toggleRow("autoNext", "Gå videre automatisk når en låt er spilt")}
      ${wakeOnly ? "" : toggleRow("sceneNotesVisible", "Vis spillenotater")}
    </section>`;
    const rest = `<section class="settings-section">
      <h3>Visuell puls</h3>
      ${toggleRow("pulseHalf", "Halvtempo")}${toggleRow("pulseAccent", "Marker første slag i 4/4")}
    </section>
    <section class="settings-section">
      <h3>Utseende</h3>
      <label class="field-label">Tema<select data-control="theme"><option value="dark"${model.settings.theme === "dark" ? " selected" : ""}>Mørkt</option><option value="light"${model.settings.theme === "light" ? " selected" : ""}>Lyst</option></select></label>
    </section>
    <section class="settings-section">
      <h3>Konserten</h3>
      <p class="help-text">${session().history.length} spilt totalt i ${esc(project().name)}.</p>
      <div class="button-group">
        ${button("new-set", "Start nytt sett", { symbol: "plus", style: "quiet" })}
        ${button("undo", undo.length ? `Angre · ${undo.at(-1).label}` : "Angre siste", { symbol: "undo", style: "quiet", disabled: !undo.length })}
        ${button("reset-night", "Nullstill kvelden", { style: "danger" })}
      </div>
    </section>
    <section class="settings-section">
      <h3>Appversjon ${version}${beta ? " · Beta" : ""}</h3>
      <p class="help-text" id="update-status" role="status">${esc(updateStatus.message)}</p>
      <div class="button-group">
        ${button("check-update", "Se etter appoppdatering", { symbol: "refresh", style: "quiet" })}
        ${button("apply-update", "Installer oppdatering", { style: "primary" })}
      </div>
    </section>
    <section class="settings-section">
      <h3>Data og sikkerhetskopi</h3>
      <p class="help-text" id="data-state">${esc(datasetStatus())}</p>
      <div class="button-group">
        ${button("reload-data", "Hent publiserte data", { symbol: "refresh", style: "quiet", disabled: standalone })}
        ${button("export-backup", "Last ned sikkerhetskopi", { style: "quiet" })}
        ${filePick("backup", "Gjenopprett sikkerhetskopi")}
      </div>
    </section>`;
    openDialog(wakeOnly ? "Skjerm og skjermlås" : "Innstillinger", showWake + (wakeOnly ? "" : rest), wakeOnly ? "wake" : "settings");
    renderUpdate();
    syncWake();
  }

  function datasetStatus() {
    return [model.dirty ? "Lokale endringer" : source, navigator.onLine ? "På nett" : "Frakoblet", !storageAvailable ? "Midlertidig økt" : ""].filter(Boolean).join(" · ");
  }

  function applyTheme() {
    document.documentElement.dataset.theme = model.settings.theme;
    document.querySelector('meta[name="theme-color"]').content = model.settings.theme === "light" ? "#f4f1eb" : "#121318";
  }

  function render() {
    const view = activeView();
    applyTheme();
    document.querySelectorAll("[data-nav]").forEach(link => {
      if (link.dataset.nav === (view === "editor" ? "repertoar" : view)) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (view === "scene") renderStage();
    else {
      $("dock").hidden = true;
      root.classList.remove("has-dock");
      stopPulse();
      if (view === "settlister") renderSetlists();
      else if (view === "repertoar") renderLibrary();
      else renderEditor();
    }
    syncWake();
    renderUpdate();
  }

  function stopPulse() {
    clearInterval(pulseTimer);
    pulseTimer = null;
    pulseKey = null;
    pulseBeat = -1;
    paintPulse();
  }

  function paintPulse() {
    $("view").querySelectorAll(".pulse-dots i").forEach((dot, index) => {
      const active = index === pulseBeat;
      dot.classList.toggle("beat", active);
      dot.classList.toggle("downbeat", active && index === 0 && model.settings.pulseAccent);
    });
  }

  function syncPulse(item) {
    if (!pulseEnabled || !item?.bpm || document.visibilityState === "hidden") return stopPulse();
    const { pulseHalf, pulseAccent } = model.settings;
    const key = [item.id, item.bpm, pulseHalf, pulseAccent].join(":");
    if (key === pulseKey) return paintPulse();
    stopPulse();
    pulseKey = key;
    const interval = 60000 / (pulseHalf ? item.bpm / 2 : item.bpm);
    const tick = () => {
      pulseBeat = (pulseBeat + 1) % 4;
      paintPulse();
    };
    tick();
    pulseTimer = setInterval(tick, interval);
  }

  function updateWakeUI() {
    const control = $("view").querySelector('[data-action="wake"]');
    if (control) {
      const label = wakeLock ? "Skjermen holdes våken" : "Skjerm og skjermlås";
      control.setAttribute("aria-label", label);
      control.title = label;
      control.classList.toggle("wake-on", Boolean(wakeLock));
    }
    if ($("wake-state")) $("wake-state").textContent = wakeStatus();
  }

  function shouldWake() {
    return model.settings.wakeEnabled && activeView() === "scene" && document.visibilityState === "visible";
  }

  async function syncWake() {
    if (!shouldWake()) {
      const current = wakeLock;
      wakeLock = null;
      if (current) await current.release().catch(() => {});
      updateWakeUI();
      return;
    }
    if (!navigator.wakeLock || wakeLock || wakePending) return;
    wakePending = true;
    try {
      const lock = await navigator.wakeLock.request("screen");
      if (!shouldWake()) await lock.release();
      else {
        wakeLock = lock;
        lock.addEventListener("release", () => {
          if (wakeLock === lock) wakeLock = null;
          updateWakeUI();
        }, { once: true });
      }
    } catch {
      // A background tab or low-power mode may prevent the request.
    } finally {
      wakePending = false;
      updateWakeUI();
    }
  }

  function editorProjectRow(p) {
    const count = model.songs.filter(item => item.projects.includes(p.id)).length;
    return `<li class="setlist-item">
      <button class="list-button" type="button" data-action="use-editor-project" ${idData(p.id)}>
        <span class="queue-index">${icon("folder")}</span>
        <span class="list-name"><strong>${esc(p.name)}</strong><small>${count} låter · ${p.setlists.length} settlister</small></span>
      </button>
      <div class="setlist-item-actions">
        ${iconButton("edit-project", `Rediger ${p.name}`, "edit", { data: idData(p.id) })}
        ${iconButton("delete-project", `Slett ${p.name}`, "close", { data: idData(p.id), disabled: model.projects.length < 2 })}
      </div>
    </li>`;
  }

  function renderEditorList() {
    const editingSongs = editorTab === "songs";
    const query = editorQuery.trim();
    let rows, count;
    if (editingSongs) {
      const pool = model.editorProject === "all" ? model.songs : model.songs.filter(item => item.projects.includes(model.editorProject));
      const matches = M.songSearch(pool, query);
      count = `${matches.length} av ${pool.length} låter`;
      rows = matches.length ? `<ul class="library-list">${matches.map(item => repertoireRow(item, true)).join("")}</ul>` : empty("Ingen låter matcher søket.");
    } else {
      const projects = model.projects.filter(p => M.norm(p.name).includes(M.norm(query)));
      count = `${projects.length} prosjekter`;
      rows = projects.length ? `<ul class="setlist-items">${projects.map(editorProjectRow).join("")}</ul>` : empty("Ingen prosjekter matcher søket.");
    }
    $("editor-count").textContent = count;
    $("editor-results").innerHTML = rows;
  }

  function renderEditor() {
    const toolsOpen = $("view").querySelector(".editor-tools")?.open;
    $("view").innerHTML = `${pageHead("Repertoar", "Rediger repertoar", "Vedlikehold låter, startsignaler, notater og bandprosjekter.", link("repertoar", "Til repertoaret", "arrowLeft", "quiet"))}
      ${model.dirty ? '<p class="draft-banner help-text">Lokale endringer er tilgjengelige på denne enheten. Eksporter JSON-filene for å publisere dem.</p>' : ""}
      <section class="panel" aria-label="Låter og prosjekter">
        <div class="section-heading">
          <div class="button-group" aria-label="Velg redigeringsvisning">
            ${button("editor-tab", "Låter", { symbol: "music", style: "quiet", data: `${idData("songs")} ${pressed(editorTab === "songs")}` })}
            ${button("editor-tab", "Prosjekter", { symbol: "folder", style: "quiet", data: `${idData("projects")} ${pressed(editorTab === "projects")}` })}
          </div>
          <div class="button-group">
            ${button("edit-song", "Ny låt", { symbol: "plus", style: "primary" })}
            ${button("edit-project", "Nytt prosjekt", { symbol: "plus", style: "quiet" })}
          </div>
        </div>
        <div class="search-tools">${searchInput("editor-search", "Søk", editorQuery, { showLabel: true })}${editorTab === "songs" ? projectSelect("Prosjekt", { editor: true }) : ""}</div>
        <div class="section-heading"><h2>${editorTab === "songs" ? "Låter" : "Prosjekter"}</h2><span class="section-count" id="editor-count" role="status"></span></div>
        <div id="editor-results"></div>
      </section>
      <details class="panel editor-tools" ${toolsOpen ? "open" : ""}>
        <summary>
          <span class="editor-tools-icon">${icon("folder")}</span>
          <span>Import, eksport og publiserte data</span>
          ${icon("chevronDown")}
        </summary>
        <div class="editor-tools-content">
          <section class="editor-tools-group">
            <h3>Eksport</h3>
            <p class="help-text">Last ned <code>songs.json</code> og <code>projects.json</code> for å publisere dataene.</p>
            <div class="button-group">
              ${button("export-data", "Eksporter alt", { data: idData("all") })}
              ${button("export-data", "Eksporter songs.json", { data: idData("songs"), style: "quiet" })}
              ${button("export-data", "Eksporter projects.json", { data: idData("projects"), style: "quiet" })}
            </div>
          </section>
          <section class="editor-tools-group">
            <h3>Import</h3>
            <div class="button-group">
              ${filePick("all", "Importer alt")}
              ${filePick("songs", "Importer songs.json")}
              ${filePick("projects", "Importer projects.json")}
            </div>
          </section>
          <section class="editor-tools-group">
            <h3>Publisert versjon og utkast</h3>
            <div class="button-group">
              ${button("reload-data", "Hent publiserte data", { symbol: "refresh", style: "quiet", disabled: standalone })}
              ${button("discard-draft", "Forkast lokalt utkast", { style: "danger", disabled: !model.dirty })}
            </div>
          </section>
        </div>
      </details>`;
    renderEditorList();
  }

  function cueInputs(cues, prefix = "") {
    return M.cueFields.map(([key, label]) => `<label class="field-label">${label}<textarea name="${prefix}${key}" rows="2">${esc(cues?.[key])}</textarea></label>`).join("");
  }

  function songForm(id) {
    const item = id ? song(id) : null;
    if (id && !item) return;
    const selected = item?.projects || [model.editorProject === "all" ? model.projects[0].id : model.editorProject];
    const cueOptions = M.cueTypes.map(([code, label]) => `<option value="${esc(code)}">${label}</option>`).join("");
    const energy = item?.energy || "middels";
    const energyOptions = [...new Set(["rolig", "middels", "høy", energy])];
    openDialog(item ? "Rediger låt" : "Ny låt", `<form id="song-form">
      <div class="field-grid">
        <label class="field-label">Tittel<input name="title" id="edit-title" required maxlength="160" value="${esc(item?.title)}"></label>
        <label class="field-label">Artist<input name="artist" required maxlength="160" value="${esc(item?.artist)}"></label>
        <label class="field-label">Startsignal<input name="start" list="cue-types" maxlength="100" value="${esc(item?.start)}" placeholder="F.eks. Tell opp">
          <datalist id="cue-types">${cueOptions}</datalist></label>
        <label class="field-label">Tempo (BPM)<input name="bpm" type="number" min="1" max="400" step="any" value="${item?.bpm ?? ""}"></label>
        <label class="field-label">Energi<select name="energy">${energyOptions.map(value => `<option${value === energy ? " selected" : ""}>${esc(value)}</option>`).join("")}</select></label>
        <label class="field-label">Merkelapper<input name="tags" value="${esc(item?.tags.join(", "))}" placeholder="rock, dans, blues"></label>
        <fieldset class="checkbox-group wide"><legend>Prosjekter</legend>
          ${model.projects.map(p => `<label><input type="checkbox" name="member" value="${esc(p.id)}"${check(selected.includes(p.id))}> ${esc(p.name)}</label>`).join("")}
        </fieldset>
        <label class="field-label wide">Spillenotat for trommesett<textarea name="notes" rows="4">${esc(item?.notes)}</textarea></label>
        <details class="editor-cues wide" ${item?.cues ? "open" : ""}>
          <summary>Inn, underveis og avslutning for trommesett</summary>
          ${cueInputs(item?.cues)}
        </details>
        <details class="editor-cues wide" ${item?.percussionNotes || item?.percussionCues ? "open" : ""}>
          <summary>Perkusjonsnotater</summary>
          <label class="field-label">Spillenotat for perkusjon<textarea name="percussionNotes" rows="4">${esc(item?.percussionNotes)}</textarea></label>
          ${cueInputs(item?.percussionCues, "percussion-")}
        </details>
      </div>
      <div class="dialog-actions">
        ${item ? button("delete-song", "Slett låt", { style: "danger", data: idData(item.id) }) : ""}
        ${button("close-dialog", "Avbryt", { style: "quiet" })}
        <button type="submit" class="button primary">Lagre låt</button>
      </div>
    </form>`, "edit-song", "edit-title");
    $("song-form").onsubmit = event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      const field = name => String(fields.get(name) || "").trim();
      const title = field("title");
      const artist = field("artist");
      if (!title || !artist) return formError("Fyll inn tittel og artist.");
      const bpm = field("bpm");
      const nextSong = {
        ...item, id: item?.id || M.uniqueSlug(`${title} ${artist}`, new Set(model.songs.map(item => item.id))),
        title, artist, bpm: bpm ? Number(bpm) : null, start: field("start"), energy: field("energy"),
        tags: [...new Set(field("tags").split(",").map(tag => tag.trim().toLocaleLowerCase("nb")).filter(Boolean))],
        projects: fields.getAll("member"), notes: field("notes")
      };
      for (const [name, prefix] of [["cues", ""], ["percussionCues", "percussion-"]]) {
        const cues = Object.fromEntries(M.cueFields.map(([key]) => [key, field(prefix + key)]).filter(([, value]) => value));
        if (Object.keys(cues).length) nextSong[name] = cues;
        else delete nextSong[name];
      }
      const percussionNotes = field("percussionNotes");
      if (percussionNotes) nextSong.percussionNotes = percussionNotes;
      else delete nextSong.percussionNotes;
      if (!commit(next => {
        const index = next.songs.findIndex(item => item.id === nextSong.id);
        if (index < 0) next.songs.push(nextSong);
        else next.songs[index] = nextSong;
        next.dirty = true;
      }, item ? "Rediger låt" : "Ny låt")) return;
      suggestions = null;
      closeDialog();
      render();
      notify("Låten er lagret lokalt", { canUndo: true });
    };
  }

  function deleteSong(id) {
    const item = song(id);
    if (!item) return;
    confirmDialog("Slett låten?", `«${item.title}» fjernes fra repertoaret og alle settlister der den står.`, "Slett låt", () => {
      if (!commit(next => {
        next.songs = next.songs.filter(item => item.id !== id);
        for (const p of next.projects) {
          for (const set of p.setlists) {
            const removed = new Set(set.items.filter(item => item.songId === id).map(item => item.entryId));
            set.items = set.items.filter(item => !removed.has(item.entryId));
            const run = next.state.setRuns[p.id]?.[set.id];
            if (!run) continue;
            run.done = run.done.filter(entry => !removed.has(entry));
            if (removed.has(run.active)) run.active = null;
            if (removed.has(run.last)) run.last = null;
          }
        }
        next.dirty = true;
      }, "Slett låt")) return false;
      suggestions = null;
      render();
      notify("Låten er slettet", { canUndo: true });
      return true;
    }, "danger");
  }

  function projectForm(id) {
    const item = model.projects.find(p => p.id === id);
    openDialog(item ? "Rediger prosjekt" : "Nytt prosjekt", `<form id="project-form">
      <label class="field-label">Prosjektnavn<input id="project-name" required maxlength="100" value="${esc(item?.name)}"></label>
      <div class="dialog-actions">
        ${item ? button("delete-project", "Slett prosjekt", { style: "danger", data: idData(item.id), disabled: model.projects.length < 2 }) : ""}
        ${button("close-dialog", "Avbryt", { style: "quiet" })}<button class="button primary" type="submit">Lagre prosjekt</button>
      </div>
    </form>`, "edit-project", "project-name");
    $("project-form").onsubmit = event => {
      event.preventDefault();
      const name = $("project-name").value.trim();
      if (!name) return formError("Skriv inn et prosjektnavn.");
      if (!commit(next => {
        if (item) next.projects.find(p => p.id === id).name = name;
        else {
          const pid = M.uniqueSlug(name, new Set([...next.projects.map(p => p.id), "all", "pubband"]));
          next.projects.push({ id: pid, name, setlists: [{ id: "standard", name: "Standard", items: [] }] });
          next.editorProject = pid;
        }
        next.dirty = true;
      }, item ? "Rediger prosjekt" : "Nytt prosjekt")) return;
      if (!item) { editorTab = "songs"; editorQuery = ""; }
      closeDialog();
      render();
      notify("Prosjektet er lagret lokalt", { canUndo: true });
    };
  }

  function deleteProject(id) {
    const item = model.projects.find(p => p.id === id);
    if (!item || model.projects.length < 2) return;
    const count = model.songs.filter(song => song.projects.includes(id)).length;
    confirmDialog("Slett prosjektet?", `«${item.name}» og settlistene i prosjektet fjernes. De ${count} tilknyttede låtene blir værende i repertoaret.`, "Slett prosjekt", () => {
      if (!commit(next => {
        next.projects = next.projects.filter(p => p.id !== id);
        next.songs.forEach(item => { item.projects = item.projects.filter(pid => pid !== id); });
        if (next.activeProjectId === id) next.activeProjectId = next.projects[0].id;
        if (next.editorProject === id) next.editorProject = "all";
        next.dirty = true;
      }, "Slett prosjekt")) return false;
      suggestions = null;
      reviewId = null;
      render();
      notify("Prosjektet er slettet", { canUndo: true });
      return true;
    }, "danger");
  }

  function download(filename, payload) {
    const objectURL = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = objectURL;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
  }

  function exportFile(kind) {
    if (kind === "songs" || kind === "projects") return download(`${kind}.json`, model[kind]);
    const { songs, projects, state, settings, activeProjectId, editorProject } = model;
    const backup = kind === "backup";
    const filename = backup ? `bak-settet-sikkerhetskopi-${new Date().toISOString().slice(0, 10)}.json` : "bak-settet-data.json";
    download(filename, {
      app: "Bak settet", version, schemaVersion: 2, exportedAt: new Date().toISOString(), songs, projects,
      ...(backup ? { state, settings, activeProjectId, editorProject } : {})
    });
    notify(backup ? "Sikkerhetskopien er klar" : "Data eksportert");
  }

  function applyDataset(next, data) {
    next.songs = data.songs;
    next.projects = data.projects;
    if (!next.projects.some(item => item.id === next.activeProjectId)) next.activeProjectId = next.projects[0].id;
    if (!next.projects.some(item => item.id === next.editorProject)) next.editorProject = "all";
  }

  async function readFile(file, kind) {
    try {
      const raw = JSON.parse(await file.text());
      const songs = kind === "projects" ? model.songs : kind === "songs" && Array.isArray(raw) ? raw : raw?.songs;
      const projects = kind === "songs" ? model.projects : kind === "projects" && Array.isArray(raw) ? raw : raw?.projects;
      const data = M.normalizeDataset({ songs, projects }, { strict: true });
      if (kind === "backup" && (!raw.state || typeof raw.state !== "object" || Array.isArray(raw.state))) {
        throw new Error("Sikkerhetskopien mangler spillehistorikk.");
      }
      function installData() {
        const saved = commit(next => {
          applyDataset(next, data);
          if (kind === "backup") {
            next.state = M.readSession(raw.state, data);
            next.settings = M.readSettings({ ...next.settings, ...raw.settings });
            const importedProject = M.projectId(raw.activeProjectId);
            if (data.projects.some(p => p.id === importedProject)) next.activeProjectId = importedProject;
            if (data.projects.some(p => p.id === raw.editorProject)) next.editorProject = raw.editorProject;
          }
          next.dirty = true;
        }, kind === "backup" ? "Gjenopprett sikkerhetskopi" : "Importer data");
        if (!saved) return false;
        suggestions = null;
        reviewId = null;
        render();
        notify(kind === "backup" ? "Sikkerhetskopien er gjenopprettet" : "Dataene er importert", { canUndo: true });
        return true;
      }
      if (kind === "backup") confirmDialog("Gjenopprett sikkerhetskopien?", "Låter, settlister, spillehistorikk og innstillinger erstattes av sikkerhetskopien.", "Gjenopprett", installData);
      else installData();
    } catch (error) {
      notify(`Importen ble avbrutt. ${error.message}`, { duration: 6000 });
    }
  }

  async function fetchDataset({ fresh = false, timeout = 3000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const load = async name => {
        const url = new URL(name + ".json", location.href);
        if (fresh) url.searchParams.set("__bak_live", String(Date.now()));
        const response = await fetch(url, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`Kunne ikke hente ${name}.json.`);
        const result = await response.json();
        return Array.isArray(result) ? result : result?.[name];
      };
      const [songs, projects] = await Promise.all([load("songs"), load("projects")]);
      return M.normalizeDataset({ songs, projects }, { strict: true });
    } finally { clearTimeout(timer); }
  }

  function requestDataset({ discard = false } = {}) {
    if (discard && standalone) {
      confirmDialog("Forkast det lokale utkastet?", "Låter og settlister tilbakestilles til det som fulgte med forhåndsvisningen.", "Forkast utkast", () => {
        if (!commit(next => {
          applyDataset(next, M.normalizeDataset(window.DrumSeed));
          next.dirty = false;
        }, "Forkast lokalt utkast")) return false;
        suggestions = null;
        reviewId = null;
        render();
        notify("Utkastet er forkastet", { canUndo: true });
        return true;
      }, "danger");
      return;
    }
    const reload = async () => {
      const before = model;
      closeDialog();
      notify("Henter publiserte data …");
      try {
        const data = await fetchDataset({ fresh: true, timeout: 7000 });
        if (model !== before) {
          notify("Dataene endret seg under hentingen. Prøv igjen når du er klar.", { duration: 6000 });
          return;
        }
        if (!commit(next => { applyDataset(next, data); next.dirty = false; }, "Hent publiserte data")) return;
        source = "Publiserte data";
        reviewId = null;
        suggestions = null;
        render();
        notify("Publiserte data er hentet", { canUndo: true });
      } catch (error) {
        notify("Kunne ikke hente publiserte data. Lokale data er beholdt.", { duration: 5600 });
      }
    };
    if (model.dirty || discard) {
      confirmDialog(discard ? "Forkast det lokale utkastet?" : "Hent publiserte data?",
        "Publiserte låter og settlister erstatter lokale endringer når hentingen er ferdig.", discard ? "Forkast utkast" : "Hent publiserte data", () => { reload(); });
    } else reload();
  }

  const updater = standalone ? null : window.DrumUpdates.createUpdater({
    version, channel,
    onStatus(next) { updateStatus = next; renderUpdate(); },
    beforeReload() {
      if (!storageAvailable || !persist(model)) return false;
      stopPulse();
      return true;
    }
  });

  function renderUpdate() {
    const strip = $("release-strip");
    const ready = ["ready", "applying", "error"].includes(updateStatus.status) && updateStatus.candidate;
    const stableLabel = beta ? `<a href="${esc(stableURL.href)}">${esc(publishedLabel)}</a>` : "";
    const channelLabel = beta ? `<strong>Betaversjon ${version}</strong> ${stableLabel}`
      : channel === "preview" ? "<strong>Forhåndsvisning</strong> <span>Åpner med et prøvesett</span>" : "";
    const updateLabel = updateStatus.status === "applying" ? "Oppdaterer …" : "Installer oppdatering";
    strip.hidden = !channelLabel && !ready;
    strip.innerHTML = `${channelLabel}${ready ? `<span>${updateStatus.status === "error" ? esc(updateStatus.message) : `Ny versjon ${esc(updateStatus.candidate)} klar`}</span>
      ${button("apply-update", updateLabel, { style: "primary", disabled: updateStatus.status === "applying" })}` : ""}`;
    if ($("update-status")) $("update-status").textContent = updateStatus.message;
    const checkButton = modal.querySelector('[data-action="check-update"]');
    if (checkButton) checkButton.disabled = standalone || ["checking", "applying", "downloading"].includes(updateStatus.status);
    const applyButton = modal.querySelector('[data-action="apply-update"]');
    if (applyButton) {
      applyButton.hidden = !ready;
      applyButton.disabled = updateStatus.status === "applying";
      applyButton.textContent = updateLabel;
    }
  }

  function newSetAction() {
    if (!commit(nextSet, "Start nytt sett")) return;
    closeDialog();
    render();
    notify(`Sett ${model.state.setNoByProject[project().id]} er startet`, { canUndo: true });
  }

  function setSetting(key, value) {
    if (!Object.hasOwn(model.settings, key)) return;
    if (model.settings[key] === value) return true;
    if (!commit(next => { next.settings[key] = value; })) return false;
    if (key === "pulseHalf" || key === "pulseAccent") {
      if (activeView() === "scene") updateStageMetronome(stageState().song);
    } else if (key === "sceneNotesVisible") updateStageNotesVisibility();
    else if (key === "noteMode") updateNoteMode();
    else if (key === "theme") applyTheme();
    else render();
    return true;
  }

  const actions = {
    settings: () => showSettings(),
    wake: () => showSettings(true),
    context: showContext,
    "choose-mode": setMode,
    "use-setlist": () => setMode("fixed"),
    "find-song": () => showFind("scene"),
    "add-song": () => showFind("add"),
    "add-song-result": addSongToList,
    "pick-fixed": id => selectFixed(id, { navigate: activeView() !== "scene" }),
    "pick-free": selectFree,
    "add-pause": () => nameDialog("pause"),
    "new-list": () => nameDialog("new"),
    "rename-list": () => nameDialog("rename"),
    "clear-list": clearList,
    "move-up": editEntry,
    "move-down": editEntry,
    "remove-entry": editEntry,
    advance,
    previous(id) { reviewId = id; render(); stageTop(true); },
    "song-detail": showSong,
    "restore-song": restoreSong,
    favorite: toggleFavorite,
    filter(id) { filter = id; renderLibraryList(); },
    suggest() { suggestions = null; render(); announce("Nye låtforslag er klare"); },
    notes() { setSetting("sceneNotesVisible", !model.settings.sceneNotesVisible); },
    "note-mode"(id) {
      if (Object.hasOwn(noteModes, id)) setSetting("noteMode", id);
    },
    pulse() {
      const item = stageState().song;
      if (!item?.bpm) return;
      pulseEnabled = !pulseEnabled;
      updateStageMetronome(item);
      if (pulseEnabled) scrollToPlayingSong();
    },
    "half-tempo"() {
      if (!stageState().song?.bpm) return;
      setSetting("pulseHalf", !model.settings.pulseHalf);
    },
    undo: undoLast,
    "new-set": newSetAction,
    "reset-night": resetNight,
    "editor-tab"(id) {
      editorTab = id;
      editorQuery = "";
      render();
      document.querySelector(`[data-action="editor-tab"][data-id="${id}"]`)?.focus({ preventScroll: true });
    },
    "use-editor-project"(id) {
      if (commit(next => { next.editorProject = id; })) { editorTab = "songs"; editorQuery = ""; render(); }
    },
    "edit-song": songForm,
    "delete-song": deleteSong,
    "edit-project": projectForm,
    "delete-project": deleteProject,
    "pick-file": id => $(`file-${id}`)?.click(),
    "export-data": exportFile,
    "export-backup": () => exportFile("backup"),
    "reload-data": () => requestDataset(),
    "discard-draft": () => requestDataset({ discard: true }),
    "close-dialog": closeDialog,
    "check-update": () => updater?.check(),
    "apply-update": () => updater?.apply()
  };

  function bind() {
    $("settings-button").innerHTML = icon("gear");
    modal.querySelector('[data-action="close-dialog"]').innerHTML = icon("close");
    const navIcons = { scene: "drum", settlister: "list", repertoar: "music" };
    document.querySelectorAll("[data-nav]").forEach(link => link.insertAdjacentHTML("afterbegin", icon(navIcons[link.dataset.nav])));
    document.querySelector(".skip-link").onclick = event => {
      event.preventDefault();
      $("content").focus();
    };

    document.addEventListener("click", event => {
      const control = event.target.closest("[data-action]");
      if (!control || control.disabled) return;
      const action = control.dataset.action;
      if (Object.hasOwn(actions, action)) actions[action](control.dataset.id, action);
    });

    document.addEventListener("input", event => {
      if (event.target.id === "library-search") { libraryQuery = event.target.value; renderLibraryList(); }
      else if (event.target.id === "editor-search") { editorQuery = event.target.value; renderEditorList(); }
    });

    document.addEventListener("change", event => {
      const control = event.target;
      const { setting, file } = control.dataset;
      if (setting && !setSetting(setting, control.checked)) control.checked = model.settings[setting];
      if (file && control.files[0]) {
        const selected = control.files[0];
        control.value = "";
        void readFile(selected, file);
      }
      switch (control.dataset.control) {
        case "project":
          if (!changeProject(control.value)) control.value = project().id;
          break;
        case "setlist":
          if (!changeSetlist(control.value)) control.value = setlist().id;
          break;
        case "editor-project":
          if (commit(next => { next.editorProject = control.value; })) {
            renderEditorList();
          } else control.value = model.editorProject;
          break;
        case "theme":
          if (!setSetting("theme", control.value)) control.value = model.settings.theme;
          break;
      }
    });

    modal.addEventListener("close", () => {
      if (modal.open) return;
      modalType = null;
      syncExternal();
      const target = modalOpener?.isConnected ? modalOpener : $("stage-title") || $("page-title");
      target?.focus({ preventScroll: true });
      modalOpener = null;
    });
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        const box = modal.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog();
      }
    });
    window.addEventListener("hashchange", () => {
      closeDialog();
      if (activeView() !== "scene") { reviewId = null; pulseEnabled = false; }
      render();
      stageTop();
      ($("stage-title") || $("page-title"))?.focus({ preventScroll: true });
    });
    window.addEventListener("storage", event => {
      if (event.key === storageKey && event.newValue !== storageText) {
        externalChange = true;
        syncExternal();
      }
    });
    const network = () => { if ($("data-state")) $("data-state").textContent = datasetStatus(); };
    window.addEventListener("online", network);
    window.addEventListener("offline", network);
    document.addEventListener("visibilitychange", () => {
      syncWake();
      syncPulse(activeView() === "scene" ? stageState().song : null);
    });
  }

  async function boot() {
    try { storageText = localStorage.getItem(storageKey); }
    catch { storageAvailable = false; }
    const raw = parse(storageText);
    const initial = raw?.songs && raw?.projects ? raw : legacyRecord();
    model = readRecord(initial);
    source = model.dirty ? "Lokale endringer" : initial?.songs ? "Lagrede data" : "Medfølgende data";
    applyTheme();
    if (!standalone && !model.dirty) {
      try {
        const data = await fetchDataset();
        model = readRecord({ ...initial, ...data, dirty: false });
        source = "Publiserte data";
      } catch {
        // The saved catalog or bundled repertoire is available immediately after this attempt.
      }
    }
    const parallel = getOld(storageKey);
    if (storageAvailable && parallel !== storageText && parse(parallel)?.songs) {
      model = readRecord(parse(parallel));
      storageText = parallel;
      source = model.dirty ? "Lokale endringer" : "Lagrede data";
    }
    persist(model);
    bind();
    render();
    if (!storageAvailable) notify("Lagring er utilgjengelig. Endringer kan lastes ned som sikkerhetskopi.", { duration: 6000 });
    if (updater) void updater.init();
    else {
      updateStatus = { status: "unavailable", message: "Åpne den publiserte appen for å sjekke etter oppdateringer." };
      renderUpdate();
    }
    if (beta) {
      const published = await window.DrumUpdates.readPublishedVersion();
      publishedLabel = published ? `Publisert ${published}` : "Publisert versjon utilgjengelig";
      renderUpdate();
    }
  }

  void boot().catch(error => {
    console.error(error);
    $("view").innerHTML = empty("Bak settet kunne ikke lastes. Prøv å åpne siden på nytt.");
  });
})();
